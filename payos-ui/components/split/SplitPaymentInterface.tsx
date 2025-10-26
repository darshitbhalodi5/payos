'use client';

import { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import TokenChainSelector from './TokenChainSelector';
import { useSplitContract } from '@/hooks/useSplitContract';
import {
  getTokenInfo,
  validateTokenSelection,
} from '@/lib/token-config';
import { SUPPORTED_CHAINS, validateChainSelection } from '@/lib/chain-config';

interface SplitData {
  id: string;
  creator: string;
  recipient: string;
  targetChainId: number;
  targetToken: string;
  targetAmount: string;
  currentAmount: string;
  description: string;
  status: 'active' | 'completed';
  contributions: Contribution[];
}

interface Contribution {
  contributor: string;
  sourceChainId: number;
  sourceToken: string;
  sourceAmount: string;
  targetAmount: string;
  txHash: string;
  timestamp: number;
  status: 'pending' | 'completed' | 'failed';
}

interface SplitPaymentInterfaceProps {
  splitId: string;
  onPaymentComplete: () => void;
}

export default function SplitPaymentInterface({ splitId, onPaymentComplete }: SplitPaymentInterfaceProps) {
  const { user } = usePrivy();
  const { contributeToSplit, error: contractError } = useSplitContract();
  const [splitData, setSplitData] = useState<SplitData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedChainId, setSelectedChainId] = useState(1); // Ethereum default
  const [selectedToken, setSelectedToken] = useState('ETH');
  const [contributionAmount, setContributionAmount] = useState('');
  const [isContributing, setIsContributing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch split data from contract
  useEffect(() => {
    const fetchSplitData = async () => {
      setIsLoading(true);
      try {
        // For now, use mock data - replace with actual contract call
        const mockData = {
          id: splitId,
          creator: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8a9b',
          recipient: '0x8f3a2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b',
          targetChainId: 42161,
          targetToken: 'PYUSD',
          targetAmount: '1000000000', // 1000 PYUSD
          currentAmount: '500000000', // 500 PYUSD
          description: 'Dinner at Joe\'s Restaurant',
          status: 'active' as const,
          contributors: [
            {
              contributor: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8a9b',
              targetAmount: '500000000',
              contributedAmount: '250000000',
              hasContributed: true,
              lastContributionTime: Date.now() - 2 * 60 * 60 * 1000
            },
            {
              contributor: '0x5e7b9f4a2c1d3e5f6a7b8c9d0e1f2a3b4c5d6e7f8a',
              targetAmount: '500000000',
              contributedAmount: '250000000',
              hasContributed: true,
              lastContributionTime: Date.now() - 1 * 60 * 60 * 1000
            }
          ],
          contributions: [
            {
              contributor: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8a9b',
              sourceChainId: 1,
              sourceToken: 'ETH',
              sourceAmount: '2000000000000000000', // 2 ETH
              targetAmount: '250000000', // 250 PYUSD
              txHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
              timestamp: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
              status: 'completed' as const,
            },
            {
              contributor: '0x5e7b9f4a2c1d3e5f6a7b8c9d0e1f2a3b4c5d6e7f8a',
              sourceChainId: 137,
              sourceToken: 'USDC',
              sourceAmount: '250000000', // 250 USDC
              targetAmount: '250000000', // 250 PYUSD
              txHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
              timestamp: Date.now() - 1 * 60 * 60 * 1000, // 1 hour ago
              status: 'completed' as const,
            },
          ],
        };

        setSplitData(mockData);

        // TODO: Replace with actual contract call
        // const data = await getSplitData(splitId, 42161); // Assuming Arbitrum
        // setSplitData(data);
      } catch (error) {
        console.error('Failed to fetch split data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSplitData();
  }, [splitId]);

  const validateContribution = () => {
    const newErrors: Record<string, string> = {};

    // Validate chain selection
    if (!validateChainSelection(selectedChainId)) {
      newErrors.chain = 'Please select a supported chain';
    }

    // Validate token selection
    if (!validateTokenSelection(selectedToken, selectedChainId)) {
      newErrors.token = 'Selected token is not available on this chain';
    }

    // Validate amount
    const amount = parseFloat(contributionAmount);
    if (!contributionAmount || isNaN(amount) || amount <= 0) {
      newErrors.amount = 'Please enter a valid contribution amount';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContribution = async () => {
    if (!user?.wallet?.address || !splitData) return;

    if (!validateContribution()) {
      return;
    }

    // Validation passed, proceed with contribution

    setIsContributing(true);

    try {
      // Calculate target amount (simplified - in production, use price feeds)
      const targetAmount = contributionAmount; // 1:1 for now

      // Use the contract hook to contribute
      const txHash = await contributeToSplit({
        splitId: splitId,
        sourceChainId: selectedChainId,
        sourceToken: selectedToken,
        sourceAmount: contributionAmount,
        targetChainId: splitData.targetChainId,
        targetToken: splitData.targetToken,
        targetAmount: targetAmount
      });

      console.log('Contribution successful:', txHash);

      // Update local state (in production, this would come from contract events)
      setSplitData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          currentAmount: (parseInt(prev.currentAmount) + parseInt(targetAmount)).toString(),
          contributions: [
            ...prev.contributions,
            {
              contributor: user?.wallet?.address || '',
              sourceChainId: selectedChainId,
              sourceToken: selectedToken,
              sourceAmount: contributionAmount,
              targetAmount: targetAmount,
              txHash: txHash,
              timestamp: Date.now(),
              status: 'completed' as const,
            }
          ]
        };
      });

      setContributionAmount('');
      onPaymentComplete();
    } catch (error) {
      console.error('Failed to contribute:', error);
      // Error is already handled by the hook
    } finally {
      setIsContributing(false);
    }
  };

  const formatAmount = (amount: string, token: string) => {
    const tokenInfo = getTokenInfo(token);
    if (!tokenInfo || !amount) return '';

    const numAmount = parseInt(amount) / Math.pow(10, tokenInfo.decimals);
    return `${numAmount.toLocaleString()} ${token}`;
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getProgressPercentage = () => {
    if (!splitData) return 0;
    const current = parseInt(splitData.currentAmount);
    const target = parseInt(splitData.targetAmount);
    return Math.min((current / target) * 100, 100);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--background)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading split details...</p>
        </div>
      </div>
    );
  }

  if (!splitData) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--background)' }}>
        <div className="text-center">
          <p className="text-red-400">Split not found</p>
        </div>
      </div>
    );
  }

  const progressPercentage = getProgressPercentage();
  const isCompleted = splitData.status === 'completed';

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      <div className="container mx-auto px-4 py-8">
        {/* Split Header */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-white">{splitData.description}</h1>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${isCompleted
                ? 'bg-green-500/20 text-green-400'
                : 'bg-blue-500/20 text-blue-400'
              }`}>
              {isCompleted ? 'Completed' : 'Active'}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Recipient:</span>
              <div className="text-white font-mono">
                {splitData.recipient.slice(0, 6)}...{splitData.recipient.slice(-4)}
              </div>
            </div>
            <div>
              <span className="text-gray-400">Target Chain:</span>
              <div className="text-white">
                {SUPPORTED_CHAINS.find(c => c.id === splitData.targetChainId)?.name || 'Unknown'}
              </div>
            </div>
            <div>
              <span className="text-gray-400">Target Token:</span>
              <div className="text-white">{splitData.targetToken}</div>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-white">Progress</h2>
            <span className="text-gray-400">
              {formatAmount(splitData.currentAmount, splitData.targetToken)} / {formatAmount(splitData.targetAmount, splitData.targetToken)}
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
            <div
              className="bg-blue-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <div className="text-sm text-gray-400">
            {progressPercentage.toFixed(1)}% complete
          </div>
        </div>

        {/* Contribution Form */}
        {!isCompleted && (
          <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
            <h2 className="text-lg font-semibold text-white mb-4">Make a Contribution</h2>

            <div className="space-y-4">
              {/* Chain & Token Selection */}
              <TokenChainSelector
                selectedChainId={selectedChainId}
                selectedToken={selectedToken}
                onChainChange={setSelectedChainId}
                onTokenChange={setSelectedToken}
                label="Select Your Payment Method"
              />
              {(errors.chain || errors.token) && (
                <p className="text-red-400 text-xs">{errors.chain || errors.token}</p>
              )}

              {/* Amount Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Contribution Amount
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={contributionAmount}
                    onChange={(e) => setContributionAmount(e.target.value)}
                    placeholder="0.0"
                    min="0"
                    step="0.01"
                    className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.amount ? 'border-red-500' : 'border-gray-600'
                      }`}
                  />
                  <div className="absolute right-3 top-2 text-sm text-gray-400">
                    {selectedToken}
                  </div>
                </div>
                {errors.amount && (
                  <p className="text-red-400 text-xs mt-1">{errors.amount}</p>
                )}
              </div>

              {/* Error Display */}
              {contractError && (
                <div className="bg-red-500/10 border border-red-500 rounded-lg p-3">
                  <p className="text-red-400 text-sm">{contractError}</p>
                </div>
              )}

              {/* Contribution Button */}
              <button
                onClick={handleContribution}
                disabled={isContributing || !contributionAmount}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isContributing ? 'Processing...' : 'Contribute'}
              </button>
            </div>
          </div>
        )}

        {/* Contributions History */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-4">Contributions</h2>

          {splitData.contributions.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No contributions yet</p>
          ) : (
            <div className="space-y-3">
              {splitData.contributions.map((contribution, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white">
                      {contribution.contributor.slice(0, 6)}...{contribution.contributor.slice(-4)}
                    </div>
                    <div className="text-xs text-gray-400">
                      {SUPPORTED_CHAINS.find(c => c.id === contribution.sourceChainId)?.name} • {contribution.sourceToken}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatTime(contribution.timestamp)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-white">
                      {formatAmount(contribution.targetAmount, splitData.targetToken)}
                    </div>
                    <div className={`text-xs ${contribution.status === 'completed' ? 'text-green-400' :
                        contribution.status === 'pending' ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                      {contribution.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}