'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useSendTransaction, useTransactionReceipt } from 'wagmi';
import { ArrowLeft, DollarSign, Loader2, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { SplitService } from '@/database/services/splitService';
import { SplitData } from '@/lib/types';
import TokenChainSelector from './TokenChainSelector';
import { getContractConfig } from '@/lib/contracts';
import { stringToBytes, pad, bytesToHex, hexToBytes } from 'viem';
import { getTokenAddress } from '@/lib/token-config';
import { erc20Abi } from 'viem';

interface ContributionFlowProps {
  splitId: string;
  onBack: () => void;
  onContributionComplete: () => void;
}

const SUPPORTED_TOKENS = [
  { symbol: 'ETH', name: 'Ethereum', decimals: 18 },
  { symbol: 'PYUSD', name: 'PayPal USD', decimals: 6 },
  { symbol: 'USDC', name: 'USD Coin', decimals: 6 },
];

type ContributionStep = 'select' | 'confirm' | 'processing' | 'success' | 'error';

// Helper function to convert splitId to bytes32
function convertToBytes32(input: string): `0x${string}` {
  // Check if input is already a hex string (starts with 0x)
  if (input.startsWith('0x')) {
    // Parse as hex and pad to 32 bytes
    const bytes = hexToBytes(input as `0x${string}`);
    const paddedBytes = pad(bytes, { size: 32 });
    return bytesToHex(paddedBytes);
  } else {
    // Treat as regular string
    const bytes = stringToBytes(input);
    const paddedBytes = pad(bytes, { size: 32 });
    return bytesToHex(paddedBytes);
  }
}

export default function ContributionFlow({
  splitId,
  onBack,
  onContributionComplete
}: ContributionFlowProps) {
  const { address } = useAccount();
  const { writeContractAsync, data: hash, isPending, error } = useWriteContract();
  const { sendTransaction: sendEthTransaction, data: ethTxHash, isPending: isEthPending } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess, isError: isReceiptError, error: receiptError } = useWaitForTransactionReceipt({
    hash,
  });
  const { isLoading: isEthConfirming, isSuccess: isEthSuccess } = useTransactionReceipt({
    hash: ethTxHash,
  });

  const [splitData, setSplitData] = useState<SplitData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Contribution form state
  const [selectedChainId, setSelectedChainId] = useState(11155111); // Ethereum Sepolia default
  const [selectedToken, setSelectedToken] = useState('ETH');
  const [contributionAmount, setContributionAmount] = useState('');
  const [step, setStep] = useState<ContributionStep>('select');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchSplitData = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);
        const data = await SplitService.getSplitById(splitId);
        setSplitData(data);
      } catch (err) {
        console.error('Failed to fetch split data:', err);
        setLoadError('Failed to load split details');
      } finally {
        setIsLoading(false);
      }
    };

    if (splitId) {
      fetchSplitData();
    }
  }, [splitId]);

  // Update step based on transaction status (for both ERC20 and ETH)
  useEffect(() => {
    const isProcessing = isPending || isConfirming || isEthPending || isEthConfirming;
    const isSuccessState = isSuccess || isEthSuccess;
    const hasError = error || isReceiptError;

    if (isProcessing) {
      setStep('processing');
    } else if (isSuccessState) {
      setStep('success');
      setTxHash(hash || ethTxHash || null);
      setTimeout(() => {
        onContributionComplete();
      }, 3000);
    } else if (hasError) {
      setStep('error');
      const errorMsg = error?.message || receiptError?.message || 'Transaction failed';
      setErrorMessage(errorMsg);
    }
  }, [isPending, isConfirming, isSuccess, isReceiptError, error, receiptError, hash, ethTxHash, isEthPending, isEthConfirming, isEthSuccess, onContributionComplete]);

  // Format amount
  const formatAmount = (amount: string, token: string) => {
    const tokenInfo = SUPPORTED_TOKENS.find(t => t.symbol === token);
    if (!tokenInfo || !amount) return '';

    const numAmount = parseFloat(amount) / Math.pow(10, tokenInfo.decimals);
    return `${numAmount.toLocaleString()} ${token}`;
  };

  // Get progress percentage
  const getProgressPercentage = (current: string, target: string) => {
    const currentNum = parseFloat(current);
    const targetNum = parseFloat(target);
    if (targetNum === 0) return 0;
    return Math.min((currentNum / targetNum) * 100, 100);
  };

  // Validate contribution amount
  const validateContribution = () => {
    if (!contributionAmount || parseFloat(contributionAmount) <= 0) {
      setErrorMessage('Please enter a valid contribution amount');
      return false;
    }
    return true;
  };

  // Handle contribution submission
  const handleContribute = async () => {
    if (!validateContribution() || !splitData || !address) {
      return;
    }

    try {
      setStep('processing');
      setErrorMessage(null);

      // Convert amount to wei/smallest unit
      const tokenInfo = SUPPORTED_TOKENS.find(t => t.symbol === selectedToken);
      if (!tokenInfo) {
        throw new Error('Invalid token selected');
      }

      const amountInWei = (parseFloat(contributionAmount) * Math.pow(10, tokenInfo.decimals)).toString();

      // Get contract config for target chain
      const contractConfig = getContractConfig(splitData.targetChainId);

      let transferTxHash = '';

      if (selectedToken === 'ETH') {
        // Send ETH directly to the contract address
        await sendEthTransaction({
          to: contractConfig.address as `0x${string}`,
          value: BigInt(amountInWei),
        });
        transferTxHash = ethTxHash || '';
        console.log('ETH sent to contract:', transferTxHash);
      } else {
        // For ERC20 tokens, first approve then transfer
        const tokenAddress = getTokenAddress(selectedToken, splitData.targetChainId);

        if (!tokenAddress || tokenAddress === '0x0000000000000000000000000000000000000000') {
          throw new Error(`Token ${selectedToken} not available on this chain`);
        }

        // Approve the split contract to spend the tokens
        const approveAmount = BigInt(amountInWei);
        await writeContractAsync({
          address: tokenAddress as `0x${string}`,
          abi: erc20Abi,
          functionName: 'approve',
          args: [
            contractConfig.address as `0x${string}`,
            approveAmount
          ],
        });

        // Wait for approval confirmation
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Transfer tokens to the contract
        const transferResult = await writeContractAsync({
          address: tokenAddress as `0x${string}`,
          abi: erc20Abi,
          functionName: 'transfer',
          args: [
            contractConfig.address as `0x${string}`,
            BigInt(amountInWei)
          ],
        });

        transferTxHash = transferResult;
        console.log('Token transfer result:', transferResult);
      }

      // Now call the owner API to record the contribution
      try {
        const response = await fetch('/api/contributions/record', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            splitId: splitId,
            contributor: address,
            sourceChainId: selectedChainId,
            sourceAmount: amountInWei,
            targetAmount: amountInWei,
            txHash: transferTxHash,
            chainId: splitData.targetChainId,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to record contribution');
        }

        const result = await response.json();
        console.log('Contribution recorded:', result);
      } catch (apiError) {
        console.error('Failed to record contribution via owner API:', apiError);
        // Continue anyway - the funds were sent
      }

    } catch (err) {
      console.error('Contribution failed:', err);
      setErrorMessage(err instanceof Error ? err.message : 'Contribution failed');
      setStep('error');
    }
  };

  // Reset form
  const resetForm = () => {
    setContributionAmount('');
    setSelectedToken('ETH');
    setSelectedChainId(11155111);
    setStep('select');
    setErrorMessage(null);
    setTxHash(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <button
              onClick={onBack}
              className="flex items-center gap-2 transition-colors"
              style={{ color: 'var(--muted)' }}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Splits</span>
            </button>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="rounded-lg p-8 animate-pulse" style={{ backgroundColor: 'var(--background)', border: '1px solid var(--accent)' }}>
              <div className="h-8 rounded mb-4" style={{ backgroundColor: 'var(--background)' }} />
              <div className="h-4 rounded mb-2" style={{ backgroundColor: 'var(--background)' }} />
              <div className="h-4 rounded mb-6" style={{ backgroundColor: 'var(--background)' }} />
              <div className="h-32 rounded" style={{ backgroundColor: 'var(--background)' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loadError || !splitData) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Splits</span>
            </button>
          </div>

          <div className="max-w-2xl mx-auto text-center py-12">
            <div className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ backgroundColor: 'var(--background)', border: '2px solid #ef4444' }}>
              <XCircle className="w-12 h-12 text-red-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--foreground)' }}>Split Not Found</h3>
            <p className="mb-6" style={{ color: 'var(--muted)' }}>{loadError || 'The requested split could not be found'}</p>
            <button
              onClick={onBack}
              className="px-6 py-3 text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              Back to Splits
            </button>
          </div>
        </div>
      </div>
    );
  }

  const progressPercentage = getProgressPercentage(splitData.currentAmount, splitData.targetAmount);
  const isCompleted = splitData.status === 'completed';

  if (isCompleted) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <button
              onClick={onBack}
              className="flex items-center gap-2 transition-colors"
              style={{ color: 'var(--muted)' }}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Splits</span>
            </button>
          </div>

          <div className="max-w-2xl mx-auto text-center py-12">
            <div className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ backgroundColor: 'var(--background)', border: '2px solid #10b981' }}>
              <CheckCircle className="w-12 h-12 text-green-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--foreground)' }}>Split Completed</h3>
            <p className="mb-6" style={{ color: 'var(--muted)' }}>This split has already been completed and no longer accepts contributions.</p>
            <button
              onClick={onBack}
              className="px-6 py-3 text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              Back to Splits
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 transition-colors mb-4"
            style={{ color: 'var(--muted)' }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Splits</span>
          </button>
        </div>

        <div className="max-w-2xl mx-auto space-y-6">

          {/* Contribution Form */}
          {step === 'select' && (
            <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--background)', border: '1px solid var(--accent)' }}>
              <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--foreground)' }}>Select Contribution Method</h2>

              <div className="space-y-6">
                <TokenChainSelector
                  selectedChainId={selectedChainId}
                  selectedToken={selectedToken}
                  onChainChange={setSelectedChainId}
                  onTokenChange={setSelectedToken}
                  disabled={false}
                />

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                    Contribution Amount
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.000001"
                      min="0"
                      value={contributionAmount}
                      onChange={(e) => setContributionAmount(e.target.value)}
                      placeholder="Enter amount to contribute"
                      className="w-full px-4 py-3 text-white rounded-lg border focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      style={{ backgroundColor: 'var(--background)', borderColor: 'var(--accent)' }}
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm" style={{ color: 'var(--muted)' }}>
                      {selectedToken}
                    </div>
                  </div>
                </div>

                {errorMessage && (
                  <div className="text-red-400 text-sm">{errorMessage}</div>
                )}

                <button
                  onClick={handleContribute}
                  disabled={!contributionAmount || parseFloat(contributionAmount) <= 0 || isPending}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity font-medium"
                  style={{ backgroundColor: 'var(--accent)' }}
                >
                  <DollarSign className="w-5 h-5" />
                  {isPending ? 'Processing...' : `Contribute ${contributionAmount} ${selectedToken}`}
                </button>
              </div>
            </div>
          )}

          {/* Processing State */}
          {step === 'processing' && (
            <div className="rounded-lg p-6 text-center" style={{ backgroundColor: 'var(--background)', border: '1px solid var(--accent)' }}>
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: 'var(--background)', border: '2px solid var(--accent)' }}>
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--accent)' }} />
              </div>
              <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--foreground)' }}>Processing Contribution</h2>
              <p style={{ color: 'var(--muted)' }}>Please wait while we process your contribution...</p>
            </div>
          )}

          {/* Success State */}
          {step === 'success' && (
            <div className="rounded-lg p-6 text-center" style={{ backgroundColor: 'var(--background)', border: '1px solid var(--accent)' }}>
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: 'var(--background)', border: '2px solid #10b981' }}>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--foreground)' }}>Contribution Successful!</h2>
              <p className="mb-4" style={{ color: 'var(--muted)' }}>Your contribution has been processed successfully.</p>

              {txHash && (
                <div className="mb-4">
                  <p className="text-sm mb-2" style={{ color: 'var(--muted)' }}>Transaction Hash:</p>
                  <a
                    href={`https://sepolia.etherscan.io/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-sm flex items-center justify-center gap-1"
                    style={{ color: 'var(--accent)' }}
                  >
                    {txHash.slice(0, 10)}...
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              <div className="flex gap-3 justify-center">
                <button
                  onClick={resetForm}
                  className="px-6 py-3 text-white rounded-lg hover:opacity-80 transition-opacity"
                  style={{ backgroundColor: 'var(--background)', border: '1px solid var(--accent)' }}
                >
                  Contribute Again
                </button>
                <button
                  onClick={onBack}
                  className="px-6 py-3 text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
                  style={{ backgroundColor: 'var(--accent)' }}
                >
                  Back to Splits
                </button>
              </div>
            </div>
          )}

          {/* Error State */}
          {step === 'error' && (
            <div className="rounded-lg p-6 text-center" style={{ backgroundColor: 'var(--background)', border: '1px solid var(--accent)' }}>
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: 'var(--background)', border: '2px solid #ef4444' }}>
                <XCircle className="w-8 h-8 text-red-400" />
              </div>
              <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--foreground)' }}>Contribution Failed</h2>
              <p className="mb-4" style={{ color: 'var(--muted)' }}>{errorMessage}</p>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={resetForm}
                  className="px-6 py-3 text-white rounded-lg hover:opacity-80 transition-opacity"
                  style={{ backgroundColor: 'var(--background)', border: '1px solid var(--accent)' }}
                >
                  Try Again
                </button>
                <button
                  onClick={onBack}
                  className="px-6 py-3 text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
                  style={{ backgroundColor: 'var(--accent)' }}
                >
                  Back to Splits
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}