'use client';

import { useState } from 'react';
import { useSplitContract } from '@/hooks/useSplitContract';
import { SplitCreationParams } from '@/lib/types';

interface MongoDBIntegrationProps {
  onSplitCreated?: (splitId: string) => void;
}

export default function MongoDBIntegration({ onSplitCreated }: MongoDBIntegrationProps) {
  const { createSplit, isLoading, error } = useSplitContract();
  const [formData, setFormData] = useState<SplitCreationParams>({
    recipient: '',
    targetChainId: 11155111, // Ethereum Sepolia
    targetToken: 'PYUSD',
    targetAmount: '',
    description: '',
    contributors: [],
    contributorAmounts: []
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // This will now:
      // 1. Store data in MongoDB first
      // 2. Make contract call
      // 3. Update MongoDB with transaction details
      // 4. Return split ID for tracking
      const splitId = await createSplit(formData);
      
      console.log('Split created successfully with ID:', splitId);
      onSplitCreated?.(splitId);
      
      // Reset form
      setFormData({
        recipient: '',
        targetChainId: 11155111,
        targetToken: 'PYUSD',
        targetAmount: '',
        description: '',
        contributors: [],
        contributorAmounts: []
      });
    } catch (err) {
      console.error('Failed to create split:', err);
    }
  };

  const addContributor = () => {
    setFormData(prev => ({
      ...prev,
      contributors: [...prev.contributors, ''],
      contributorAmounts: [...prev.contributorAmounts, '']
    }));
  };

  const updateContributor = (index: number, field: 'address' | 'amount', value: string) => {
    setFormData(prev => ({
      ...prev,
      contributors: field === 'address' 
        ? prev.contributors.map((c, i) => i === index ? value : c)
        : prev.contributors,
      contributorAmounts: field === 'amount'
        ? prev.contributorAmounts.map((a, i) => i === index ? value : a)
        : prev.contributorAmounts
    }));
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Create Split with MongoDB Integration</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Recipient Address</label>
          <input
            type="text"
            value={formData.recipient}
            onChange={(e) => setFormData(prev => ({ ...prev, recipient: e.target.value }))}
            className="w-full p-3 border rounded-lg"
            placeholder="0x..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <input
            type="text"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full p-3 border rounded-lg"
            placeholder="What is this split for?"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Target Amount</label>
          <input
            type="number"
            value={formData.targetAmount}
            onChange={(e) => setFormData(prev => ({ ...prev, targetAmount: e.target.value }))}
            className="w-full p-3 border rounded-lg"
            placeholder="100.00"
            step="0.01"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Contributors</label>
          {formData.contributors.map((contributor, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={contributor}
                onChange={(e) => updateContributor(index, 'address', e.target.value)}
                className="flex-1 p-2 border rounded"
                placeholder="0x..."
                required
              />
              <input
                type="number"
                value={formData.contributorAmounts[index]}
                onChange={(e) => updateContributor(index, 'amount', e.target.value)}
                className="w-24 p-2 border rounded"
                placeholder="50.00"
                step="0.01"
                required
              />
            </div>
          ))}
          <button
            type="button"
            onClick={addContributor}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add Contributor
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
        >
          {isLoading ? 'Creating Split...' : 'Create Split'}
        </button>
      </form>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">MongoDB Integration Flow:</h3>
        <ol className="text-sm text-blue-700 space-y-1">
          <li>1. Data stored in MongoDB with status &quot;pending&quot;</li>
          <li>2. Contract interaction performed</li>
          <li>3. If successful: status updated to &quot;active&quot; with transaction hash</li>
          <li>4. If failed: split deleted from MongoDB</li>
        </ol>
      </div>
    </div>
  );
}
