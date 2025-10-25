"use client";

import { useState, useEffect, useCallback } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useAvailNexus } from "./useAvailNexus";
import { useAccount, useWriteContract, useReadContract } from "wagmi";
import { parseUnits } from "viem";
import {
  getContractConfig,
  isContractDeployed,
  getDeployedChains,
  SPLIT_BILL_ABI,
} from "@/lib/contracts";
import { getTokenAddress } from "@/lib/token-config";
import { availNexusHelper } from "@/lib/avail-nexus-helper";
import {
  type SplitData,
  type SplitCreationParams,
  type ContributionParams,
  type UseSplitContractReturn,
} from "@/lib/types";
import { validateSplitCreation, extractErrorMessage } from "@/lib/utils";
import { SplitService } from "@/database/services/splitService";

export function useSplitContract(): UseSplitContractReturn {
  const { user, ready } = usePrivy();
  const { chainId: connectedChainId } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const { isInitialized: nexusInitialized } = useAvailNexus();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create split
  const createSplit = useCallback(
    async (params: SplitCreationParams): Promise<string> => {
      if (!ready || !user?.wallet?.address) {
        throw new Error("Wallet not connected");
      }

      // Validate parameters
      const validation = validateSplitCreation(params);
      if (!validation.isValid) {
        const errorMessage = validation.errors.join(", ");
        setError(errorMessage);
        throw new Error(errorMessage);
      }

      if (!isContractDeployed(params.targetChainId)) {
        throw new Error(
          `Contract not deployed on chain ${params.targetChainId}`
        );
      }

      try {
        setIsLoading(true);
        setError(null);

        // Generate unique split ID
        const splitId = `split_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`;

        // Store split data in MongoDB first
        const splitData = await SplitService.createSplit({
          ...params,
          splitId,
          creator: user.wallet.address,
        });

        console.log("Split data stored in MongoDB:", splitData);

        // Ensure wallet is on the correct network
        if (connectedChainId && connectedChainId !== params.targetChainId) {
          // If wrong network, try to delete the split from DB (ignore if MongoDB unavailable)
          try {
            await SplitService.deleteSplit(splitId);
          } catch (error) {
            console.warn('Could not delete split from MongoDB:', error);
          }
          throw new Error(
            `Please switch your wallet to chain ${params.targetChainId}`
          );
        }

        // Get contract config
        const contractConfig = getContractConfig(params.targetChainId);

        // Get token address
        const tokenAddress = getTokenAddress(
          params.targetToken,
          params.targetChainId
        );
        if (!tokenAddress) {
          // If token not supported, try to delete the split from DB (ignore if MongoDB unavailable)
          try {
            await SplitService.deleteSplit(splitId);
          } catch (error) {
            console.warn('Could not delete split from MongoDB:', error);
          }
          throw new Error(
            `Token ${params.targetToken} not available on chain ${params.targetChainId}`
          );
        }

        // Convert amounts using 6 decimals for target tokens (USDC/USDT/PYUSD)
        const targetAmountWei = parseUnits(params.targetAmount, 6);
        const contributorAmountsWei = params.contributorAmounts.map((amount) =>
          parseUnits(amount, 6)
        );

        // On-chain write: createSplit
        const txHash = await writeContractAsync({
          address: contractConfig.address as `0x${string}`,
          abi: SPLIT_BILL_ABI,
          functionName: "createSplit",
          args: [
            params.recipient as `0x${string}`,
            BigInt(params.targetChainId),
            tokenAddress as `0x${string}`,
            targetAmountWei,
            params.description,
            params.contributors.map((addr) => addr as `0x${string}`),
            contributorAmountsWei,
          ],
        });

        // Update split status to active after successful contract call
        await SplitService.updateSplitStatus(splitId, "active", {
          transactionHash: txHash,
        });

        console.log("Split created successfully on chain:", txHash);

        // Return split ID instead of tx hash for better tracking
        return splitId;
      } catch (err) {
        const errorMessage = extractErrorMessage(err);
        setError(errorMessage);

        // If we have a splitId, try to delete it from DB on error (ignore if MongoDB unavailable)
        if (err instanceof Error && err.message.includes("split_")) {
          const splitIdMatch = err.message.match(/split_\d+_\w+/);
          if (splitIdMatch) {
            try {
              await SplitService.deleteSplit(splitIdMatch[0]);
            } catch (deleteError) {
              console.warn('Could not delete split from MongoDB:', deleteError);
            }
          }
        }

        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [ready, user?.wallet?.address, connectedChainId, writeContractAsync]
  );

  // Create simple split (equal distribution)
  const createSimpleSplit = useCallback(
    async (
      params: Omit<SplitCreationParams, "contributorAmounts">
    ): Promise<string> => {
      if (!ready || !user?.wallet?.address) {
        throw new Error("Wallet not connected");
      }

      if (!isContractDeployed(params.targetChainId)) {
        throw new Error(
          `Contract not deployed on chain ${params.targetChainId}`
        );
      }

      try {
        setIsLoading(true);
        setError(null);

        // Calculate equal amounts
        const amountPerContributor = (
          parseFloat(params.targetAmount) / params.contributors.length
        ).toString();
        const contributorAmounts = params.contributors.map(
          () => amountPerContributor
        );

        return await createSplit({
          ...params,
          contributorAmounts,
        });
      } catch (err) {
        const errorMessage = extractErrorMessage(err);
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [ready, user?.wallet?.address, createSplit]
  );

  // Contribute to split using Avail Nexus SDK
  const contributeToSplit = useCallback(
    async (params: ContributionParams): Promise<string> => {
      if (!ready || !user?.wallet?.address) {
        throw new Error("Wallet not connected");
      }

      if (!nexusInitialized) {
        throw new Error("Avail Nexus SDK not initialized");
      }

      if (!isContractDeployed(params.targetChainId)) {
        throw new Error(
          `Contract not deployed on chain ${params.targetChainId}`
        );
      }

      try {
        setIsLoading(true);
        setError(null);

        // Get contract config
        const contractConfig = getContractConfig(params.targetChainId);

        // Get token addresses
        const sourceTokenAddress = getTokenAddress(
          params.sourceToken,
          params.sourceChainId
        );
        const targetTokenAddress = getTokenAddress(
          params.targetToken,
          params.targetChainId
        );

        if (!sourceTokenAddress || !targetTokenAddress) {
          throw new Error("Token addresses not found");
        }

        // Convert amounts to wei
        const sourceAmountWei = parseUnits(params.sourceAmount, 18).toString(); // Assuming 18 decimals for source
        const targetAmountWei = parseUnits(params.targetAmount, 6).toString(); // Assuming 6 decimals for target

        // Use Avail Nexus SDK to bridge and execute
        const result = await availNexusHelper.contributeToSplit({
          splitId: params.splitId,
          contributor: user.wallet.address,
          sourceToken: params.sourceToken,
          sourceAmount: sourceAmountWei,
          sourceChainId: params.sourceChainId,
          targetChainId: params.targetChainId,
          contractAddress: contractConfig.address,
          contractAbi: SPLIT_BILL_ABI as unknown as unknown[],
        });

        return result.transactionHash;
      } catch (err) {
        const errorMessage = extractErrorMessage(err);
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [ready, user?.wallet?.address, nexusInitialized]
  );

  // Get split data
  const getSplitData = useCallback(
    async (splitId: string, chainId: number): Promise<SplitData> => {
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
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const mockSplitData: SplitData = {
          id: splitId,
          creator: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8a9b",
          recipient: "0x8f3a2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b",
          targetChainId: chainId,
          targetToken: "PYUSD",
          targetAmount: "1000000000", // 1000 PYUSD
          currentAmount: "500000000", // 500 PYUSD
          description: "Dinner at Joe's Restaurant",
          status: "active",
          createdAt: Date.now() - 4 * 60 * 60 * 1000, // 4 hours ago
          contributors: [
            "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8a9b",
            "0x5e7b9f4a2c1d3e5f6a7b8c9d0e1f2a3b4c5d6e7f8a",
          ],
          contributorAmounts: ["500000000", "500000000"],
          contributions: [
            {
              contributor: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8a9b",
              sourceChainId: 1,
              sourceToken: "ETH",
              sourceAmount: "2000000000000000000",
              targetAmount: "250000000",
              txHash:
                "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
              timestamp: Date.now() - 2 * 60 * 60 * 1000,
              status: "completed",
            },
            {
              contributor: "0x5e7b9f4a2c1d3e5f6a7b8c9d0e1f2a3b4c5d6e7f8a",
              sourceChainId: 137,
              sourceToken: "USDC",
              sourceAmount: "250000000",
              targetAmount: "250000000",
              txHash:
                "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
              timestamp: Date.now() - 1 * 60 * 60 * 1000,
              status: "completed",
            },
          ],
        };

        return mockSplitData;
      } catch (err) {
        const errorMessage = extractErrorMessage(err);
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

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
    clearError,
  };
}
