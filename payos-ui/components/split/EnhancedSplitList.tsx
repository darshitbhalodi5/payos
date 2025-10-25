'use client';

import { useState, useEffect } from 'react';
import { useSplitsData } from '@/hooks/useSplitsData';
import { useAccount } from 'wagmi';
import { ChevronLeft, ChevronRight, Plus, Eye, DollarSign, Filter, X } from 'lucide-react';

interface EnhancedSplitListProps {
  onSplitSelect: (splitId: string) => void;
  onCreateSplit: () => void;
  onContribute?: (splitId: string) => void;
}

const SUPPORTED_CHAINS = [
  { id: 11155111, name: 'Ethereum Sepolia', symbol: 'ETH' },
  { id: 421614, name: 'Arbitrum Sepolia', symbol: 'ARB' },
  { id: 11155420, name: 'Optimism Sepolia', symbol: 'OP' },
  { id: 84532, name: 'Base Sepolia', symbol: 'BASE' },
];

const SUPPORTED_TOKENS = [
  { symbol: 'PYUSD', name: 'PayPal USD', decimals: 6 },
  { symbol: 'USDC', name: 'USD Coin', decimals: 6 },
];

type FilterType = 'all' | 'active' | 'completed' | 'my-created' | 'my-received';

// Get filters based on filter type
const getFiltersForType = (filterType: FilterType, address?: string) => {
  if (!address) return {};
  
  switch (filterType) {
    case 'active':
      return { status: 'active' as const };
    case 'completed':
      return { status: 'completed' as const };
    case 'my-created':
      return { creator: address };
    case 'my-received':
      return { contributor: address };
    default:
      return {};
  }
};

export default function EnhancedSplitList({ onSplitSelect, onCreateSplit, onContribute }: EnhancedSplitListProps) {
  const { address } = useAccount();
  const { 
    splits, 
    isLoading, 
    error, 
    pagination,
    fetchSplitsWithPagination,
    setCurrentPage,
    setCurrentLimit,
    setCurrentFilters
  } = useSplitsData();
  
  const [filter, setFilter] = useState<FilterType>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [pageSize, setPageSize] = useState(10);

  // Initialize data on mount
  useEffect(() => {
    if (address) {
      const filters = getFiltersForType(filter, address);
      fetchSplitsWithPagination(1, pageSize, filters);
    }
  }, [address, fetchSplitsWithPagination, pageSize, filter]);

  // Handle filter changes
  const handleFilterChange = (newFilter: FilterType) => {
    setFilter(newFilter);
    const filters = getFiltersForType(newFilter, address);
    setCurrentFilters(filters);
  };

  // Check if user can contribute to a split
  const canContribute = (split: { contributors: string[] }) => {
    if (!address) return false;
    return split.contributors.some((contributor: string) => 
      contributor.toLowerCase() === address.toLowerCase()
    );
  };

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
      case 'active': return 'text-green-400';
      case 'completed': return 'text-blue-400';
      case 'pending': return 'text-yellow-400';
      case 'cancelled': return 'text-red-400';
      case 'expired': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentLimit(size);
  };

  // Render pagination
  const renderPagination = () => {
    if (!pagination || pagination.totalPages <= 1) return null;

    const pages = [];
    const startPage = Math.max(1, pagination.page - 2);
    const endPage = Math.min(pagination.totalPages, pagination.page + 2);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            i === pagination.page
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="flex items-center justify-between mt-6">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.totalCount)} of {pagination.totalCount} splits
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={!pagination.hasPrevPage}
            className="p-2 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <div className="flex gap-1">
            {pages}
          </div>
          
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={!pagination.hasNextPage}
            className="p-2 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  // Render empty state
  const renderEmptyState = () => {
    const getEmptyMessage = () => {
      switch (filter) {
        case 'active':
          return 'No active splits found';
        case 'completed':
          return 'No completed splits found';
        case 'my-created':
          return 'You haven\'t created any splits yet';
        case 'my-received':
          return 'No splits where you are a contributor';
        default:
          return 'No splits found';
      }
    };

    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-gray-800 rounded-full mx-auto mb-6 flex items-center justify-center">
          <DollarSign className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">{getEmptyMessage()}</h3>
        <p className="text-gray-400 mb-6">
          {filter === 'all' ? 'Create your first split to get started' : 'Try changing the filter or create a new split'}
        </p>
        <button
          onClick={onCreateSplit}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create New Split
        </button>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Splits</h1>
          <div className="h-10 w-32 bg-gray-700 rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-800 rounded-lg p-6 animate-pulse">
              <div className="h-6 bg-gray-700 rounded mb-4" />
              <div className="h-4 bg-gray-700 rounded mb-2" />
              <div className="h-4 bg-gray-700 rounded mb-4" />
              <div className="h-2 bg-gray-700 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-red-900/20 rounded-full mx-auto mb-6 flex items-center justify-center">
          <X className="w-12 h-12 text-red-400" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Error Loading Splits</h3>
        <p className="text-gray-400 mb-6">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-white">Splits</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
          <button
            onClick={onCreateSplit}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create Split
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-gray-800 rounded-lg p-4 space-y-4">
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'All Splits' },
              { key: 'active', label: 'Active' },
              { key: 'completed', label: 'Completed' },
              { key: 'my-created', label: 'My Created' },
              { key: 'my-received', label: 'My Received' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => handleFilterChange(key as FilterType)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-4">
            <label className="text-sm text-gray-400">Page Size:</label>
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="px-3 py-2 bg-gray-700 text-gray-300 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>
        </div>
      )}

      {/* Splits Grid */}
      {splits.length === 0 ? (
        renderEmptyState()
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {splits.map((split) => (
              <div
                key={split.splitId}
                className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors"
              >
                {/* Split Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1 line-clamp-2">
                      {split.description}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(split.status)}`}>
                        {split.status.toUpperCase()}
                      </span>
                      <span>•</span>
                      <span>{getChainName(split.targetChainId)}</span>
                    </div>
                  </div>
                </div>

                {/* Split Details */}
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Amount</span>
                    <span className="text-white font-medium">
                      {formatAmount(split.currentAmount, split.targetToken)} / {formatAmount(split.targetAmount, split.targetToken)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Progress</span>
                    <span className="text-white font-medium">
                      {getProgressPercentage(split.currentAmount, split.targetAmount).toFixed(1)}%
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(getProgressPercentage(split.currentAmount, split.targetAmount), 100)}%`
                      }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => onSplitSelect(split.splitId)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                  
                  {canContribute(split) && (
                    <button
                      onClick={() => onContribute ? onContribute(split.splitId) : onSplitSelect(split.splitId)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <DollarSign className="w-4 h-4" />
                      Contribute
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {renderPagination()}
        </>
      )}
    </div>
  );
}
