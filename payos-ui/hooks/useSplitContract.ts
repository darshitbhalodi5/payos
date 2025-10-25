'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useAvailNexus } from './useAvailNexus';
import { useAccount, useWriteContract } from 'wagmi';
import { parseUnits } from 'viem';
import { 
  getContractConfig, 
  isContractDeployed, 
  getDeployedChains,
  type ContractConfig 
} from '@/lib/contracts';
import { getTokenAddress } from '@/lib/token-config';

export interface SplitData {
  id: string;
  creator: string;
  recipient: string;
  targetChainId: number;
  targetToken: string;
  targetAmount: string;
  currentAmount: string;
  description: string;
  status: 'active' | 'completed';
  contributors: ContributorInfo[];
  contributions: ContributionInfo[];
  createdAt?: string;
}

export interface ContributorInfo {
  contributor: string;
  targetAmount: string;
  contributedAmount: string;
  hasContributed: boolean;
  lastContributionTime: number;
}

export interface ContributionInfo {
  contributor: string;
  sourceChainId: number;
  sourceToken: string;
  sourceAmount: string;
  targetAmount: string;
  txHash: string;
  timestamp: number;
  status?: 'active' | 'completed';
}

export function useSplitContract() {
  const { user, ready } = usePrivy();
  const { chainId: connectedChainId } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const { bridgeAndExecute, isInitialized: nexusInitialized } = useAvailNexus();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create split
  const createSplit = useCallback(async (params: {
    recipient: string;
    targetChainId: number;
    targetToken: string;
    targetAmount: string;
    description: string;
    contributors: string[];
    contributorAmounts: string[];
  }): Promise<string> => {
    if (!ready || !user?.wallet?.address) {
      throw new Error('Wallet not connected');
    }

    if (!isContractDeployed(params.targetChainId)) {
      throw new Error(`Contract not deployed on chain ${params.targetChainId}`);
    }

    try {
      setIsLoading(true);
      setError(null);

      // Ensure wallet is on the correct network
      if (connectedChainId && connectedChainId !== params.targetChainId) {
        throw new Error(`Please switch your wallet to chain ${params.targetChainId}`);
      }

      // Get contract config
      const contractConfig = getContractConfig(params.targetChainId);
      
      // Get token address
      const tokenAddress = getTokenAddress(params.targetToken, params.targetChainId);
      if (!tokenAddress) {
        throw new Error(`Token ${params.targetToken} not available on chain ${params.targetChainId}`);
      }

      // Convert amounts using 6 decimals for target tokens (USDC/USDT/PYUSD)
      const targetAmountWei = parseUnits(params.targetAmount, 6);
      const contributorAmountsWei = params.contributorAmounts.map(amount => parseUnits(amount, 6));

      // On-chain write: createSplit
      const txHash = await writeContractAsync({
        address: contractConfig.address as `0x${string}`,
        abi: contractConfig.abi as any,
        functionName: 'createSplit',
        args: [
          params.recipient,
          BigInt(params.targetChainId),
          tokenAddress as `0x${string}`,
          targetAmountWei,
          params.description,
          params.contributors,
          contributorAmountsWei
        ]
      });

      // Return tx hash as the reference; backend/contract emits SplitCreated with splitId
      return txHash as string;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create split';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [ready, user?.wallet?.address, connectedChainId, writeContractAsync]);

  // Create simple split (equal distribution)
  const createSimpleSplit = useCallback(async (params: {
    recipient: string;
    targetChainId: number;
    targetToken: string;
    targetAmount: string;
    description: string;
    contributors: string[];
  }): Promise<string> => {
    if (!ready || !user?.wallet?.address) {
      throw new Error('Wallet not connected');
    }

    if (!isContractDeployed(params.targetChainId)) {
      throw new Error(`Contract not deployed on chain ${params.targetChainId}`);
    }

    try {
      setIsLoading(true);
      setError(null);

      // Calculate equal amounts
      const amountPerContributor = (parseFloat(params.targetAmount) / params.contributors.length).toString();
      const contributorAmounts = params.contributors.map(() => amountPerContributor);

      return await createSplit({
        ...params,
        contributorAmounts
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create simple split';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [ready, user?.wallet?.address, createSplit]);

  // Contribute to split using Avail Nexus SDK
  const contributeToSplit = useCallback(async (params: {
    splitId: string;
    sourceChainId: number;
    sourceToken: string;
    sourceAmount: string;
    targetChainId: number;
    targetToken: string;
    targetAmount: string;
  }): Promise<string> => {
    if (!ready || !user?.wallet?.address) {
      throw new Error('Wallet not connected');
    }

    if (!nexusInitialized) {
      throw new Error('Avail Nexus SDK not initialized');
    }

    if (!isContractDeployed(params.targetChainId)) {
      throw new Error(`Contract not deployed on chain ${params.targetChainId}`);
    }

    try {
      setIsLoading(true);
      setError(null);

      // Get contract config
      const contractConfig = getContractConfig(params.targetChainId);
      
      // Get token addresses
      const sourceTokenAddress = getTokenAddress(params.sourceToken, params.sourceChainId);
      const targetTokenAddress = getTokenAddress(params.targetToken, params.targetChainId);
      
      if (!sourceTokenAddress || !targetTokenAddress) {
        throw new Error('Token addresses not found');
      }

      // Convert amounts to wei
      const sourceAmountWei = (parseFloat(params.sourceAmount) * 1e18).toString(); // Assuming 18 decimals for source
      const targetAmountWei = (parseFloat(params.targetAmount) * 1e6).toString(); // Assuming 6 decimals for target

      // Use Avail Nexus SDK to bridge and execute
      const result = await bridgeAndExecute({
        token: params.sourceToken,
        amount: sourceAmountWei,
        sourceChainId: params.sourceChainId,
        targetChainId: params.targetChainId,
        recipient: contractConfig.address,
        execute: {
          contractAddress: contractConfig.address,
          functionName: 'contributeToBill',
          functionParams: [
            params.splitId,
            user.wallet.address,
            params.sourceChainId,
            params.sourceToken,
            sourceAmountWei,
            targetAmountWei,
            `0x${Math.random().toString(16).substr(2, 64)}` // Mock tx hash
          ]
        },
        tokenApproval: {
          token: params.targetToken,
          amount: targetAmountWei
        }
      });

      return result.transactionHash;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to contribute to split';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [ready, user?.wallet?.address, nexusInitialized, bridgeAndExecute]);

  // Get split data
  const getSplitData = useCallback(async (splitId: string, chainId: number): Promise<SplitData> => {
    if (!isContractDeployed(chainId)) {
      throw new Error(`Contract not deployed on chain ${chainId}`);
    }

    try {
      setIsLoading(true);
      setError(null);

      // Get contract config
      const contractConfig = getContractConfig(chainId);

      // TODO: Implement actual contract calls to get split data
      // For now, return mock data
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockSplitData: SplitData = {
        id: splitId,
        creator: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8a9b',
        recipient: '0x8f3a2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b',
        targetChainId: chainId,
        targetToken: 'PYUSD',
        targetAmount: '1000000000', // 1000 PYUSD
        currentAmount: '500000000', // 500 PYUSD
        description: 'Dinner at Joe\'s Restaurant',
        status: 'active',
        contributors: [
          {
            contributor: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8a9b',
            targetAmount: '500000000',
            contributedAmount: '250000000',
            hasContributed: true,
            lastContributionTime: Date.now() - 2 * 60 * 60 * 1000
          },
          {
            contributor: '0x5e7b9f4a2c1d3e5f6a7b8c9d0e1f2a3b4c5d6e7f8a',
            targetAmount: '500000000',
            contributedAmount: '250000000',
            hasContributed: true,
            lastContributionTime: Date.now() - 1 * 60 * 60 * 1000
          }
        ],
        contributions: [
          {
            contributor: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8a9b',
            sourceChainId: 1,
            sourceToken: 'ETH',
            sourceAmount: '2000000000000000000',
            targetAmount: '250000000',
            txHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
            timestamp: Date.now() - 2 * 60 * 60 * 1000,
            status: 'completed'
          },
          {
            contributor: '0x5e7b9f4a2c1d3e5f6a7b8c9d0e1f2a3b4c5d6e7f8a',
            sourceChainId: 137,
            sourceToken: 'USDC',
            sourceAmount: '250000000',
            targetAmount: '250000000',
            txHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
            timestamp: Date.now() - 1 * 60 * 60 * 1000,
            status: 'completed'
          }
        ],
      };

      return mockSplitData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get split data';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get deployed chains
  const getAvailableChains = useCallback((): number[] => {
    return getDeployedChains();
  }, []);

  // Check if chain is supported
  const isChainSupported = useCallback((chainId: number): boolean => {
    return isContractDeployed(chainId);
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    createSplit,
    createSimpleSplit,
    contributeToSplit,
    getSplitData,
    getAvailableChains,
    isChainSupported,
    isLoading,
    error,
    clearError
  };
}
