'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { ArrowLeft, DollarSign, Users, Hash, ExternalLink } from 'lucide-react';
import { SplitService } from '@/database/services/splitService';
import { SplitData } from '@/lib/types';
import { SUPPORTED_CHAINS } from '@/lib/chain-config';

interface SplitDetailsViewProps {
  splitId: string;
  onBack: () => void;
  onContribute: (splitId: string) => void;
}

const SUPPORTED_TOKENS = [
  { symbol: 'ETH', name: 'Ether', decimals: 18 },
  { symbol: 'PYUSD', name: 'PayPal USD', decimals: 6 },
  { symbol: 'USDC', name: 'USD Coin', decimals: 6 },
];

export default function SplitDetailsView({ splitId, onBack, onContribute }: SplitDetailsViewProps) {
  const { address } = useAccount();
  const [splitData, setSplitData] = useState<SplitData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    if (!amount || amount === '0' || amount === '') return '0';

    const tokenInfo = SUPPORTED_TOKENS.find(t => t.symbol === token);
    if (!tokenInfo) return amount;

    try {
      const numAmount = parseFloat(amount) / Math.pow(10, tokenInfo.decimals);
      if (isNaN(numAmount)) return '0';
      return `${numAmount.toLocaleString()} ${token}`;
    } catch {
      return amount;
    }
  };

  // Get chain name
  const getChainName = (chainId: number) => {
    const chain = SUPPORTED_CHAINS.find(c => c.id === chainId);
    return chain ? chain.name : `Chain ${chainId}`;
  };

  // Get progress percentage
  const getProgressPercentage = (current: string, target: string) => {
    const currentNum = parseFloat(current);
    const targetNum = parseFloat(target);
    if (targetNum === 0) return 0;
    return Math.min((currentNum / targetNum) * 100, 100);
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-400/10';
      case 'completed': return 'text-blue-400 bg-blue-400/10';
      case 'pending': return 'text-yellow-400 bg-yellow-400/10';
      case 'cancelled': return 'text-red-400 bg-red-400/10';
      case 'expired': return 'text-gray-400 bg-gray-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  // Check if user can contribute
  const canContribute = () => {
    if (!address || !splitData) return false;
    return splitData.contributors.some((contributor: string) =>
      contributor.toLowerCase() === address.toLowerCase()
    );
  };

  // Format timestamp
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
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

          <div className="max-w-4xl mx-auto">
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

          <div className="max-w-4xl mx-auto text-center py-12">
            <div className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ backgroundColor: 'var(--background)', border: '2px solid #ef4444' }}>
              <Hash className="w-12 h-12 text-red-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--foreground)' }}>Split Not Found</h3>
            <p className="mb-6" style={{ color: 'var(--muted)' }}>{error || 'The requested split could not be found'}</p>
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
  const canUserContribute = canContribute();

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

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>{splitData.description}</h1>
              <div className="flex items-center gap-3">
                <span style={{ color: 'var(--yellow)' }}>{getChainName(splitData.targetChainId)}</span>
              </div>
            </div>

            {canUserContribute && !isCompleted && (
              <button
                onClick={() => onContribute(splitData.splitId)}
                className="flex items-center gap-2 px-6 py-3 text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                <DollarSign className="w-5 h-5" />
                Contribute
              </button>
            )}
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Split Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--background)', border: '1px solid var(--accent)' }}>
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--foreground)' }}>Split Information</h3>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span style={{ color: 'var(--muted)' }}>Split ID</span>
                  <span className="font-mono text-sm" style={{ color: 'var(--foreground)' }}>{splitData.splitId.slice(0, 10)}...</span>
                </div>

                <div className="flex justify-between">
                  <span style={{ color: 'var(--muted)' }}>Creator</span>
                  <span className="font-mono text-sm" style={{ color: 'var(--foreground)' }}>{splitData.creator.slice(0, 6)}...{splitData.creator.slice(-4)}</span>
                </div>

                <div className="flex justify-between">
                  <span style={{ color: 'var(--muted)' }}>Recipient</span>
                  <span className="font-mono text-sm" style={{ color: 'var(--foreground)' }}>{splitData.recipient.slice(0, 6)}...{splitData.recipient.slice(-4)}</span>
                </div>

                <div className="flex justify-between">
                  <span style={{ color: 'var(--muted)' }}>Target Chain</span>
                  <span style={{ color: 'var(--yellow)' }}>{getChainName(splitData.targetChainId)}</span>
                </div>

                <div className="flex justify-between">
                  <span style={{ color: 'var(--muted)' }}>Target Token</span>
                  <span style={{ color: 'var(--foreground)' }}>{splitData.targetToken}</span>
                </div>

                <div className="flex justify-between">
                  <span style={{ color: 'var(--muted)' }}>Created</span>
                  <span style={{ color: 'var(--foreground)' }}>{formatTimestamp(splitData.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Contributors */}
            <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--background)', border: '1px solid var(--accent)' }}>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
                <Users className="w-5 h-5" />
                Contributors ({splitData.contributors.length})
              </h3>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {splitData.contributors.map((contributor, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0" style={{ borderColor: 'var(--accent)' }}>
                    <span className="font-mono text-sm" style={{ color: 'var(--foreground)' }}>
                      {contributor.slice(0, 6)}...{contributor.slice(-4)}
                    </span>
                    <span className="text-sm" style={{ color: 'var(--muted)' }}>
                      {formatAmount(splitData.contributorAmounts[index] || '0', splitData.targetToken)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Transaction Details */}
          {splitData.transactionHash && (
            <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--background)', border: '1px solid var(--accent)' }}>
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--foreground)' }}>Transaction Details</h3>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span style={{ color: 'var(--muted)' }}>Transaction Hash</span>
                  <a
                    href={`${getChainName(splitData.targetChainId).toLowerCase().includes('sepolia') ? 'https://sepolia.etherscan.io' : 'https://etherscan.io'}/tx/${splitData.transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-sm flex items-center gap-1"
                    style={{ color: 'var(--accent)' }}
                  >
                    {splitData.transactionHash.slice(0, 10)}...
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {splitData.blockNumber && (
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--muted)' }}>Block Number</span>
                    <span className="font-mono text-sm" style={{ color: 'var(--foreground)' }}>{splitData.blockNumber}</span>
                  </div>
                )}

                {splitData.gasUsed && (
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--muted)' }}>Gas Used</span>
                    <span className="font-mono text-sm" style={{ color: 'var(--foreground)' }}>{splitData.gasUsed}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
