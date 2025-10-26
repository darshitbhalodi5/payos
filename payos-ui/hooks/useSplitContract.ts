"use client";

import { useState, useEffect, useCallback } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useAccount, useWriteContract, useReadContract, useSwitchChain, useChainId } from "wagmi";
import { parseUnits } from "viem";
import {
  getContractConfig,
  isContractDeployed,
  getDeployedChains,
  SPLIT_BILL_ABI,
} from "@/lib/contracts";
import { getTokenAddress } from "@/lib/token-config";
import {
  type SplitData,
  type SplitCreationParams,
  type ContributionParams,
  type UseSplitContractReturn,
} from "@/lib/types";
import { validateSplitCreation, extractErrorMessage } from "@/lib/utils";
import { getChainInfo } from "@/lib/chain-config";
import { SplitService } from "@/database/services/splitService";

export function useSplitContract(): UseSplitContractReturn {
  const { user, ready } = usePrivy();
  const { chainId: connectedChainId } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const { switchChain } = useSwitchChain();
  const currentChainId = useChainId();
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

      setIsLoading(true);
      setError(null);

      try {
        // Check if contract is deployed on target chain
        if (!isContractDeployed(params.targetChainId)) {
          throw new Error(
            `Contract not deployed on chain ${params.targetChainId}`
          );
        }

        // Switch to target chain if needed
        if (connectedChainId !== params.targetChainId) {
          await switchChain({ chainId: params.targetChainId });
        }

        // Get contract config
        const contractConfig = getContractConfig(params.targetChainId);
        if (!contractConfig) {
          throw new Error(`Contract config not found for chain ${params.targetChainId}`);
        }

        // Get token address
        const tokenAddress = getTokenAddress(params.targetToken, params.targetChainId);
        if (!tokenAddress) {
        // If token not supported, we can't create the split
        throw new Error(
          `Token ${params.targetToken} not available on chain ${params.targetChainId}`
        );
        }

        // Convert amounts to wei
        const targetAmountWei = parseUnits(params.targetAmount, 6).toString(); // Assuming 6 decimals
        const contributorAmountsWei = params.contributorAmounts.map(amount =>
          parseUnits(amount, 6).toString()
        );

        // Create split on blockchain
        const txHash = await writeContractAsync({
          address: contractConfig.address as `0x${string}`,
          abi: SPLIT_BILL_ABI,
          functionName: "createSplit",
          args: [
            params.recipient as `0x${string}`,
            BigInt(params.targetChainId),
            tokenAddress as `0x${string}`,
            BigInt(targetAmountWei),
            params.description,
            params.contributors as `0x${string}`[],
            contributorAmountsWei.map(amount => BigInt(amount)),
          ],
        });

        // Update split in database with transaction hash
        try {
          // Note: This would need the splitId to be passed separately or generated
          // For now, we'll skip the database update
          console.log("Split created successfully:", txHash);
        } catch (dbError) {
          console.warn("Failed to update split in DB:", dbError);
        }

        return txHash;
      } catch (err) {
        const errorMessage = extractErrorMessage(err);
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [ready, user?.wallet?.address, connectedChainId, switchChain, writeContractAsync]
  );

  // Create simple split (without contributors)
  const createSimpleSplit = useCallback(
    async (params: Omit<SplitCreationParams, 'contributorAmounts'>): Promise<string> => {
      const simpleParams: SplitCreationParams = {
        ...params,
        contributors: [],
        contributorAmounts: [],
      };
      return createSplit(simpleParams);
    },
    [createSplit]
  );

  // Contribute to split using direct contract interaction
  const contributeToSplit = useCallback(
    async (params: ContributionParams): Promise<string> => {
      if (!ready || !user?.wallet?.address) {
        throw new Error("Wallet not connected");
      }

      setIsLoading(true);
      setError(null);

      try {
        // Check if contract is deployed on target chain
        if (!isContractDeployed(params.targetChainId)) {
          throw new Error(
            `Contract not deployed on chain ${params.targetChainId}`
          );
        }

        // Switch to target chain if needed
        if (connectedChainId !== params.targetChainId) {
          await switchChain({ chainId: params.targetChainId });
        }

        // Get contract config
        const contractConfig = getContractConfig(params.targetChainId);
        if (!contractConfig) {
          throw new Error(`Contract config not found for chain ${params.targetChainId}`);
        }

        // Convert amounts to wei
        const sourceAmountWei = parseUnits(params.sourceAmount, 6).toString(); // Assuming 6 decimals
        const targetAmountWei = parseUnits(params.targetAmount, 6).toString(); // Assuming 6 decimals

        // Generate a mock transaction hash for the contribution
        const txHash = `0x${Math.random().toString(16).substr(2, 64)}`;

        // Call the contract directly
        const result = await writeContractAsync({
          address: contractConfig.address as `0x${string}`,
          abi: SPLIT_BILL_ABI,
          functionName: "contributeToBill",
          args: [
            params.splitId as `0x${string}`,
            user.wallet.address as `0x${string}`,
            BigInt(params.sourceChainId),
            BigInt(sourceAmountWei),
            BigInt(targetAmountWei),
            txHash as `0x${string}`
          ],
        });

        return result;
      } catch (err) {
        const errorMessage = extractErrorMessage(err);
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [ready, user?.wallet?.address, connectedChainId, switchChain, writeContractAsync]
  );

  // Get split data from contract
  const getSplitData = useCallback(
    async (splitId: string, chainId: number): Promise<SplitData> => {
      if (!isContractDeployed(chainId)) {
        throw new Error(`Contract not deployed on chain ${chainId}`);
      }

      const contractConfig = getContractConfig(chainId);
      if (!contractConfig) {
        throw new Error(`Contract config not found for chain ${chainId}`);
      }

      // This would need to be implemented with useReadContract hook
      // For now, return mock data
      throw new Error("getSplitData not implemented - use database service instead");
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
    clearError,
    isLoading,
    error,
  };
}