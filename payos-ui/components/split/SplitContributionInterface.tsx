'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { ArrowLeft, DollarSign, Loader2, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { SplitService } from '@/database/services/splitService';
import { SplitData } from '@/lib/types';
import { useAvailNexus } from '@/hooks/useAvailNexus';
import TokenChainSelector from './TokenChainSelector';

interface SplitContributionInterfaceProps {
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

export default function SplitContributionInterface({ 
  splitId, 
  onBack, 
  onContributionComplete 
}: SplitContributionInterfaceProps) {
  const { address } = useAccount();
  const { 
    bridgeAndExecute, 
    isInitialized: nexusInitialized, 
    isLoading: nexusLoading,
    error: nexusError,
    clearError: clearNexusError 
  } = useAvailNexus();
  
  const [splitData, setSplitData] = useState<SplitData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
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
        setError(null);
        const data = await SplitService.getSplitById(splitId);
        setSplitData(data);
      } catch (err) {
        console.error('Failed to fetch split data:', err);
        setError('Failed to load split details');
      } finally {
        setIsLoading(false);
      }
    };

    if (splitId) {
      fetchSplitData();
    }
  }, [splitId]);

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
    if (!validateContribution() || !splitData || !address || !nexusInitialized) {
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

      // Call Avail Nexus SDK to bridge and execute
      const result = await bridgeAndExecute({
        splitId: splitData.splitId,
        contributor: address,
        sourceToken: selectedToken,
        sourceAmount: amountInWei,
        sourceChainId: selectedChainId,
        targetToken: splitData.targetToken,
        targetAmount: splitData.targetAmount,
        targetChainId: splitData.targetChainId,
        contractAddress: process.env.NEXT_PUBLIC_SPLIT_CONTRACT_ADDRESS || '0xSplitContract',
        contractAbi: [] // This should be the actual contract ABI
      });

      if (result.success) {
        setTxHash(result.transactionHash || 'Unknown');
        setStep('success');
        // Refresh split data after successful contribution
        setTimeout(() => {
          onContributionComplete();
        }, 3000);
      } else {
        throw new Error(result.error || 'Contribution failed');
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
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Splits</span>
            </button>
          </div>
          
          <div className="max-w-2xl mx-auto">
            <div className="bg-gray-800 rounded-lg p-8 animate-pulse">
              <div className="h-8 bg-gray-700 rounded mb-4" />
              <div className="h-4 bg-gray-700 rounded mb-2" />
              <div className="h-4 bg-gray-700 rounded mb-6" />
              <div className="h-32 bg-gray-700 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show Avail Nexus SDK loading state
  if (nexusLoading) {
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
            <div className="w-24 h-24 bg-blue-900/20 rounded-full mx-auto mb-6 flex items-center justify-center">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Initializing Avail Nexus SDK</h2>
            <p className="text-gray-400 mb-2">Setting up cross-chain capabilities...</p>
            <p className="text-gray-500 text-sm">This may take a few seconds</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !splitData) {
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
            <div className="w-24 h-24 bg-red-900/20 rounded-full mx-auto mb-6 flex items-center justify-center">
              <XCircle className="w-12 h-12 text-red-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Split Not Found</h3>
            <p className="text-gray-400 mb-6">{error || 'The requested split could not be found'}</p>
            <button
              onClick={onBack}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Splits
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!nexusInitialized) {
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
            <div className="w-24 h-24 bg-red-900/20 rounded-full mx-auto mb-6 flex items-center justify-center">
              <XCircle className="w-12 h-12 text-red-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Avail Nexus SDK Not Initialized</h3>
            <p className="text-gray-400 mb-4">
              {nexusError || 'The Avail Nexus SDK failed to initialize. This is required for cross-chain contributions.'}
            </p>
            <div className="space-y-3">
              <button
                onClick={() => {
                  clearNexusError();
                  window.location.reload();
                }}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Retry Initialization
              </button>
              <button
                onClick={onBack}
                className="w-full px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Back to Splits
              </button>
            </div>
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
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Splits</span>
            </button>
          </div>
          
          <div className="max-w-2xl mx-auto text-center py-12">
            <div className="w-24 h-24 bg-green-900/20 rounded-full mx-auto mb-6 flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Split Completed</h3>
            <p className="text-gray-400 mb-6">This split has already been completed and no longer accepts contributions.</p>
            <button
              onClick={onBack}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Splits</span>
          </button>
          
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Contribute to Split</h1>
            <p className="text-gray-400">{splitData.description}</p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto space-y-6">
          {/* Split Progress */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4">Split Progress</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Amount Raised</span>
                <span className="text-white font-medium">
                  {formatAmount(splitData.currentAmount, splitData.targetToken)} / {formatAmount(splitData.targetAmount, splitData.targetToken)}
                </span>
              </div>
              
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div
                  className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                />
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Progress</span>
                <span className="text-white font-medium">{progressPercentage.toFixed(1)}%</span>
              </div>
            </div>
          </div>

          {/* Contribution Form */}
          {step === 'select' && (
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-4">Select Payment Method</h2>
              
              <div className="space-y-6">
                <TokenChainSelector
                  selectedChainId={selectedChainId}
                  selectedToken={selectedToken}
                  onChainChange={setSelectedChainId}
                  onTokenChange={setSelectedToken}
                  disabled={false}
                />
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
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
                      className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                      {selectedToken}
                    </div>
                  </div>
                </div>
                
                {errorMessage && (
                  <div className="text-red-400 text-sm">{errorMessage}</div>
                )}
                
                <button
                  onClick={handleContribute}
                  disabled={!contributionAmount || parseFloat(contributionAmount) <= 0}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <DollarSign className="w-5 h-5" />
                  Contribute {contributionAmount} {selectedToken}
                </button>
              </div>
            </div>
          )}

          {/* Processing State */}
          {step === 'processing' && (
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 text-center">
              <div className="w-16 h-16 bg-blue-900/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Processing Contribution</h2>
              <p className="text-gray-400">Please wait while we process your contribution through the Avail Nexus SDK...</p>
            </div>
          )}

          {/* Success State */}
          {step === 'success' && (
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 text-center">
              <div className="w-16 h-16 bg-green-900/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Contribution Successful!</h2>
              <p className="text-gray-400 mb-4">Your contribution has been processed successfully.</p>
              
              {txHash && (
                <div className="mb-4">
                  <p className="text-sm text-gray-400 mb-2">Transaction Hash:</p>
                  <a
                    href={`https://sepolia.etherscan.io/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 font-mono text-sm flex items-center justify-center gap-1"
                  >
                    {txHash.slice(0, 10)}...
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
              
              <div className="flex gap-3 justify-center">
                <button
                  onClick={resetForm}
                  className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Contribute Again
                </button>
                <button
                  onClick={onBack}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Back to Splits
                </button>
              </div>
            </div>
          )}

          {/* Error State */}
          {step === 'error' && (
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 text-center">
              <div className="w-16 h-16 bg-red-900/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                <XCircle className="w-8 h-8 text-red-400" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Contribution Failed</h2>
              <p className="text-gray-400 mb-4">{errorMessage}</p>
              
              <div className="flex gap-3 justify-center">
                <button
                  onClick={resetForm}
                  className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={onBack}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
