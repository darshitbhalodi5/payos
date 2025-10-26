import { AvailNexusConfig, BridgeResult, BridgeAndExecuteParams } from './types';

// Mock types until the real SDK is available
type NexusSDK = {
  initialize: (provider: unknown) => Promise<void>;
  setOnIntentHook: (hook: (params: IntentHookParams) => void) => void;
  setOnAllowanceHook: (hook: (params: AllowanceHookParams) => void) => void;
  onAccountChanged: (callback: (account: string) => void) => void;
  onChainChanged: (callback: (chainId: number) => void) => void;
  nexusEvents: {
    on: (event: string, callback: (data: unknown) => void) => () => void;
  };
  bridgeAndExecute: (params: BridgeExecuteParams) => Promise<BridgeExecuteResult>;
  getUnifiedBalances: () => Promise<UserAsset[]>;
  utils: {
    getSupportedChains: () => ChainInfo[];
  };
  simulateBridgeAndExecute: (params: BridgeExecuteParams) => Promise<SimulationResult>;
  deinit: () => Promise<void>;
};

type IntentHookParams = {
  intent: unknown;
  allow: () => void;
  deny: () => void;
  refresh: () => void;
};

type AllowanceHookParams = {
  allow: (allowances: string[]) => void;
  deny: () => void;
  sources: unknown[];
};

type BridgeExecuteParams = {
  token: string;
  amount: string;
  toChainId: number;
  sourceChains: number[];
  execute: {
    contractAddress: string;
    contractAbi: unknown[];
    functionName: string;
    buildFunctionParams: (token: string, amount: string, chainId: number, userAddress: string) => { functionParams: unknown[] };
    tokenApproval: {
      token: string;
      amount: string;
    };
  };
  waitForReceipt: boolean;
  requiredConfirmations: number;
};

type BridgeExecuteResult = {
  success: boolean;
  transactionHash: string;
  estimatedTime: number;
  gasUsed: string;
  gasPrice: string;
};

type UserAsset = {
  symbol: string;
  balance: string;
  breakdown?: Array<{
    chain: { id: number };
    balance: string;
  }>;
};

type ChainInfo = {
  id: number;
  name: string;
  symbol: string;
};

type SimulationResult = {
  success: boolean;
  totalEstimatedCost: string;
  steps: unknown[];
};

const NEXUS_EVENTS = {
  BRIDGE_EXECUTE_EXPECTED_STEPS: 'bridge_execute_expected_steps',
  BRIDGE_EXECUTE_COMPLETED_STEPS: 'bridge_execute_completed_steps',
  EXPECTED_STEPS: 'expected_steps',
  STEP_COMPLETE: 'step_complete',
} as const;

export class AvailNexusHelper {
  private sdk: NexusSDK | null = null;
  private initialized = false;
  private config: AvailNexusConfig;
  private eventListeners: Array<() => void> = [];

  constructor(config: AvailNexusConfig) {
    this.config = config;
  }

  /**
   * Initialize the Avail Nexus SDK
   * This should be called once when the app starts
   */
  async initialize(provider: unknown): Promise<void> {
    try {
      console.log('🚀 Initializing Avail Nexus SDK...');
      
      // Validate provider
      if (!provider) {
        throw new Error('No provider provided for Avail Nexus SDK initialization');
      }
      
      console.log('Provider received:', typeof provider);
      
      // Mock SDK implementation until real package is available
      this.sdk = {
        initialize: async (prov: unknown) => {
          console.log('Mock SDK initialized with provider:', prov);
          await new Promise(resolve => setTimeout(resolve, 1000));
        },
        setOnIntentHook: () => {
          console.log('Mock intent hook set');
        },
        setOnAllowanceHook: () => {
          console.log('Mock allowance hook set');
        },
        onAccountChanged: () => {
          console.log('Mock account change listener set');
        },
        onChainChanged: () => {
          console.log('Mock chain change listener set');
        },
        nexusEvents: {
          on: (event: string) => {
            console.log(`Mock event listener set for ${event}`);
            return () => console.log(`Mock event listener removed for ${event}`);
          }
        },
        bridgeAndExecute: async (params: BridgeExecuteParams) => {
          console.log('Mock bridgeAndExecute called with:', params);
          await new Promise(resolve => setTimeout(resolve, 2000));
          return {
            success: true,
            transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
            estimatedTime: 120,
            gasUsed: '150000',
            gasPrice: '20000000000'
          };
        },
        getUnifiedBalances: async () => {
          console.log('Mock getUnifiedBalances called');
          return [
            {
              symbol: 'ETH',
              balance: '1000000000000000000', // 1 ETH
              breakdown: [
                { chain: { id: 11155111 }, balance: '1000000000000000000' }
              ]
            },
            {
              symbol: 'USDC',
              balance: '1000000000', // 1000 USDC
              breakdown: [
                { chain: { id: 11155111 }, balance: '1000000000' }
              ]
            }
          ];
        },
        utils: {
          getSupportedChains: () => {
            return [
              { id: 11155111, name: 'Ethereum Sepolia', symbol: 'ETH' },
              { id: 421614, name: 'Arbitrum Sepolia', symbol: 'ARB' },
              { id: 11155420, name: 'Optimism Sepolia', symbol: 'OP' },
              { id: 84532, name: 'Base Sepolia', symbol: 'BASE' },
            ];
          }
        },
        simulateBridgeAndExecute: async (params: BridgeExecuteParams) => {
          console.log('Mock simulateBridgeAndExecute called with:', params);
          return {
            success: true,
            totalEstimatedCost: '0.01',
            steps: []
          };
        },
        deinit: async () => {
          console.log('Mock SDK deinitialized');
        }
      };
      
          // Initialize with provider
          await this.sdk.initialize(provider);
          
          // Set up event hooks for user interactions
          this.setupEventHooks();
          
          // Set up progress event listeners
          this.setupProgressListeners();
          
          this.initialized = true;
          console.log('✅ Avail SDK initialized successfully (Mock Mode)');
          console.log('SDK state after initialization:', {
            initialized: this.initialized,
            sdkExists: this.sdk !== null,
            isReady: this.isReady()
          });
    } catch (error) {
      console.error('❌ Failed to initialize Avail SDK:', error);
      throw error;
    }
  }

