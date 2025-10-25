'use client';

import { useState } from 'react';
import { useSplitsData } from '@/hooks/useSplitsData';

interface SplitListProps {
  onSplitSelect: (splitId: string) => void;
  onCreateSplit: () => void;
}

const SUPPORTED_CHAINS = [
  { id: 11155111, name: 'Ethereum Sepolia', symbol: 'ETH' },
  { id: 80002, name: 'Polygon Amoy', symbol: 'POL' },
  { id: 421614, name: 'Arbitrum Sepolia', symbol: 'ARB' },
  { id: 11155420, name: 'Optimism Sepolia', symbol: 'OP' },
  { id: 84532, name: 'Base Sepolia', symbol: 'BASE' },
];

const SUPPORTED_TOKENS = [
  { symbol: 'PYUSD', name: 'PayPal USD', decimals: 6 },
  { symbol: 'USDC', name: 'USD Coin', decimals: 6 },
  { symbol: 'USDT', name: 'Tether USD', decimals: 6 },
];

export default function SplitList({ onSplitSelect, onCreateSplit }: SplitListProps) {
  const { 
    splits, 
    isLoading, 
    error, 
    getSplitsByStatus, 
    getCreatedSplits, 
    getReceivedSplits,
    refreshSplits 
  } = useSplitsData();
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'my-created' | 'my-received'>('all');

  const getFilteredSplits = () => {
    switch (filter) {
      case 'active':
        return getSplitsByStatus('active');
      case 'completed':
        return getSplitsByStatus('completed');
      case 'my-created':
        return getCreatedSplits();
      case 'my-received':
        return getReceivedSplits();
      default:
        return splits;
    }
  };

  const filteredSplits = getFilteredSplits();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatAmount = (amount: string, token: string) => {
    const tokenInfo = SUPPORTED_TOKENS.find(t => t.symbol === token);
    if (!tokenInfo || !amount) return '';
    
    const numAmount = parseFloat(amount) / Math.pow(10, tokenInfo.decimals);
    return `${numAmount.toLocaleString()} ${token}`;
  };

  const getProgressPercentage = (current: string, target: string) => {
    const currentNum = parseFloat(current);
    const targetNum = parseFloat(target);
    return Math.min((currentNum / targetNum) * 100, 100);
  };

  const getTimeRemaining = (createdAt: number) => {
    const now = Date.now();
    const elapsed = now - createdAt;
    
    const hours = Math.floor(elapsed / (1000 * 60 * 60));
    const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) return `${hours}h ${minutes}m ago`;
    return `${minutes}m ago`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500 text-white';
      case 'completed':
        return 'bg-blue-500 text-white';
      case 'cancelled':
        return 'bg-red-500 text-white';
      case 'expired':
        return 'bg-gray-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-medium text-white mb-2">Error Loading Splits</h3>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={refreshSplits}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Bill Splits</h1>
          <p className="text-gray-400">Split expenses with friends across any chain</p>
        </div>
        <button
          onClick={onCreateSplit}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create Split
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { key: 'all', label: 'All Splits' },
          { key: 'active', label: 'Active' },
          { key: 'completed', label: 'Completed' },
          { key: 'my-created', label: 'My Created' },
          { key: 'my-received', label: 'My Received' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key as 'all' | 'active' | 'completed' | 'my-created' | 'my-received')}
            className={`px-4 py-2 rounded-lg transition-colors text-sm ${
              filter === key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Splits List */}
      {filteredSplits.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-6">💳</div>
          <h3 className="text-2xl font-bold text-white mb-4">No splits found</h3>
          <p className="text-gray-400 mb-8 text-lg">
            {filter === 'my-created' 
              ? "You haven't created any splits yet. Start by creating your first bill split!"
              : filter === 'my-received'
              ? "You haven't received any splits yet. Ask your friends to create splits with you!"
              : filter === 'active'
              ? "No active splits found. Create a new split to get started!"
              : filter === 'completed'
              ? "No completed splits found. Complete some splits to see them here!"
              : "No splits match your current filter. Try adjusting your filter or create a new split!"
            }
          </p>
          <div className="space-y-4">
            <button
              onClick={onCreateSplit}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg font-medium"
            >
              {filter === 'all' ? 'Create Your First Split' : 'Create New Split'}
            </button>
            {filter !== 'all' && (
              <button
                onClick={() => setFilter('all')}
                className="block mx-auto px-6 py-2 text-gray-400 hover:text-white transition-colors"
              >
                View All Splits
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSplits.map((split) => (
            <div
              key={split.id}
              onClick={() => onSplitSelect(split.id)}
              className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 cursor-pointer transition-colors"
            >
              {/* Split Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1 line-clamp-2">
                    {split.description}
                  </h3>
                  <p className="text-sm text-gray-400">
                    by {formatAddress(split.creator)}
                  </p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(split.status)}`}>
                  {split.status}
                </span>
              </div>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>Progress</span>
                  <span>{getProgressPercentage(split.currentAmount, split.targetAmount).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${getProgressPercentage(split.currentAmount, split.targetAmount)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm text-gray-400 mt-2">
                  <span>{formatAmount(split.currentAmount, split.targetToken)}</span>
                  <span>{formatAmount(split.targetAmount, split.targetToken)}</span>
                </div>
              </div>

              {/* Split Details */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Recipient:</span>
                  <span className="text-white font-mono">{formatAddress(split.recipient)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Chain:</span>
                  <span className="text-white">
                    {SUPPORTED_CHAINS.find(c => c.id === split.targetChainId)?.name || 'Unknown'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Contributions:</span>
                  <span className="text-white">{split.contributors.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">
                    {split.status === 'active' ? 'Created:' : 'Completed:'}
                  </span>
                  <span className="text-white">
                    {split.status === 'active' 
                      ? getTimeRemaining(split.createdAt)
                      : split.completedAt 
                        ? getTimeRemaining(split.completedAt)
                        : getTimeRemaining(split.createdAt)
                    }
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-4 pt-4 border-t border-gray-700">
                <button className="w-full py-2 px-4 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">
                  {split.status === 'active' ? 'View & Contribute' : 'View Details'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
