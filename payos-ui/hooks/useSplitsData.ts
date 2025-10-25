"use client";

import { useState, useEffect, useCallback } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useAccount } from "wagmi";
import {
  getContractConfig,
  getDeployedChains,
  SPLIT_BILL_ABI,
} from "@/lib/contracts";
import { type SplitData, type UseSplitsDataReturn } from "@/lib/types";
import { extractErrorMessage } from "@/lib/utils";

export function useSplitsData(): UseSplitsDataReturn {
  const { ready } = usePrivy();
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

      // For now, use mock data since we need to implement proper contract calls
      // In production, you would use ethers.js or viem to make direct contract calls
      const mockSplits: SplitData[] = [
        {
          id: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
          creator: address,
          recipient: "0x8f3a2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b",
          targetChainId: 42161,
          targetToken: "PYUSD",
          targetAmount: "1000000000", // 1000 PYUSD
          currentAmount: "750000000", // 750 PYUSD
          description: "Dinner at Joe's Restaurant",
          status: "active",
          createdAt: Date.now() - 4 * 60 * 60 * 1000, // 4 hours ago
          contributors: [
            address,
            "0x5e7b9f4a2c1d3e5f6a7b8c9d0e1f2a3b4c5d6e7f8a",
          ],
          contributorAmounts: ["500000000", "500000000"],
          contributions: [
            {
              contributor: address,
              sourceChainId: 1,
              sourceToken: "ETH",
              sourceAmount: "2000000000000000000", // 2 ETH
              targetAmount: "250000000", // 250 PYUSD
              txHash:
                "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
              timestamp: Date.now() - 2 * 60 * 60 * 1000,
              status: "completed",
            },
            {
              contributor: "0x5e7b9f4a2c1d3e5f6a7b8c9d0e1f2a3b4c5d6e7f8a",
              sourceChainId: 137,
              sourceToken: "USDC",
              sourceAmount: "250000000", // 250 USDC
              targetAmount: "250000000", // 250 PYUSD
              txHash:
                "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
              timestamp: Date.now() - 1 * 60 * 60 * 1000,
              status: "completed",
            },
          ],
        },
        {
          id: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
          creator: "0x5e7b9f4a2c1d3e5f6a7b8c9d0e1f2a3b4c5d6e7f8a",
          recipient: address, // User is recipient
          targetChainId: 137,
          targetToken: "USDC",
          targetAmount: "500000000", // 500 USDC
          currentAmount: "500000000", // 500 USDC
          description: "Concert tickets for Taylor Swift",
          status: "completed",
          createdAt: Date.now() - 6 * 60 * 60 * 1000, // 6 hours ago
          completedAt: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
          contributors: ["0x5e7b9f4a2c1d3e5f6a7b8c9d0e1f2a3b4c5d6e7f8a"],
          contributorAmounts: ["500000000"],
          contributions: [
            {
              contributor: "0x5e7b9f4a2c1d3e5f6a7b8c9d0e1f2a3b4c5d6e7f8a",
              sourceChainId: 137,
              sourceToken: "USDC",
              sourceAmount: "500000000",
              targetAmount: "500000000",
              txHash:
                "0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba",
              timestamp: Date.now() - 2 * 60 * 60 * 1000,
              status: "completed",
            },
          ],
        },
      ];

      // Filter splits where user is creator or recipient
      const userSplits = mockSplits.filter(
        (split) =>
          split.creator.toLowerCase() === address.toLowerCase() ||
          split.recipient.toLowerCase() === address.toLowerCase()
      );

      setSplits(userSplits);
    } catch (err) {
      console.error("Failed to fetch splits:", err);
      setError(extractErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [ready, address]);

  // Fetch splits when address changes
  useEffect(() => {
    fetchSplits();
  }, [fetchSplits]);

  // Get splits by status
  const getSplitsByStatus = useCallback(
    (status: "active" | "completed") => {
      return splits.filter((split) => split.status === status);
    },
    [splits]
  );

  // Get splits where user is creator
  const getCreatedSplits = useCallback(() => {
    if (!address) return [];
    return splits.filter(
      (split) => split.creator.toLowerCase() === address.toLowerCase()
    );
  }, [splits, address]);

  // Get splits where user is recipient
  const getReceivedSplits = useCallback(() => {
    if (!address) return [];
    return splits.filter(
      (split) => split.recipient.toLowerCase() === address.toLowerCase()
    );
  }, [splits, address]);

  // Get splits where user is contributor
  const getContributedSplits = useCallback(() => {
    if (!address) return [];
    return splits.filter((split) =>
      split.contributors.some(
        (contributor) => contributor.toLowerCase() === address.toLowerCase()
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
    refreshSplits,
  };
}