  /**
   * Set up event hooks for user interactions
   */
  private setupEventHooks(): void {
    if (!this.sdk) return;

    // Intent approval hook
    this.sdk.setOnIntentHook(({ intent, allow }: IntentHookParams) => {
      console.log('Intent approval required:', intent);
      
      // In a real app, you would show a UI modal here
      // For now, we'll auto-approve after a short delay
      setTimeout(() => {
        console.log('Auto-approving intent...');
        allow();
      }, 1000);
    });

    // Allowance approval hook
    this.sdk.setOnAllowanceHook(({ allow, sources }: AllowanceHookParams) => {
      console.log('Allowance approval required:', sources);
      
      // In a real app, you would show a UI modal here
      // For now, we'll auto-approve with minimum allowances
      const allowances = sources.map(() => 'min' as const);
      console.log('Auto-approving allowances:', allowances);
      allow(allowances);
    });

    // Account/chain change listeners
    this.sdk.onAccountChanged((account: string) => {
      console.log('Account changed:', account);
    });

    this.sdk.onChainChanged((chainId: number) => {
      console.log('Chain changed:', chainId);
    });
  }

  /**
   * Set up progress event listeners
   */
  private setupProgressListeners(): void {
    if (!this.sdk) return;

    // Bridge & Execute progress listeners
    const unsubscribeBridgeExecuteExpected = this.sdk.nexusEvents.on(
      NEXUS_EVENTS.BRIDGE_EXECUTE_EXPECTED_STEPS,
      (steps: unknown) => {
        console.log('Bridge & Execute expected steps:', steps);
      }
    );

    const unsubscribeBridgeExecuteCompleted = this.sdk.nexusEvents.on(
      NEXUS_EVENTS.BRIDGE_EXECUTE_COMPLETED_STEPS,
      (step: unknown) => {
        console.log('Bridge & Execute completed step:', step);
      }
    );

    // Transfer & Bridge progress listeners
    const unsubscribeTransferExpected = this.sdk.nexusEvents.on(
      NEXUS_EVENTS.EXPECTED_STEPS,
      (steps: unknown) => {
        console.log('Transfer/Bridge expected steps:', steps);
      }
    );

    const unsubscribeTransferCompleted = this.sdk.nexusEvents.on(
      NEXUS_EVENTS.STEP_COMPLETE,
      (step: unknown) => {
        console.log('Transfer/Bridge completed step:', step);
      }
    );

    // Store cleanup functions
    this.eventListeners.push(
      unsubscribeBridgeExecuteExpected,
      unsubscribeBridgeExecuteCompleted,
      unsubscribeTransferExpected,
      unsubscribeTransferCompleted
    );
  }

  /**
   * Check if SDK is ready
   */
  isReady(): boolean {
    const ready = this.initialized && this.sdk !== null;
    console.log('AvailNexusHelper.isReady():', {
      initialized: this.initialized,
      sdkExists: this.sdk !== null,
      ready,
      timestamp: new Date().toISOString()
    });
    return ready;
  }

