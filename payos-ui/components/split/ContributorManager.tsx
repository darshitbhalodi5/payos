'use client';

import { useState } from 'react';

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

  const maxContributors = 10;

  // Calculate total contributed amount
  const totalContributed = contributors.reduce((sum, c) => sum + c.amount, 0);
  const remainingAmount = totalAmount - totalContributed;

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

    // Validate amount
    const amount = parseFloat(newAmount);
    if (!newAmount || isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    // Check if total would exceed the total amount
    const newTotal = totalContributed + amount;
    if (newTotal > totalAmount) {
      alert(`Amount exceeds the remaining allocation. Remaining: ${formatAmount(totalAmount - totalContributed)}`);
      return;
    }

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

  const updateContributorAmount = (index: number, newAmount: number) => {
    // Check if the new total would exceed the total amount
    const otherContributorsTotal = contributors.reduce((sum, c, i) => {
      return i === index ? sum : sum + c.amount;
    }, 0);
    
    const newTotal = otherContributorsTotal + newAmount;
    if (newTotal > totalAmount) {
      alert(`Amount exceeds the allowed total. Maximum: ${formatAmount(totalAmount - otherContributorsTotal)}`);
      return;
    }

    const updatedContributors = contributors.map((contributor, i) => 
      i === index 
        ? {
            ...contributor,
            amount: newAmount,
            percentage: (newAmount / totalAmount) * 100
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

      {/* Add Contributor */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-white">
          Add Contributor
        </label>
        <div className="flex space-x-2">
          <input
            type="text"
            value={newContributor}
            onChange={(e) => setNewContributor(e.target.value)}
            placeholder="0x..."
            disabled={disabled || contributors.length >= maxContributors}
            className="flex-1 px-4 py-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-50"
          />
          <input
            type="number"
            value={newAmount}
            onChange={(e) => setNewAmount(e.target.value)}
            placeholder="Amount"
            min="0"
            step="0.01"
            disabled={disabled || contributors.length >= maxContributors}
            className="w-32 px-4 py-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-50"
          />
          <button
            type="button"
            onClick={addContributor}
            disabled={disabled || !newContributor.trim() || !newAmount || contributors.length >= maxContributors}
            className="px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            Add
          </button>
        </div>
      </div>

      {/* Contributors List */}
      <div className="space-y-2">
        {contributors.map((contributor, index) => (
          <div key={index} className="flex items-center space-x-2 p-3 bg-white/5 rounded-lg border border-gray-600">
            <div className="flex-1">
              <div className="text-sm font-medium text-white">
                {contributor.address.slice(0, 6)}...{contributor.address.slice(-4)}
              </div>
              <div className="text-xs text-gray-300">
                {contributor.percentage.toFixed(1)}% • {formatAmount(contributor.amount)}
              </div>
            </div>
            
            <input
              type="number"
              value={contributor.amount}
              onChange={(e) => updateContributorAmount(index, parseFloat(e.target.value) || 0)}
              min="0"
              step="0.01"
              disabled={disabled}
              className="w-24 px-3 py-2 bg-white/10 border border-gray-500 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
            
            <button
              type="button"
              onClick={() => removeContributor(index)}
              disabled={disabled}
              className="text-red-400 hover:text-red-300 disabled:opacity-50 px-3 py-2 rounded-lg hover:bg-red-900/20 transition-colors"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="bg-white/5 rounded-lg p-4 border border-gray-600">
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
            <span className={`font-medium ${remainingAmount > 0 ? 'text-yellow-400' : remainingAmount < 0 ? 'text-red-400' : 'text-green-400'}`}>
              {remainingAmount < 0 ? '-' : ''}{formatAmount(Math.abs(remainingAmount))}
            </span>
          </div>
        </div>
        
        {remainingAmount > 0 && (
          <div className="text-xs mt-2" style={{ color: 'var(--yellow)' }}>
            {formatAmount(remainingAmount)} still needs to be allocated
          </div>
        )}
        
        {remainingAmount < 0 && (
          <div className="text-xs mt-2 text-red-400">
          Over allocated by {formatAmount(Math.abs(remainingAmount))}. Please reduce contributor amounts.
          </div>
        )}
      </div>
    </div>
  );
}
