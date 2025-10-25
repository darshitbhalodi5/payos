'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { 
  createAvailNexusSDK, 
  DEFAULT_NEXUS_CONFIG, 
  type AvailNexusSDK,
  type BridgeAndExecuteParams,
  type BridgeResult,
  type TokenInfo
} from '@/lib/avail-nexus';

export function useAvailNexus() {
  const { user, ready } = usePrivy();
  const [sdk, setSdk] = useState<AvailNexusSDK | null>(null);
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

        const nexusSDK = createAvailNexusSDK(DEFAULT_NEXUS_CONFIG);
        
        // Get the provider from the wallet
        const provider = window.ethereum;
        if (!provider) {
          throw new Error('No wallet provider found');
        }

        await nexusSDK.initialize(provider);
        setSdk(nexusSDK);
        setIsInitialized(true);
      } catch (err) {
        console.error('Failed to initialize Avail Nexus SDK:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize SDK');
        setIsInitialized(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeSDK();
  }, [ready, user?.wallet]);

  // Bridge and execute function
  const bridgeAndExecute = useCallback(async (params: BridgeAndExecuteParams): Promise<BridgeResult> => {
    if (!sdk || !isInitialized) {
      throw new Error('SDK not initialized');
    }

    try {
      setError(null);
      return await sdk.bridgeAndExecute(params);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Bridge and execute failed';
      setError(errorMessage);
      throw err;
    }
  }, [sdk, isInitialized]);

  // Get token balance
  const getTokenBalance = useCallback(async (token: string, address: string, chainId: number): Promise<string> => {
    if (!sdk || !isInitialized) {
      throw new Error('SDK not initialized');
    }

    try {
      setError(null);
      return await sdk.getTokenBalance(token, address, chainId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get token balance';
      setError(errorMessage);
      throw err;
    }
  }, [sdk, isInitialized]);

  // Get supported tokens
  const getSupportedTokens = useCallback(async (chainId: number): Promise<TokenInfo[]> => {
    if (!sdk || !isInitialized) {
      throw new Error('SDK not initialized');
    }

    try {
      setError(null);
      return await sdk.getSupportedTokens(chainId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get supported tokens';
      setError(errorMessage);
      throw err;
    }
  }, [sdk, isInitialized]);

  // Estimate gas
  const estimateGas = useCallback(async (params: BridgeAndExecuteParams) => {
    if (!sdk || !isInitialized) {
      throw new Error('SDK not initialized');
    }

    try {
      setError(null);
      return await sdk.estimateGas(params);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to estimate gas';
      setError(errorMessage);
      throw err;
    }
  }, [sdk, isInitialized]);

  // Get transaction status
  const getTransactionStatus = useCallback(async (txHash: string) => {
    if (!sdk || !isInitialized) {
      throw new Error('SDK not initialized');
    }

    try {
      setError(null);
      return await sdk.getTransactionStatus(txHash);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get transaction status';
      setError(errorMessage);
      throw err;
    }
  }, [sdk, isInitialized]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    sdk,
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