  /**
   * Contribute to a split using Avail SDK
   * This handles ALL cross-chain operations automatically
   */
  async contributeToSplit(params: {
    splitId: string;
    contributor: string;
    sourceToken: string; // ETH, USDC, PYUSD
    sourceAmount: string; // Amount in source token (wei/smallest unit)
    sourceChainId: number; // Chain user is paying from
    targetChainId: number; // Chain recipient wants payment on
    contractAddress: string; // PayosSplit contract address on target chain
    contractAbi: unknown[]; // Contract ABI
  }): Promise<BridgeResult> {
    if (!this.isReady()) {
      throw new Error('Avail Nexus SDK not initialized');
    }

    const {
      splitId,
      contributor,
      sourceToken,
      sourceAmount,
      sourceChainId,
      targetChainId,
      contractAddress,
      contractAbi,
    } = params;

    console.log('🚀 Starting contribution via Avail SDK...');
    console.log({
      splitId,
      contributor,
      sourceToken,
      sourceAmount,
      from: sourceChainId,
      to: targetChainId,
    });

    try {
      // Convert source amount to proper format for SDK
      const amountInUnits = this.convertAmountToUnits(sourceAmount, sourceToken);

      // Use Avail SDK's bridgeAndExecute for cross-chain contribution
      const result: BridgeExecuteResult = await this.sdk!.bridgeAndExecute({
        token: sourceToken,
        amount: amountInUnits,
        toChainId: targetChainId,
        sourceChains: [sourceChainId],
        execute: {
          contractAddress,
          contractAbi: contractAbi as unknown[],
          functionName: 'contributeToBill',
          buildFunctionParams: (
            token: string,
            amount: string,
          ) => {
            // Convert amount to wei for contract call
            const tokenMetadata: Record<string, { decimals: number }> = {
              'ETH': { decimals: 18 },
              'USDC': { decimals: 6 },
              'PYUSD': { decimals: 6 },
            };
            
            const tokenMeta = tokenMetadata[token];
            const amountWei = BigInt(amount) * BigInt(10 ** tokenMeta.decimals);
            
            // Generate a mock transaction hash for the contribution
            const txHash = `0x${Math.random().toString(16).substr(2, 64)}`;
            
            return {
              functionParams: [
                splitId,
                contributor,
                sourceChainId,
                sourceAmount,
                amountWei.toString(),
                txHash
              ],
            };
          },
          tokenApproval: {
            token: sourceToken,
            amount: amountInUnits,
          },
        },
        waitForReceipt: true,
        requiredConfirmations: 1, // Use 1 confirmation for testnet
      });

      console.log('✅ Contribution successful:', result);

      // Convert SDK result to our BridgeResult format
      return {
        success: result.success,
        transactionHash: result.transactionHash,
        status: result.success ? 'completed' : 'failed',
        estimatedTime: result.estimatedTime || 120,
        gasUsed: result.gasUsed,
        gasPrice: result.gasPrice,
        error: result.success ? undefined : 'Contribution failed',
      };
    } catch (error) {
      console.error('❌ Contribution failed:', error);
      throw error;
    }
  }

  /**
   * Convert amount from wei to token units
   */
  private convertAmountToUnits(amountWei: string, token: string): string {
    // Mock token metadata until real SDK is available
    const tokenMetadata: Record<string, { decimals: number }> = {
      'ETH': { decimals: 18 },
      'USDC': { decimals: 6 },
      'PYUSD': { decimals: 6 },
    };
    
    const tokenMeta = tokenMetadata[token];
    if (!tokenMeta) {
      throw new Error(`Unsupported token: ${token}`);
    }
    
    const amountBigInt = BigInt(amountWei);
    const divisor = BigInt(10 ** tokenMeta.decimals);
    const units = amountBigInt / divisor;
    
    return units.toString();
  }

  /**
   * Estimate token conversion amount
   * Uses Avail SDK's pricing or fallback to 1:1 for stablecoins
   */
  async estimateConversion(
    fromToken: string,
    fromAmount: string,
    toToken: string
  ): Promise<string> {
    if (!this.isReady()) {
      throw new Error('Avail Nexus SDK not initialized');
    }

    try {
      // For stablecoins, assume 1:1 conversion
      if (
        ['USDC', 'PYUSD'].includes(fromToken) &&
        ['USDC', 'PYUSD'].includes(toToken)
      ) {
        return fromAmount;
      }

      // For ETH to stablecoin conversions, use a simple rate
      // In production, you would use Pyth Network price feeds
      if (fromToken === 'ETH' && ['USDC', 'PYUSD'].includes(toToken)) {
        // Mock ETH price of $2000 for testnet
        const ethPrice = 2000;
        const fromAmountNum = parseFloat(fromAmount) / 1e18; // Convert from wei
        const convertedAmount = fromAmountNum * ethPrice;
        return Math.floor(convertedAmount * 1e6).toString(); // Convert to 6 decimals
      }

      // Default fallback
      return fromAmount;
    } catch (error) {
      console.error('Failed to estimate conversion:', error);
      throw error;
    }
  }

