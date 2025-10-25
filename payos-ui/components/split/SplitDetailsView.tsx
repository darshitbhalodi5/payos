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
    const tokenInfo = SUPPORTED_TOKENS.find(t => t.symbol === token);
    if (!tokenInfo || !amount) return '';
    
    const numAmount = parseFloat(amount) / Math.pow(10, tokenInfo.decimals);
    return `${numAmount.toLocaleString()} ${token}`;
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
            <div className="w-24 h-24 bg-red-900/20 rounded-full mx-auto mb-6 flex items-center justify-center">
              <Hash className="w-12 h-12 text-red-400" />
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
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Splits</span>
          </button>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{splitData.description}</h1>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(splitData.status)}`}>
                  {splitData.status.toUpperCase()}
                </span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-400">{getChainName(splitData.targetChainId)}</span>
              </div>
            </div>
            
            {canUserContribute && !isCompleted && (
              <button
                onClick={() => onContribute(splitData.splitId)}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <DollarSign className="w-5 h-5" />
                Contribute
              </button>
            )}
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Progress Card */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4">Progress</h2>
            
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

          {/* Split Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Split Information</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Split ID</span>
                  <span className="text-white font-mono text-sm">{splitData.splitId.slice(0, 10)}...</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Creator</span>
                  <span className="text-white font-mono text-sm">{splitData.creator.slice(0, 6)}...{splitData.creator.slice(-4)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Recipient</span>
                  <span className="text-white font-mono text-sm">{splitData.recipient.slice(0, 6)}...{splitData.recipient.slice(-4)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Target Chain</span>
                  <span className="text-white">{getChainName(splitData.targetChainId)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Target Token</span>
                  <span className="text-white">{splitData.targetToken}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Created</span>
                  <span className="text-white">{formatTimestamp(splitData.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Contributors */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Contributors ({splitData.contributors.length})
              </h3>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {splitData.contributors.map((contributor, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-gray-700 last:border-b-0">
                    <span className="text-white font-mono text-sm">
                      {contributor.slice(0, 6)}...{contributor.slice(-4)}
                    </span>
                    <span className="text-gray-400 text-sm">
                      {formatAmount(splitData.contributorAmounts[index] || '0', splitData.targetToken)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Transaction Details */}
          {splitData.transactionHash && (
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Transaction Details</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Transaction Hash</span>
                  <a
                    href={`${getChainName(splitData.targetChainId).toLowerCase().includes('sepolia') ? 'https://sepolia.etherscan.io' : 'https://etherscan.io'}/tx/${splitData.transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 font-mono text-sm flex items-center gap-1"
                  >
                    {splitData.transactionHash.slice(0, 10)}...
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                
                {splitData.blockNumber && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Block Number</span>
                    <span className="text-white font-mono text-sm">{splitData.blockNumber}</span>
                  </div>
                )}
                
                {splitData.gasUsed && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Gas Used</span>
                    <span className="text-white font-mono text-sm">{splitData.gasUsed}</span>
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
