import { AvailNexusConfig, BridgeResult, BridgeAndExecuteParams } from './types';
import { getTokenAddress } from './token-config';
import { formatAmountFromWei, parseAmountToWei } from './utils';

// TODO: Uncomment when real SDK is available
// import { NexusSDK } from '@avail-project/nexus-core';

// Interface for the SDK methods
interface NexusSDKInterface {
  bridgeAndExecute: (params: unknown) => Promise<BridgeResult>;
  getUnifiedBalance: (params: { address: string; tokens: string[] }) => Promise<Record<string, Record<string, string>>>;
  getSupportedChains: () => Promise<Array<{ id: number; name: string; symbol: string }>>;
  estimateGas: (params: unknown) => Promise<{ gasLimit: string; gasPrice: string; estimatedCost: string }>;
  getTransactionStatus: (txHash: string) => Promise<{ status: 'pending' | 'completed' | 'failed'; confirmations: number; blockNumber?: number }>;
  getQuote?: (params: { fromToken: string; toToken: string; amount: string }) => Promise<{ toAmount: string }>;
}

export class AvailNexusHelper {
  private sdk: NexusSDKInterface | null = null;
  private initialized = false;
  private config: AvailNexusConfig;

  constructor(config: AvailNexusConfig) {
    this.config = config;
  }

  /**
   * Initialize the Avail Nexus SDK
   * This should be called once when the app starts
   */
  async initialize(_provider: unknown): Promise<void> {
    try {
      console.log('🚀 Initializing Avail Nexus SDK...');
      
      // TODO: Replace with actual SDK initialization
      // In production, this would be:
      // this.sdk = new NexusSDK({
      //   apiKey: this.config.apiKey,
      //   environment: this.config.environment,
      //   supportedChains: this.config.supportedChains
      // });
      // await this.sdk.initialize(provider);
      
      // For now, set SDK to null - real implementation needed
      this.sdk = null;
      
      this.initialized = true;
      console.log('✅ Avail SDK initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Avail SDK:', error);
      throw error;
    }
  }

  /**
   * Check if SDK is ready
   */
  isReady(): boolean {
    return this.initialized && this.sdk !== null;
  }

  /**
   * Contribute to a split using Avail SDK
   * This handles ALL cross-chain operations automatically
   */
  async contributeToSplit(params: {
    splitId: string;
    contributor: string;
    sourceToken: string; // ETH, USDC, USDT
    sourceAmount: string; // Amount in source token (wei/smallest unit)
    sourceChainId: number; // Chain user is paying from
    targetChainId: number; // Chain recipient wants payment on
    contractAddress: string; // PayosSplit contract address on target chain
    contractAbi: unknown[]; // Contract ABI
  }): Promise<BridgeResult> {
    if (!this.isReady()) {
      throw new Error('Avail Nexus SDK not initialized - real SDK implementation needed');
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

    // Get PYUSD address on target chain
    const pyusdAddress = getTokenAddress('PYUSD', targetChainId);
    if (!pyusdAddress) {
      throw new Error(`PYUSD not supported on chain ${targetChainId}`);
    }

    // Calculate target amount in PYUSD
    const targetAmount = await this.estimateConversion(
      sourceToken,
      sourceAmount,
      'PYUSD'
    );

    try {
      // Use Avail SDK's bridgeAndExecute
      // This will:
      // 1. Bridge tokens from source chain to target chain
      // 2. Convert source token to PYUSD
      // 3. Call contributeToBill on your contract
      // 4. All in ONE transaction!
      
      const result = await this.sdk!.bridgeAndExecute({
        // Source: What user is paying with
        sourceToken,
        sourceAmount,
        sourceChainId,
        
        // Target: What recipient gets
        targetToken: 'PYUSD',
        targetAmount,
        targetChainId,
        
        // Contract interaction
        contractAddress,
        contractAbi,
        functionName: 'contributeToBill',
        functionParams: [
          splitId,
          contributor,
          sourceChainId,
          sourceToken,
          sourceAmount,
          targetAmount
        ],
        
        // Optional: Gas optimization
        gasLimit: '300000', // Estimated gas for bridge + execute
      });

      console.log('✅ Contribution successful:', result);
      return result;
    } catch (error) {
      console.error('❌ Contribution failed:', error);
      throw error;
    }
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
      throw new Error('Avail Nexus SDK not initialized - real SDK implementation needed');
    }

    try {
      // Use SDK's quote functionality if available
      if (this.sdk && this.sdk.getQuote) {
        const quote = await this.sdk.getQuote({
          fromToken,
          toToken,
          amount: fromAmount,
        });
        return quote.toAmount;
      }

      // Fallback: Simple estimation
      // For stablecoins, assume 1:1
      if (
        ['USDC', 'USDT', 'PYUSD'].includes(fromToken) &&
        ['USDC', 'USDT', 'PYUSD'].includes(toToken)
      ) {
        return fromAmount;
      }

      // Real price oracle integration needed
      throw new Error('Price estimation not available - real SDK implementation needed');
    } catch (error) {
      console.error('Failed to estimate conversion:', error);
      throw error;
    }
  }

  /**
   * Get user's token balance across all chains
   */
  async getUnifiedBalance(userAddress: string) {
    if (!this.isReady()) {
      throw new Error('Avail Nexus SDK not initialized - real SDK implementation needed');
    }

    try {
      // Use SDK's unified balance functionality
      return await this.sdk!.getUnifiedBalance({
        address: userAddress,
        tokens: ['ETH', 'USDC', 'USDT', 'PYUSD'],
      });
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
      throw new Error('Avail Nexus SDK not initialized - real SDK implementation needed');
    }

    try {
      // Use SDK's supported chains functionality
      return await this.sdk!.getSupportedChains();
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
      throw new Error('Avail Nexus SDK not initialized - real SDK implementation needed');
    }

    try {
      // Use SDK's gas estimation
      return await this.sdk!.estimateGas(params);
    } catch (error) {
      console.error('Failed to estimate gas:', error);
      throw error;
    }
  }

  /**
   * Get transaction status
   */
  async getTransactionStatus(txHash: string): Promise<{
    status: 'pending' | 'completed' | 'failed';
    confirmations: number;
    blockNumber?: number;
  }> {
    if (!this.isReady()) {
      throw new Error('Avail Nexus SDK not initialized - real SDK implementation needed');
    }

    try {
      // Use SDK's transaction status functionality
      return await this.sdk!.getTransactionStatus(txHash);
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
  getSDK(): NexusSDKInterface | null {
    return this.sdk;
  }
}

// ============ MOCK METHODS REMOVED - Real SDK implementation needed ============

// Default configuration
export const DEFAULT_AVAIL_CONFIG: AvailNexusConfig = {
  apiKey: process.env.NEXT_PUBLIC_AVAIL_NEXUS_API_KEY || '',
  environment: 'testnet',
  supportedChains: [11155111, 80002, 421614, 11155420, 84532], // Ethereum Sepolia, Polygon Amoy, Arbitrum Sepolia, Optimism Sepolia, Base Sepolia
  supportedTokens: ['ETH', 'USDC', 'USDT', 'PYUSD']
};

// Create and export a singleton instance
export const availNexusHelper = new AvailNexusHelper(DEFAULT_AVAIL_CONFIG);