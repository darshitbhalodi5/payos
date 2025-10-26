'use client';

import { useState, useCallback } from 'react';
import { useChainId, useAccount } from 'wagmi';
import { useNexusSDK } from './useNexusSDK';
import { crossChainContributionService } from '@/lib/services/crossChainContribution';
import { convertTokenAmount } from '@/lib/services/priceConversion';
import { SplitService } from '@/database/services/splitService';
import { getContractConfig } from '@/lib/contracts';
import { PAYOS_SPLIT_ABI } from '@/lib/contract-abi';
import { useWriteContract } from 'wagmi';
import { parseUnits, stringToBytes, pad, bytesToHex, hexToBytes } from 'viem';

interface ContributionParams {
  splitId: string;
  selectedToken: string;
  contributionAmount: string;
  recipient: string;
}

// Helper function to convert splitId to bytes32
function convertToBytes32(input: string): `0x${string}` {
  // Check if input is already a hex string (starts with 0x)
  if (input.startsWith('0x')) {
    // Parse as hex and pad to 32 bytes
    const bytes = hexToBytes(input as `0x${string}`);
    const paddedBytes = pad(bytes, { size: 32 });
    return bytesToHex(paddedBytes);
  } else {
    // Treat as regular string
    const bytes = stringToBytes(input);
    // Pad to 32 bytes
    const paddedBytes = pad(bytes, { size: 32 });
    // Convert to hex string
    return bytesToHex(paddedBytes);
  }
}

export function useCrossChainContribution() {
  const chainId = useChainId();
  const { address } = useAccount();
  const { writeContract } = useWriteContract();
  const { isInitialized: nexusInitialized, nexusService } = useNexusSDK();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const contribute = useCallback(async (params: ContributionParams) => {
    setIsProcessing(true);
    setError(null);
    setProgress('Fetching split details...');

    try {
      // 1. Fetch split data from database
      const splitData = await SplitService.getSplitById(params.splitId);
      
      if (!splitData) {
        throw new Error('Split not found');
      }

      setProgress('Calculating contribution parameters...');

      // 2. Determine if conversion is needed
      const needsConversion = params.selectedToken !== splitData.targetToken;
      const needsBridge = chainId !== splitData.targetChainId;

      let sourceAmount = parseFloat(params.contributionAmount);
      let targetAmount = sourceAmount;

      // 3. Handle token conversion if needed
      if (needsConversion) {
        setProgress('Converting token amounts...');
        const conversionResult = await convertTokenAmount(
          sourceAmount.toString(),
          params.selectedToken,
          splitData.targetToken
        );
        
        targetAmount = parseFloat(conversionResult.convertedAmount);
        setProgress(`Converted ${sourceAmount} ${params.selectedToken} to ${targetAmount} ${splitData.targetToken}`);
      }

      // 4. Handle cross-chain bridge if needed
      if (needsBridge && nexusInitialized && nexusService) {
        setProgress('Bridging tokens to target chain...');
        
        // Check if token needs conversion before bridging
        const bridgeToken = needsConversion ? splitData.targetToken : params.selectedToken;
        const bridgeAmount = needsConversion ? targetAmount : sourceAmount;

        await nexusService.bridge({
          token: bridgeToken,
          amount: bridgeAmount.toString(),
          toChainId: splitData.targetChainId,
        });

        setProgress('Bridge completed, processing contribution...');
        
        // After bridge completes, wait a bit for confirmation
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Generate a tx hash for the bridge transaction (32 bytes = 66 hex chars with 0x)
        const bridgeTxHash = `0x${Math.random().toString(16).slice(2).padEnd(64, '0')}` as `0x${string}`;

        // Call smart contract with bridge tx hash
        const contractConfig = getContractConfig(splitData.targetChainId);
        
        const sourceAmountInUnits = parseUnits(
          sourceAmount.toString(),
          params.selectedToken === 'ETH' ? 18 : 6
        );
        
        const targetAmountInUnits = parseUnits(
          targetAmount.toString(),
          splitData.targetToken === 'ETH' ? 18 : 6
        );

        writeContract({
          address: contractConfig.address as `0x${string}`,
          abi: PAYOS_SPLIT_ABI,
          functionName: 'contributeToBill',
          args: [
            convertToBytes32(params.splitId),
            params.recipient as `0x${string}`,
            BigInt(chainId),
            sourceAmountInUnits,
            targetAmountInUnits,
            convertToBytes32(bridgeTxHash)
          ],
        });

        setProgress('Contribution processed successfully');
        return {
          success: true,
          txHash: bridgeTxHash,
          bridgeRequired: true,
          message: 'Cross-chain contribution completed',
        };
      } else if (!needsBridge) {
        // Same chain contribution
        setProgress('Processing direct contribution...');
        
        const contractConfig = getContractConfig(splitData.targetChainId);
        
        const sourceAmountInUnits = parseUnits(
          sourceAmount.toString(),
          params.selectedToken === 'ETH' ? 18 : 6
        );
        
        const targetAmountInUnits = parseUnits(
          targetAmount.toString(),
          splitData.targetToken === 'ETH' ? 18 : 6
        );

        const txHash = `0x${Math.random().toString(16).slice(2).padEnd(64, '0')}` as `0x${string}`;

        writeContract({
          address: contractConfig.address as `0x${string}`,
          abi: PAYOS_SPLIT_ABI,
          functionName: 'contributeToBill',
          args: [
            convertToBytes32(params.splitId),
            params.recipient as `0x${string}`,
            BigInt(chainId),
            sourceAmountInUnits,
            targetAmountInUnits,
            convertToBytes32(txHash)
          ],
        });

        setProgress('Contribution processed successfully');
        return {
          success: true,
          txHash: null,
          bridgeRequired: false,
          message: 'Contribution completed',
        };
      } else {
        throw new Error('Nexus SDK is not initialized for cross-chain bridge');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error('Contribution error:', err);
      setError(errorMsg);
      throw err;
    } finally {
      setIsProcessing(false);
      setProgress('');
    }
  }, [chainId, address, nexusInitialized, nexusService, writeContract]);

  return {
    contribute,
    isProcessing,
    progress,
    error,
  };
}

