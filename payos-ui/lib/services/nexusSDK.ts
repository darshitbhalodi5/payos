'use client';

import { NexusSDK, type BridgeParams, type BridgeResult, type TransferParams, type TransferResult, type ExecuteParams, type ExecuteResult, type BridgeAndExecuteParams, type BridgeAndExecuteResult, type SimulationResult, type UserAsset, type ExecuteSimulation, type BridgeAndExecuteSimulationResult, type OnIntentHook, type OnAllowanceHook, type EthereumProvider } from '@avail-project/nexus-core';

class NexusService {
  private sdk: NexusSDK | null = null;
  private initialized = false;

  async initialize(provider: EthereumProvider): Promise<void> {
    if (this.initialized && this.sdk) {
      console.log('[NexusService] SDK already initialized, skipping...');
      return;
    }

    try {
      console.log('[NexusService] Starting SDK initialization...');
      console.log('[NexusService] Provider type:', typeof provider);
      console.log('[NexusService] Provider has .on:', typeof provider.on === 'function');
      console.log('[NexusService] Provider has .request:', typeof provider.request === 'function');

      if (!this.sdk) {
        console.log('[NexusService] Creating new NexusSDK instance...');
        this.sdk = new NexusSDK({
          network: 'testnet',
        });
        console.log('[NexusService] NexusSDK instance created');
      } else {
        console.log('[NexusService] Reusing existing NexusSDK instance');
      }

      if (typeof window !== 'undefined') {
        console.log('[NexusService] localStorage keys before init:', Object.keys(localStorage).filter(k =>
          k.includes('arcana') || k.includes('siwe') || k.includes('ca-') || k.includes('session')
        ));
      }

      console.log('[NexusService] Calling sdk.initialize()...');
      await this.sdk.initialize(provider);
      this.initialized = true;

      if (typeof window !== 'undefined') {
        console.log('[NexusService] localStorage keys after init:', Object.keys(localStorage).filter(k =>
          k.includes('arcana') || k.includes('siwe') || k.includes('ca-') || k.includes('session')
        ));
      }

      console.log('✅ [NexusService] SDK initialized successfully');
    } catch (error) {
      console.error('[NexusService] Failed to initialize Nexus SDK:', error);
      console.error('[NexusService] Error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      this.initialized = false;
      this.sdk = null;
      throw error;
    }
  }

  isInitialized(): boolean {
    return this.initialized && this.sdk !== null;
  }

  async getUnifiedBalances(): Promise<UserAsset[]> {
    if (!this.sdk) throw new Error('Nexus SDK not initialized');
    return await this.sdk.getUnifiedBalances();
  }

  async getUnifiedBalance(symbol: string): Promise<UserAsset | undefined> {
    if (!this.sdk) throw new Error('Nexus SDK not initialized');
    return await this.sdk.getUnifiedBalance(symbol);
  }

  async bridge(params: {
    token: string;
    amount: string;
    toChainId: number;
  }): Promise<BridgeResult> {
    if (!this.sdk) throw new Error('Nexus SDK not initialized');

    console.log('[NexusService] Bridge parameters:', {
      token: params.token,
      amount: params.amount,
      toChainId: params.toChainId,
    });

    const bridgeParams = {
      token: params.token,
      amount: parseFloat(params.amount),
      chainId: params.toChainId,
    };

    console.log('[NexusService] Sending to Nexus SDK:', bridgeParams);

    try {
      const result = await this.sdk.bridge(bridgeParams as BridgeParams);
      console.log('[NexusService] Bridge response:', result);
      return result;
    } catch (error) {
      console.error('[NexusService] Bridge error:', {
        message: error instanceof Error ? error.message : String(error),
        error,
      });
      throw error;
    }
  }

  async simulateBridge(params: {
    token: string;
    amount: string;
    toChainId: number;
  }): Promise<SimulationResult> {
    if (!this.sdk) throw new Error('Nexus SDK not initialized');

    const bridgeParams = {
      token: params.token,
      amount: parseFloat(params.amount),
      chainId: params.toChainId,
    };

    console.log('[NexusService] Simulating bridge with params:', bridgeParams);

    try {
      return await this.sdk.simulateBridge(bridgeParams as BridgeParams);
    } catch (error) {
      console.error('[NexusService] Simulation error:', error);
      throw error;
    }
  }

  async transfer(params: {
    token: string;
    amount: string;
    toChainId: number;
    recipient: string;
  }): Promise<TransferResult> {
    if (!this.sdk) throw new Error('Nexus SDK not initialized');

    const transferParams: TransferParams = {
      token: params.token,
      amount: parseFloat(params.amount),
      chainId: params.toChainId,
      recipient: params.recipient as `0x${string}`,
    } as TransferParams;

    return await this.sdk.transfer(transferParams);
  }

  async simulateTransfer(params: {
    token: string;
    amount: string;
    toChainId: number;
    recipient: string;
  }): Promise<SimulationResult> {
    if (!this.sdk) throw new Error('Nexus SDK not initialized');

    const transferParams: TransferParams = {
      token: params.token,
      amount: parseFloat(params.amount),
      chainId: params.toChainId,
      recipient: params.recipient as `0x${string}`,
    } as TransferParams;

    return await this.sdk.simulateTransfer(transferParams);
  }

  async execute(params: ExecuteParams): Promise<ExecuteResult> {
    if (!this.sdk) throw new Error('Nexus SDK not initialized');
    return await this.sdk.execute(params);
  }

  async simulateExecute(params: ExecuteParams): Promise<ExecuteSimulation> {
    if (!this.sdk) throw new Error('Nexus SDK not initialized');
    return await this.sdk.simulateExecute(params);
  }

  async bridgeAndExecute(params: BridgeAndExecuteParams): Promise<BridgeAndExecuteResult> {
    if (!this.sdk) throw new Error('Nexus SDK not initialized');
    return await this.sdk.bridgeAndExecute(params);
  }

  async simulateBridgeAndExecute(params: BridgeAndExecuteParams): Promise<BridgeAndExecuteSimulationResult> {
    if (!this.sdk) throw new Error('Nexus SDK not initialized');
    return await this.sdk.simulateBridgeAndExecute(params);
  }

  setOnIntentHook(callback: OnIntentHook): void {
    if (!this.sdk) throw new Error('Nexus SDK not initialized');
    this.sdk.setOnIntentHook(callback);
  }

  setOnAllowanceHook(callback: OnAllowanceHook): void {
    if (!this.sdk) throw new Error('Nexus SDK not initialized');
    this.sdk.setOnAllowanceHook(callback);
  }

  onProgress(callback: (event: string, data: unknown) => void): void {
    if (!this.sdk) throw new Error('Nexus SDK not initialized');

    this.sdk.nexusEvents.on('expected_steps', (steps) => {
      callback('expected_steps', steps);
    });

    this.sdk.nexusEvents.on('step_complete', (step) => {
      callback('step_complete', step);
    });

    this.sdk.nexusEvents.on('bridge_execute_expected_steps', (steps) => {
      callback('bridge_execute_expected_steps', steps);
    });

    this.sdk.nexusEvents.on('bridge_execute_completed_steps', (step) => {
      callback('bridge_execute_completed_steps', step);
    });
  }

  getUtils() {
    if (!this.sdk) throw new Error('Nexus SDK not initialized');
    return this.sdk.utils;
  }

  getProvider() {
    if (!this.sdk) throw new Error('Nexus SDK not initialized');
    return (this.sdk as typeof this.sdk & { provider?: unknown }).provider;
  }

  async deinit(): Promise<void> {
    if (this.sdk) {
      await this.sdk.deinit();
      this.sdk = null;
      this.initialized = false;
    }
  }
}

// Singleton instance
let nexusServiceInstance: NexusService | null = null;

export function getNexusService(): NexusService {
  if (!nexusServiceInstance) {
    nexusServiceInstance = new NexusService();
  }
  return nexusServiceInstance;
}

export { NexusService };

