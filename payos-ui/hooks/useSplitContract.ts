"use client";

import { useState, useEffect, useCallback } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useAvailNexus } from "./useAvailNexus";
import { useAccount, useWriteContract, useReadContract, useSwitchChain, useChainId } from "wagmi";
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
import { getChainInfo } from "@/lib/chain-config";
import { SplitService } from "@/database/services/splitService";

export function useSplitContract(): UseSplitContractReturn {
  const { user, ready } = usePrivy();
  const { chainId: connectedChainId } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const { switchChain } = useSwitchChain();
  const currentChainId = useChainId();
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
          const currentChain = getChainInfo(connectedChainId);
          const targetChain = getChainInfo(params.targetChainId);
          console.log(`Switching from ${currentChain?.name || `Chain ${connectedChainId}`} to ${targetChain?.name || `Chain ${params.targetChainId}`}`);
          
          try {
            // Attempt to switch to the target chain
            await switchChain({ chainId: params.targetChainId });
            
            // Wait a moment for the chain switch to complete
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Check if the switch was successful
            // Note: We need to wait for the chain to actually switch
            // The currentChainId will update automatically via the hook
            if (currentChainId !== params.targetChainId) {
              // If switch failed, try to delete the split from DB and throw error
              try {
                await SplitService.deleteSplit(splitId);
              } catch (error) {
                console.warn('Could not delete split from MongoDB:', error);
              }
              throw new Error(
                `Failed to switch to ${targetChain?.name || `Chain ${params.targetChainId}`}. Please switch manually.`
              );
            }
            
            console.log(`Successfully switched to ${targetChain?.name || `Chain ${params.targetChainId}`}`);
          } catch (switchError) {
            console.error('Chain switch failed:', switchError);
            
            // If switch failed, try to delete the split from DB
            try {
              await SplitService.deleteSplit(splitId);
            } catch (error) {
              console.warn('Could not delete split from MongoDB:', error);
            }
            
            // Check if it's a user rejection
            if (switchError instanceof Error && switchError.message.includes('User rejected')) {
              throw new Error('Chain switch was cancelled by user');
            }
            
            throw new Error(
              `Please switch your wallet to ${targetChain?.name || `Chain ${params.targetChainId}`} manually`
            );
          }
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
    [ready, user?.wallet?.address, connectedChainId, writeContractAsync, switchChain, currentChainId]
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

      // Ensure wallet is on the correct network for contribution
      if (connectedChainId && connectedChainId !== params.targetChainId) {
        const currentChain = getChainInfo(connectedChainId);
        const targetChain = getChainInfo(params.targetChainId);
        console.log(`Switching from ${currentChain?.name || `Chain ${connectedChainId}`} to ${targetChain?.name || `Chain ${params.targetChainId}`} for contribution`);
        
        try {
          await switchChain({ chainId: params.targetChainId });
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Check if the switch was successful
          // Note: We need to wait for the chain to actually switch
          // The currentChainId will update automatically via the hook
          if (currentChainId !== params.targetChainId) {
            throw new Error(
              `Failed to switch to ${targetChain?.name || `Chain ${params.targetChainId}`}. Please switch manually.`
            );
          }
          
          console.log(`Successfully switched to ${targetChain?.name || `Chain ${params.targetChainId}`} for contribution`);
        } catch (switchError) {
          console.error('Chain switch failed for contribution:', switchError);
          
          if (switchError instanceof Error && switchError.message.includes('User rejected')) {
            throw new Error('Chain switch was cancelled by user');
          }
          
          throw new Error(
            `Please switch your wallet to ${targetChain?.name || `Chain ${params.targetChainId}`} manually`
          );
        }
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

        if (!result.success) {
          throw new Error(result.error || 'Contribution failed');
        }

        return result.transactionHash || '';
      } catch (err) {
        const errorMessage = extractErrorMessage(err);
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [ready, user?.wallet?.address, nexusInitialized, connectedChainId, switchChain, currentChainId]
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

        // Try to get split data from database first
        const splitData = await SplitService.getSplitById(splitId);
        
        if (splitData) {
          return splitData;
        }

        // If not found in database, throw error
        throw new Error(`Split with ID ${splitId} not found`);
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
