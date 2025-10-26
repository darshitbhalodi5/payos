'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { availNexusHelper, DEFAULT_AVAIL_CONFIG } from '@/lib/avail-nexus-helper';
import { 
  type AvailNexusConfig, 
  type BridgeAndExecuteParams, 
  type BridgeResult,
  type UseAvailNexusReturn 
} from '@/lib/types';

export function useAvailNexus(): UseAvailNexusReturn {
  const { user, ready } = usePrivy();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize SDK when user is ready
  useEffect(() => {
    const initializeSDK = async () => {
      if (!ready || !user?.wallet) {
        setIsInitialized(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Get the provider from the wallet
        const provider = window.ethereum;
        if (!provider) {
          throw new Error('No wallet provider found. Please make sure MetaMask is installed and connected.');
        }

        console.log('Initializing Avail Nexus SDK with provider:', provider);
        await availNexusHelper.initialize(provider);
        
        // Add a small delay to ensure initialization is fully complete
        await new Promise(resolve => setTimeout(resolve, 100));
        
        setIsInitialized(true);
        console.log('✅ Avail Nexus SDK initialized successfully');
      } catch (err) {
        console.error('Failed to initialize Avail Nexus SDK:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize SDK');
        setIsInitialized(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeSDK();

    // Cleanup on unmount
    return () => {
      availNexusHelper.cleanup();
    };
  }, [ready, user?.wallet]);

  // Bridge and execute function
  const bridgeAndExecute = useCallback(async (params: BridgeAndExecuteParams): Promise<BridgeResult> => {
    if (!isInitialized) {
      throw new Error('SDK not initialized');
    }

    // Double-check that the helper is actually ready with retry
    let retries = 3;
    while (retries > 0 && !availNexusHelper.isReady()) {
      console.log(`SDK not ready, retrying... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, 100));
      retries--;
    }

    if (!availNexusHelper.isReady()) {
      throw new Error('Avail Nexus SDK is not ready. Please wait for initialization to complete.');
    }

    try {
      setError(null);
      return await availNexusHelper.contributeToSplit({
        splitId: params.splitId,
        contributor: params.contributor,
        sourceToken: params.sourceToken,
        sourceAmount: params.sourceAmount,
        sourceChainId: params.sourceChainId,
        targetChainId: params.targetChainId,
        contractAddress: params.contractAddress,
        contractAbi: params.contractAbi
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Bridge and execute failed';
      setError(errorMessage);
      throw err;
    }
  }, [isInitialized]);

  // Get token balance
  const getTokenBalance = useCallback(async (token: string, address: string, chainId: number): Promise<string> => {
    if (!isInitialized) {
      throw new Error('SDK not initialized');
    }

    // Double-check that the helper is actually ready
    if (!availNexusHelper.isReady()) {
      throw new Error('Avail Nexus SDK is not ready. Please wait for initialization to complete.');
    }

    try {
      setError(null);
      const balances = await availNexusHelper.getUnifiedBalance(address);
      return balances?.[token]?.[chainId.toString()] || '0';
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get token balance';
      setError(errorMessage);
      throw err;
    }
  }, [isInitialized]);

  // Get supported tokens
  const getSupportedTokens = useCallback(async (chainId: number) => {
    if (!isInitialized) {
      throw new Error('SDK not initialized');
    }

    // Double-check that the helper is actually ready
    if (!availNexusHelper.isReady()) {
      throw new Error('Avail Nexus SDK is not ready. Please wait for initialization to complete.');
    }

    try {
      setError(null);
      const chains = await availNexusHelper.getSupportedChains();
      const chain = chains.find((c: { id: number }) => c.id === chainId);
      return chain ? [{ symbol: 'ETH', name: 'Ethereum', decimals: 18, address: '0x0000000000000000000000000000000000000000', chainId }] : [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get supported tokens';
      setError(errorMessage);
      throw err;
    }
  }, [isInitialized]);

  // Estimate gas
  const estimateGas = useCallback(async (params: BridgeAndExecuteParams) => {
    if (!isInitialized) {
      throw new Error('SDK not initialized');
    }

    // Double-check that the helper is actually ready
    if (!availNexusHelper.isReady()) {
      throw new Error('Avail Nexus SDK is not ready. Please wait for initialization to complete.');
    }

    try {
      setError(null);
      return await availNexusHelper.estimateGas(params);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to estimate gas';
      setError(errorMessage);
      throw err;
    }
  }, [isInitialized]);

  // Get transaction status
  const getTransactionStatus = useCallback(async (txHash: string) => {
    if (!isInitialized) {
      throw new Error('SDK not initialized');
    }

    // Double-check that the helper is actually ready
    if (!availNexusHelper.isReady()) {
      throw new Error('Avail Nexus SDK is not ready. Please wait for initialization to complete.');
    }

    try {
      setError(null);
      return await availNexusHelper.getTransactionStatus(txHash);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get transaction status';
      setError(errorMessage);
      throw err;
    }
  }, [isInitialized]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    sdk: availNexusHelper,
    isInitialized,
    isLoading,
    error,
    bridgeAndExecute,
    getTokenBalance,
    getSupportedTokens,
    estimateGas,
    getTransactionStatus,
    clearError
  };
}
