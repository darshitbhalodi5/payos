'use client';

import { useEffect, useState, useCallback } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { BrowserProvider } from 'ethers';
import { getNexusService } from '@/lib/services/nexusSDK';

export function useNexusSDK() {
  const { ready, authenticated, user } = usePrivy();
  const { wallets } = useWallets();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initialize = useCallback(async () => {
    if (!ready || !authenticated || wallets.length === 0) {
      console.log('[useNexusSDK] Not ready to initialize:', { ready, authenticated, walletsLength: wallets.length });
      return;
    }

    if (isInitializing || isInitialized) {
      console.log('[useNexusSDK] Already initializing or initialized');
      return;
    }

    setIsInitializing(true);
    setError(null);

    try {
      console.log('[useNexusSDK] Starting Nexus SDK initialization...');
      
      // Get the wallet provider from Privy
      const embeddedWallet = wallets.find(w => w.walletClientType === 'privy');
      
      if (!embeddedWallet) {
        throw new Error('No embedded wallet found');
      }

      // Create an ethers provider from the Privy wallet
      const provider = new BrowserProvider(embeddedWallet as unknown as never);
      
      // Initialize Nexus SDK with the provider
      const nexusService = getNexusService();
      await nexusService.initialize(provider as unknown as any);
      
      setIsInitialized(true);
      console.log('✅ [useNexusSDK] Nexus SDK initialized successfully');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error('[useNexusSDK] Failed to initialize Nexus SDK:', err);
      setError(errorMsg);
      setIsInitialized(false);
    } finally {
      setIsInitializing(false);
    }
  }, [ready, authenticated, wallets, isInitializing, isInitialized]);

  // Initialize on mount when ready
  useEffect(() => {
    if (ready && authenticated && !isInitializing && !isInitialized) {
      initialize();
    }
  }, [ready, authenticated, isInitializing, isInitialized, initialize]);

  // Deinitialize on unmount
  useEffect(() => {
    return () => {
      if (isInitialized) {
        getNexusService().deinit().catch(err => {
          console.error('[useNexusSDK] Error during deinit:', err);
        });
      }
    };
  }, [isInitialized]);

  const nexusService = isInitialized ? getNexusService() : null;

  return {
    isInitialized,
    isInitializing,
    error,
    ready,
    authenticated,
    user,
    initialize,
    nexusService,
  };
}

