'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useAvailNexus } from '@/hooks/useAvailNexus';
import { useSplitContract } from '@/hooks/useSplitContract';

interface AvailNexusIntegrationProps {
  splitId: string;
  targetChainId: number;
  targetToken: string;
  targetAmount: string;
  onContributionComplete: (txHash: string) => void;
}

export default function AvailNexusIntegration({
  splitId,
  targetChainId,
  targetToken,
  targetAmount,
  onContributionComplete,
}: AvailNexusIntegrationProps) {
  const { user } = usePrivy();
  const { 
    isInitialized, 
    isLoading: nexusLoading, 
    error: nexusError,
    getTokenBalance,
    estimateGas,
    clearError 
  } = useAvailNexus();
  
  const { contributeToSplit, isLoading: contractLoading } = useSplitContract();
  
  const [sourceChainId, setSourceChainId] = useState<number>(11155111); // Default to Ethereum Sepolia
  const [sourceToken, setSourceToken] = useState<string>('ETH');
  const [sourceAmount, setSourceAmount] = useState<string>('');
  const [userBalance, setUserBalance] = useState<string>('0');
  const [gasEstimate, setGasEstimate] = useState<{
    gasLimit: string;
    gasPrice: string;
    estimatedCost: string;
  } | null>(null);
  const [isContributing, setIsContributing] = useState(false);

  // Supported chains for source selection
  const supportedChains = [
    { id: 11155111, name: 'Ethereum Sepolia', symbol: 'ETH' },
    { id: 421614, name: 'Arbitrum Sepolia', symbol: 'ARB' },
    { id: 11155420, name: 'Optimism Sepolia', symbol: 'OP' },
    { id: 84532, name: 'Base Sepolia', symbol: 'BASE' },
  ];

  const supportedTokens = ['ETH', 'USDC', 'PYUSD'];

  const loadUserBalance = useCallback(async () => {
    if (!user?.wallet?.address) return;
    
    try {
      const balance = await getTokenBalance(sourceToken, user.wallet.address, sourceChainId);
      setUserBalance(balance);
    } catch (error) {
      console.error('Failed to load user balance:', error);
    }
  }, [user?.wallet?.address, sourceToken, sourceChainId, getTokenBalance]);

  const estimateGasCost = useCallback(async () => {
    if (!sourceAmount || !sourceToken) return;
    
    try {
      const estimate = await estimateGas({
        splitId,
        contributor: user?.wallet?.address || '',
        sourceToken,
        sourceAmount,
        sourceChainId,
        targetToken,
        targetAmount,
        targetChainId,
        contractAddress: '', // Will be filled by the helper
        contractAbi: [],
      });
      setGasEstimate(estimate);
    } catch (error) {
      console.error('Failed to estimate gas:', error);
    }
  }, [sourceAmount, sourceToken, sourceChainId, targetToken, targetAmount, targetChainId, estimateGas, splitId, user?.wallet?.address]);

  // Load user balance when source chain/token changes
  useEffect(() => {
    if (isInitialized && user?.wallet?.address && sourceToken) {
      loadUserBalance();
    }
  }, [isInitialized, user?.wallet?.address, sourceChainId, sourceToken, loadUserBalance]);

  // Estimate gas when parameters change
  useEffect(() => {
    if (isInitialized && sourceAmount && sourceToken && sourceChainId) {
      estimateGasCost();
    }
  }, [isInitialized, sourceAmount, sourceToken, sourceChainId, targetChainId, estimateGasCost]);

  const handleContribute = async () => {
    if (!user?.wallet?.address || !sourceAmount || !sourceToken) return;

    try {
      setIsContributing(true);
      clearError();

      // Use the contract hook which internally uses Avail Nexus SDK
      const txHash = await contributeToSplit({
        splitId,
        sourceChainId,
        sourceToken,
        sourceAmount,
        targetChainId,
        targetToken,
        targetAmount,
      });

      onContributionComplete(txHash);
    } catch (error) {
      console.error('Contribution failed:', error);
    } finally {
      setIsContributing(false);
    }
  };

  const formatBalance = (balance: string, token: string) => {
    const numBalance = parseFloat(balance);
    if (isNaN(numBalance)) return '0';
    
    const decimals = token === 'ETH' ? 18 : 6;
    const formatted = numBalance / Math.pow(10, decimals);
    return `${formatted.toFixed(4)} ${token}`;
  };

  if (!isInitialized) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">
            {nexusLoading ? 'Initializing Avail Nexus SDK...' : 'Waiting for wallet connection...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-4">
        Cross-Chain Contribution via Avail Nexus
      </h3>

      {nexusError && (
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-3 mb-4">
          <p className="text-red-400 text-sm">{nexusError}</p>
          <button
            onClick={clearError}
            className="text-red-400 hover:text-red-300 text-sm underline mt-1"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="space-y-4">
        {/* Source Chain Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Source Chain
          </label>
          <select
            value={sourceChainId}
            onChange={(e) => setSourceChainId(Number(e.target.value))}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {supportedChains.map((chain) => (
              <option key={chain.id} value={chain.id}>
                {chain.name}
              </option>
            ))}
          </select>
        </div>

        {/* Source Token Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Source Token
          </label>
          <select
            value={sourceToken}
            onChange={(e) => setSourceToken(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {supportedTokens.map((token) => (
              <option key={token} value={token}>
                {token}
              </option>
            ))}
          </select>
        </div>

        {/* User Balance Display */}
        <div className="bg-gray-700 rounded-lg p-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Your Balance:</span>
            <span className="text-sm text-white font-mono">
              {formatBalance(userBalance, sourceToken)}
            </span>
          </div>
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Amount to Contribute
          </label>
          <div className="relative">
            <input
              type="number"
              value={sourceAmount}
              onChange={(e) => setSourceAmount(e.target.value)}
              placeholder="0.1"
              min="0"
              step="0.001"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="absolute right-3 top-2 text-sm text-gray-400">
              {sourceToken}
            </div>
          </div>
        </div>

        {/* Gas Estimate */}
        {gasEstimate && (
          <div className="bg-gray-700 rounded-lg p-3">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Gas Estimate</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Gas Limit:</span>
                <span className="text-white font-mono">{gasEstimate.gasLimit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Gas Price:</span>
                <span className="text-white font-mono">{gasEstimate.gasPrice} wei</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Estimated Cost:</span>
                <span className="text-white font-mono">{gasEstimate.estimatedCost} ETH</span>
              </div>
            </div>
          </div>
        )}

        {/* Contribution Button */}
        <button
          onClick={handleContribute}
          disabled={isContributing || contractLoading || !sourceAmount || parseFloat(sourceAmount) <= 0}
          className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isContributing || contractLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Processing Cross-Chain Contribution...
            </div>
          ) : (
            'Contribute via Avail Nexus'
          )}
        </button>

        {/* Info */}
        <div className="bg-blue-500/10 border border-blue-500 rounded-lg p-3">
          <p className="text-blue-400 text-sm">
            <strong>Avail Nexus SDK:</strong> This will automatically bridge your {sourceToken} from {supportedChains.find(c => c.id === sourceChainId)?.name} to {supportedChains.find(c => c.id === targetChainId)?.name} and contribute to the split. The entire process happens in one transaction!
          </p>
        </div>
      </div>
    </div>
  );
}