  /**
   * Get user's token balance across all chains
   */
  async getUnifiedBalance(_userAddress: string) {
    if (!this.isReady()) {
      throw new Error('Avail Nexus SDK not initialized');
    }

    try {
      // Use SDK's unified balance functionality
      const balances: UserAsset[] = await this.sdk!.getUnifiedBalances();
      
      // Convert to our expected format
      const formattedBalances: Record<string, Record<string, string>> = {};
      
      for (const asset of balances) {
        if (!formattedBalances[asset.symbol]) {
          formattedBalances[asset.symbol] = {};
        }
        
        if (asset.breakdown) {
          for (const chainBalance of asset.breakdown) {
            formattedBalances[asset.symbol][chainBalance.chain.id.toString()] = chainBalance.balance;
          }
        }
      }
      
      return formattedBalances;
    } catch (error) {
      console.error('Failed to get unified balance:', error);
      throw error;
    }
  }

  /**
   * Get supported chains from SDK
   */
  async getSupportedChains() {
    if (!this.isReady()) {
      throw new Error('Avail Nexus SDK not initialized');
    }

    try {
      // Use SDK's supported chains functionality
      const chains = this.sdk!.utils.getSupportedChains();
      return chains.map((chain: ChainInfo) => ({
        id: chain.id,
        name: chain.name,
        symbol: chain.symbol || chain.name
      }));
    } catch (error) {
      console.error('Failed to get supported chains:', error);
      throw error;
    }
  }

  /**
   * Estimate gas for bridge and execute
   */
  async estimateGas(params: BridgeAndExecuteParams): Promise<{
    gasLimit: string;
    gasPrice: string;
    estimatedCost: string;
  }> {
    if (!this.isReady()) {
      throw new Error('Avail Nexus SDK not initialized');
    }

    try {
      // Use SDK's gas estimation
      const simulation = await this.sdk!.simulateBridgeAndExecute({
        token: params.sourceToken,
        amount: this.convertAmountToUnits(params.sourceAmount, params.sourceToken),
        toChainId: params.targetChainId,
        sourceChains: [params.sourceChainId],
        execute: {
          contractAddress: params.contractAddress,
          contractAbi: params.contractAbi as unknown[],
          functionName: 'contributeToBill',
          buildFunctionParams: () => ({ functionParams: [] }),
          tokenApproval: {
            token: params.sourceToken,
            amount: this.convertAmountToUnits(params.sourceAmount, params.sourceToken),
          },
        },
        waitForReceipt: true,
        requiredConfirmations: 1,
      });

      return {
        gasLimit: '300000', // Estimated gas limit
        gasPrice: '20000000000', // 20 gwei
        estimatedCost: simulation.totalEstimatedCost || '0.01',
      };
    } catch (error) {
      console.error('Failed to estimate gas:', error);
      throw error;
    }
  }

  /**
   * Get transaction status
   */
  async getTransactionStatus(_txHash: string): Promise<{
    status: 'pending' | 'completed' | 'failed';
    confirmations: number;
    blockNumber?: number;
  }> {
    if (!this.isReady()) {
      throw new Error('Avail Nexus SDK not initialized');
    }

    try {
      // For now, return a mock status since the SDK doesn't have this method
      // In production, you would query the blockchain directly
      return {
        status: 'completed',
        confirmations: 12,
        blockNumber: Math.floor(Math.random() * 1000000) + 1000000,
      };
    } catch (error) {
      console.error('Failed to get transaction status:', error);
      throw error;
    }
  }

  /**
   * Get SDK configuration
   */
  getConfig(): AvailNexusConfig {
    return this.config;
  }

  /**
   * Get SDK instance (for advanced usage)
   */
  getSDK(): NexusSDK | null {
    return this.sdk;
  }

  /**
   * Cleanup event listeners and deinitialize SDK
   */
  async cleanup(): Promise<void> {
    try {
      // Remove all event listeners
      this.eventListeners.forEach(unsubscribe => unsubscribe());
      this.eventListeners = [];

      // Deinitialize SDK if available
      if (this.sdk) {
        await this.sdk.deinit();
        this.sdk = null;
      }

      this.initialized = false;
      console.log('✅ Avail SDK cleaned up successfully');
    } catch (error) {
      console.error('❌ Failed to cleanup Avail SDK:', error);
    }
  }
}

// Default configuration
export const DEFAULT_AVAIL_CONFIG: AvailNexusConfig = {
  apiKey: process.env.NEXT_PUBLIC_AVAIL_NEXUS_API_KEY || '',
  environment: 'testnet',
  supportedChains: [11155111, 421614, 11155420, 84532], // Ethereum Sepolia, Arbitrum Sepolia, Optimism Sepolia, Base Sepolia
  supportedTokens: ['ETH', 'USDC', 'PYUSD']
};

// Create and export a singleton instance
export const availNexusHelper = new AvailNexusHelper(DEFAULT_AVAIL_CONFIG);