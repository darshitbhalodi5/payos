'use client';

import { useState, useEffect } from 'react';

interface Contributor {
  address: string;
  amount: number;
  percentage: number;
}

interface ContributorManagerProps {
  totalAmount: number;
  tokenSymbol: string;
  contributors: Contributor[];
  onContributorsChange: (contributors: Contributor[]) => void;
  disabled?: boolean;
}

export default function ContributorManager({
  totalAmount,
  tokenSymbol,
  contributors,
  onContributorsChange,
  disabled = false
}: ContributorManagerProps) {
  const [newContributor, setNewContributor] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [distributionMode, setDistributionMode] = useState<'equal' | 'custom'>('equal');

  const maxContributors = 10;

  // Calculate total contributed amount
  const totalContributed = contributors.reduce((sum, c) => sum + c.amount, 0);
  const remainingAmount = totalAmount - totalContributed;

  // Auto-distribute equally when in equal mode
  useEffect(() => {
    if (distributionMode === 'equal' && contributors.length > 0) {
      const equalAmount = totalAmount / contributors.length;
      const updatedContributors = contributors.map(contributor => ({
        ...contributor,
        amount: equalAmount,
        percentage: (equalAmount / totalAmount) * 100
      }));
      onContributorsChange(updatedContributors);
    }
  }, [distributionMode, contributors.length, totalAmount, onContributorsChange, contributors]);

  const addContributor = () => {
    if (!newContributor.trim() || contributors.length >= maxContributors) return;

    const address = newContributor.trim();
    
    // Check if address already exists
    if (contributors.some(c => c.address.toLowerCase() === address.toLowerCase())) {
      alert('This address is already added');
      return;
    }

    // Basic address validation
    if (!address.startsWith('0x') || address.length !== 42) {
      alert('Please enter a valid Ethereum address');
      return;
    }

    const amount = distributionMode === 'equal' 
      ? totalAmount / (contributors.length + 1)
      : parseFloat(newAmount) || 0;

    const newContributors = [
      ...contributors,
      {
        address,
        amount,
        percentage: (amount / totalAmount) * 100
      }
    ];

    onContributorsChange(newContributors);
    setNewContributor('');
    setNewAmount('');
  };

  const removeContributor = (index: number) => {
    const newContributors = contributors.filter((_, i) => i !== index);
    onContributorsChange(newContributors);
  };

  const updateContributorAmount = (index: number, amount: number) => {
    const updatedContributors = contributors.map((contributor, i) => 
      i === index 
        ? {
            ...contributor,
            amount,
            percentage: (amount / totalAmount) * 100
          }
        : contributor
    );
    onContributorsChange(updatedContributors);
  };

  const formatAmount = (amount: number) => {
    return `${amount.toLocaleString(undefined, { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 6 
    })} ${tokenSymbol}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-white">Contributors</h3>
        <div className="text-sm text-gray-400">
          {contributors.length}/{maxContributors}
        </div>
      </div>

      {/* Distribution Mode */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Distribution Mode
        </label>
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="equal"
              checked={distributionMode === 'equal'}
              onChange={(e) => setDistributionMode(e.target.value as 'equal' | 'custom')}
              disabled={disabled}
              className="mr-2"
            />
            <span className="text-gray-300">Equal Split</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="custom"
              checked={distributionMode === 'custom'}
              onChange={(e) => setDistributionMode(e.target.value as 'equal' | 'custom')}
              disabled={disabled}
              className="mr-2"
            />
            <span className="text-gray-300">Custom Amounts</span>
          </label>
        </div>
      </div>

      {/* Add Contributor */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">
          Add Contributor
        </label>
        <div className="flex space-x-2">
          <input
            type="text"
            value={newContributor}
            onChange={(e) => setNewContributor(e.target.value)}
            placeholder="0x..."
            disabled={disabled || contributors.length >= maxContributors}
            className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
          {distributionMode === 'custom' && (
            <input
              type="number"
              value={newAmount}
              onChange={(e) => setNewAmount(e.target.value)}
              placeholder="Amount"
              min="0"
              step="0.01"
              disabled={disabled || contributors.length >= maxContributors}
              className="w-32 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
          )}
          <button
            type="button"
            onClick={addContributor}
            disabled={disabled || !newContributor.trim() || contributors.length >= maxContributors}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Add
          </button>
        </div>
      </div>

      {/* Contributors List */}
      <div className="space-y-2">
        {contributors.map((contributor, index) => (
          <div key={index} className="flex items-center space-x-2 p-3 bg-gray-700 rounded-lg border border-gray-600">
            <div className="flex-1">
              <div className="text-sm font-medium text-white">
                {contributor.address.slice(0, 6)}...{contributor.address.slice(-4)}
              </div>
              <div className="text-xs text-gray-400">
                {contributor.percentage.toFixed(1)}% • {formatAmount(contributor.amount)}
              </div>
            </div>
            
            {distributionMode === 'custom' && (
              <input
                type="number"
                value={contributor.amount}
                onChange={(e) => updateContributorAmount(index, parseFloat(e.target.value) || 0)}
                min="0"
                step="0.01"
                disabled={disabled}
                className="w-24 px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            )}
            
            <button
              type="button"
              onClick={() => removeContributor(index)}
              disabled={disabled}
              className="text-red-400 hover:text-red-300 disabled:opacity-50"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="bg-gray-700 rounded-lg p-3 border border-gray-600">
        <div className="text-sm text-gray-300 space-y-1">
          <div className="flex justify-between">
            <span>Total Amount:</span>
            <span className="font-medium">{formatAmount(totalAmount)}</span>
          </div>
          <div className="flex justify-between">
            <span>Contributed:</span>
            <span className="font-medium">{formatAmount(totalContributed)}</span>
          </div>
          <div className="flex justify-between">
            <span>Remaining:</span>
            <span className={`font-medium ${remainingAmount > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
              {formatAmount(remainingAmount)}
            </span>
          </div>
        </div>
        
        {remainingAmount > 0 && (
          <div className="text-xs text-yellow-400 mt-2">
            ⚠️ {formatAmount(remainingAmount)} still needs to be allocated
          </div>
        )}
        
        {Math.abs(remainingAmount) < 0.01 && contributors.length > 0 && (
          <div className="text-xs text-green-400 mt-2">
            ✅ All amounts allocated correctly
          </div>
        )}
      </div>
    </div>
  );
}
