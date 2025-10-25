'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useAccount, useReadContract } from 'wagmi';
import { 
  getContractConfig, 
  isContractDeployed,
  getDeployedChains 
} from '@/lib/contracts';
import { getTokenInfo } from '@/lib/token-config';

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
  createdAt: number;
  completedAt?: number;
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
  status: 'pending' | 'completed' | 'failed';
}

export function useSplitsData() {
  const { user, ready } = usePrivy();
  const { address } = useAccount();
  const [splits, setSplits] = useState<SplitData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get all deployed chains
  const deployedChains = getDeployedChains();

  // Fetch splits from all deployed chains
  const fetchSplits = useCallback(async () => {
    if (!ready || !address) {
      setSplits([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const allSplits: SplitData[] = [];

      // For now, we'll use a mock implementation since we need to implement
      // the contract functions to get splits by address
      // In production, you would need to add these functions to the contract:
      // - getSplitsByCreator(address creator)
      // - getSplitsByRecipient(address recipient)
      // - getAllSplits() with pagination

      // Mock data for demonstration
      const mockSplits: SplitData[] = [
        {
          id: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
          creator: address,
          recipient: '0x8f3a2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b',
          targetChainId: 42161,
          targetToken: 'PYUSD',
          targetAmount: '1000000000', // 1000 PYUSD
          currentAmount: '750000000', // 750 PYUSD
          description: 'Dinner at Joe\'s Restaurant',
          status: 'active',
          createdAt: Date.now() - 4 * 60 * 60 * 1000, // 4 hours ago
          contributors: [
            {
              contributor: address,
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
              contributor: address,
              sourceChainId: 1,
              sourceToken: 'ETH',
              sourceAmount: '2000000000000000000', // 2 ETH
              targetAmount: '250000000', // 250 PYUSD
              txHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
              timestamp: Date.now() - 2 * 60 * 60 * 1000,
              status: 'completed'
            },
            {
              contributor: '0x5e7b9f4a2c1d3e5f6a7b8c9d0e1f2a3b4c5d6e7f8a',
              sourceChainId: 137,
              sourceToken: 'USDC',
              sourceAmount: '250000000', // 250 USDC
              targetAmount: '250000000', // 250 PYUSD
              txHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
              timestamp: Date.now() - 1 * 60 * 60 * 1000,
              status: 'completed'
            }
          ]
        },
        {
          id: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
          creator: '0x5e7b9f4a2c1d3e5f6a7b8c9d0e1f2a3b4c5d6e7f8a',
          recipient: address, // User is recipient
          targetChainId: 137,
          targetToken: 'USDC',
          targetAmount: '500000000', // 500 USDC
          currentAmount: '500000000', // 500 USDC
          description: 'Concert tickets for Taylor Swift',
          status: 'completed',
          createdAt: Date.now() - 6 * 60 * 60 * 1000, // 6 hours ago
          completedAt: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
          contributors: [
            {
              contributor: '0x5e7b9f4a2c1d3e5f6a7b8c9d0e1f2a3b4c5d6e7f8a',
              targetAmount: '500000000',
              contributedAmount: '500000000',
              hasContributed: true,
              lastContributionTime: Date.now() - 2 * 60 * 60 * 1000
            }
          ],
          contributions: [
            {
              contributor: '0x5e7b9f4a2c1d3e5f6a7b8c9d0e1f2a3b4c5d6e7f8a',
              sourceChainId: 137,
              sourceToken: 'USDC',
              sourceAmount: '500000000',
              targetAmount: '500000000',
              txHash: '0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba',
              timestamp: Date.now() - 2 * 60 * 60 * 1000,
              status: 'completed'
            }
          ]
        }
      ];

      // Filter splits where user is creator or recipient
      const userSplits = mockSplits.filter(split => 
        split.creator.toLowerCase() === address.toLowerCase() || 
        split.recipient.toLowerCase() === address.toLowerCase()
      );

      setSplits(userSplits);
    } catch (err) {
      console.error('Failed to fetch splits:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch splits');
    } finally {
      setIsLoading(false);
    }
  }, [ready, address]);

  // Fetch splits when address changes
  useEffect(() => {
    fetchSplits();
  }, [fetchSplits]);

  // Get splits by status
  const getSplitsByStatus = useCallback((status: 'active' | 'completed') => {
    return splits.filter(split => split.status === status);
  }, [splits]);

  // Get splits where user is creator
  const getCreatedSplits = useCallback(() => {
    if (!address) return [];
    return splits.filter(split => split.creator.toLowerCase() === address.toLowerCase());
  }, [splits, address]);

  // Get splits where user is recipient
  const getReceivedSplits = useCallback(() => {
    if (!address) return [];
    return splits.filter(split => split.recipient.toLowerCase() === address.toLowerCase());
  }, [splits, address]);

  // Get splits where user is contributor
  const getContributedSplits = useCallback(() => {
    if (!address) return [];
    return splits.filter(split => 
      split.contributors.some(contributor => 
        contributor.contributor.toLowerCase() === address.toLowerCase()
      )
    );
  }, [splits, address]);

  // Refresh splits data
  const refreshSplits = useCallback(() => {
    fetchSplits();
  }, [fetchSplits]);

  return {
    splits,
    isLoading,
    error,
    getSplitsByStatus,
    getCreatedSplits,
    getReceivedSplits,
    getContributedSplits,
    refreshSplits
  };
}
