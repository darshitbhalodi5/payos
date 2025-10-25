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
  getChainInfo,
  validateTokenSelection,
  validateChainSelection
} from '@/lib/token-config';

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-4xl mx-4 my-8 border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">Create Bill Split</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Recipient Address */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Recipient Address
            </label>
            <input
              type="text"
              value={formData.recipient}
              onChange={(e) => handleInputChange('recipient', e.target.value)}
              placeholder="0x..."
              required
              className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.recipient ? 'border-red-500' : 'border-gray-600'
              }`}
            />
            {errors.recipient && (
              <p className="text-red-400 text-xs mt-1">{errors.recipient}</p>
            )}
          </div>

          {/* Chain & Token Selection */}
          <TokenChainSelector
            selectedChainId={formData.targetChainId}
            selectedToken={formData.targetToken}
            onChainChange={(chainId) => handleInputChange('targetChainId', chainId)}
            onTokenChange={(token) => handleInputChange('targetToken', token)}
            label="Payment Chain & Token"
          />
          {(errors.chain || errors.token) && (
            <p className="text-red-400 text-xs">{errors.chain || errors.token}</p>
          )}

          {/* Target Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
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
                className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.amount ? 'border-red-500' : 'border-gray-600'
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
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="e.g., Dinner at Joe's Restaurant"
              required
              className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.description ? 'border-red-500' : 'border-gray-600'
              }`}
            />
            {errors.description && (
              <p className="text-red-400 text-xs mt-1">{errors.description}</p>
            )}
          </div>

          {/* Contributors */}
          {totalAmount > 0 && (
            <ContributorManager
              totalAmount={totalAmount}
              tokenSymbol={formData.targetToken}
              contributors={contributors}
              onContributorsChange={setContributors}
            />
          )}
          {errors.contributors && (
            <p className="text-red-400 text-xs">{errors.contributors}</p>
          )}

          {/* Preview */}
          <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
            <h3 className="text-sm font-medium text-gray-300 mb-2">Split Preview</h3>
            <div className="space-y-1 text-sm text-gray-400">
              <div>Recipient: {formData.recipient ? `${formData.recipient.slice(0, 6)}...${formData.recipient.slice(-4)}` : 'Not set'}</div>
              <div>Chain: {selectedChain?.name || 'Not set'}</div>
              <div>Token: {selectedToken?.symbol || 'Not set'}</div>
              <div>Amount: {formData.targetAmount ? formatAmount(formData.targetAmount, formData.targetToken) : 'Not set'}</div>
              <div>Contributors: {contributors.length}</div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-500/10 border border-red-500 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-300 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || contributors.length === 0}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Creating...' : 'Create Split'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
