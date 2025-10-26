'use client';

import { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import TokenChainSelector from './TokenChainSelector';
import ContributorManager from './ContributorManager';
import { useSplitContract } from '@/hooks/useSplitContract';
import {
  DEFAULT_CHAIN_ID,
  DEFAULT_TOKEN,
  getTokenInfo,
  validateTokenSelection,
} from '@/lib/token-config';
import { getChainInfo, validateChainSelection } from '@/lib/chain-config';

interface SplitCreationFormProps {
  onSplitCreated: (splitId: string) => void;
  onClose: () => void;
  defaultRecipient?: string;
}

interface Contributor {
  address: string;
  amount: number;
  percentage: number;
}

export default function SplitCreationForm({ onSplitCreated, onClose, defaultRecipient = '' }: SplitCreationFormProps) {
  const { user } = usePrivy();
  const { createSplit, isLoading, error, clearError } = useSplitContract();
  const [formData, setFormData] = useState({
    recipient: defaultRecipient,
    targetChainId: DEFAULT_CHAIN_ID,
    targetToken: DEFAULT_TOKEN,
    targetAmount: '',
    description: '',
  });
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validate recipient address
    if (!formData.recipient.trim()) {
      newErrors.recipient = 'Recipient address is required';
    } else if (!formData.recipient.startsWith('0x') || formData.recipient.length !== 42) {
      newErrors.recipient = 'Please enter a valid Ethereum address';
    }

    // Validate chain selection
    if (!validateChainSelection(formData.targetChainId)) {
      newErrors.chain = 'Please select a supported chain';
    }

    // Validate token selection
    if (!validateTokenSelection(formData.targetToken, formData.targetChainId)) {
      newErrors.token = 'Selected token is not available on this chain';
    }

    // Validate amount
    const amount = parseFloat(formData.targetAmount);
    if (!formData.targetAmount || isNaN(amount) || amount <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }

    // Validate description
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    // Validate contributors
    if (contributors.length === 0) {
      newErrors.contributors = 'At least one contributor is required';
    } else if (contributors.length > 10) {
      newErrors.contributors = 'Maximum 10 contributors allowed';
    }

    // Validate contributor amounts
    const totalContributed = contributors.reduce((sum, c) => sum + c.amount, 0);
    if (Math.abs(totalContributed - amount) > 0.01) {
      newErrors.contributors = 'Contributor amounts must equal the total amount';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.wallet?.address) return;

    if (!validateForm()) {
      return;
    }

    try {
      clearError();

      // Prepare contributor data
      const contributorAddresses = contributors.map(c => c.address);
      const contributorAmounts = contributors.map(c => c.amount.toString());

      // Create split using the contract hook
      const splitId = await createSplit({
        recipient: formData.recipient,
        targetChainId: formData.targetChainId,
        targetToken: formData.targetToken,
        targetAmount: formData.targetAmount,
        description: formData.description,
        contributors: contributorAddresses,
        contributorAmounts: contributorAmounts
      });

      onSplitCreated(splitId);
    } catch (error) {
      console.error('Failed to create split:', error);
      // Error is already handled by the hook
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatAmount = (amount: string, token: string) => {
    const tokenInfo = getTokenInfo(token);
    if (!tokenInfo || !amount) return '';

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return '';

    return `${numAmount.toLocaleString()} ${token}`;
  };

  const totalAmount = parseFloat(formData.targetAmount) || 0;
  const selectedChain = getChainInfo(formData.targetChainId);
  const selectedToken = getTokenInfo(formData.targetToken);

  return (
    <div className="min-h-screen flex items-center justify-center py-12" style={{ backgroundColor: 'var(--background)' }}>
      <div className="max-w-4xl w-full mx-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-white">Create Bill Split</h1>
          <p className="text-gray-400">Split expenses with friends across any supported chain</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Recipient Address */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Recipient Address
            </label>
            <input
              type="text"
              value={formData.recipient}
              onChange={(e) => handleInputChange('recipient', e.target.value)}
              placeholder="0x..."
              required
              className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 border-gray-600 ${errors.recipient ? 'border-red-500' : ''
                }`}
            />
            {errors.recipient && (
              <p className="text-red-400 text-xs mt-1">{errors.recipient}</p>
            )}
          </div>

          {/* Chain & Token Selection */}
          <div>
            <h3 className="text-lg font-medium text-white mb-4">Payment Chain & Token</h3>
            <div className="bg-white/5 rounded-lg p-6 border border-gray-600">
              <TokenChainSelector
                selectedChainId={formData.targetChainId}
                selectedToken={formData.targetToken}
                onChainChange={(chainId) => handleInputChange('targetChainId', chainId)}
                onTokenChange={(token) => handleInputChange('targetToken', token)}
                label=""
              />
            </div>
          </div>
          {(errors.chain || errors.token) && (
            <p className="text-red-400 text-xs">{errors.chain || errors.token}</p>
          )}

          {/* Target Amount */}
          <div className="bg-white/5 rounded-lg p-6 border border-gray-600">
            <label className="block text-sm font-medium text-white mb-2">
              Total Amount
            </label>
            <div className="relative">
              <input
                type="number"
                value={formData.targetAmount}
                onChange={(e) => handleInputChange('targetAmount', e.target.value)}
                placeholder="1000"
                required
                min="0.01"
                step="0.01"
                className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 border-gray-600 ${errors.amount ? 'border-red-500' : ''
                  }`}
              />
              <div className="absolute right-3 top-2 text-sm text-gray-400">
                {formData.targetToken}
              </div>
            </div>
            {formData.targetAmount && (
              <p className="text-xs text-gray-400 mt-1">
                {formatAmount(formData.targetAmount, formData.targetToken)}
              </p>
            )}
            {errors.amount && (
              <p className="text-red-400 text-xs mt-1">{errors.amount}</p>
            )}
          </div>

          {/* Description */}
          <div className="bg-white/5 rounded-lg p-6 border border-gray-600">
            <label className="block text-sm font-medium text-white mb-2">
              Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="e.g., Restaurant bill"
              required
              className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 border-gray-600 ${errors.description ? 'border-red-500' : ''
                }`}
            />
            {errors.description && (
              <p className="text-red-400 text-xs mt-1">{errors.description}</p>
            )}
          </div>

          {/* Contributors */}
          {totalAmount > 0 && (
            <div className="bg-white/5 rounded-lg p-6 border border-gray-600">
              <ContributorManager
                totalAmount={totalAmount}
                tokenSymbol={formData.targetToken}
                contributors={contributors}
                onContributorsChange={setContributors}
              />
            </div>
          )}
          {errors.contributors && (
            <p className="text-red-400 text-xs">{errors.contributors}</p>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-500/10 border border-red-500 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 text-white border border-gray-600 rounded-lg hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || contributors.length === 0}
              className="flex-1 px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isLoading ? 'Creating...' : 'Create Split'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
