// Centralized type definitions for PayOS Split functionality
// This eliminates duplication across hooks and components

export interface SplitData {
  id: string;
  creator: string;
  recipient: string;
  targetChainId: number;
  targetToken: string;
  targetAmount: string;
  currentAmount: string;
  description: string;
  status: 'active' | 'completed';
  contributors: ContributorInfo[];
  contributions: ContributionInfo[];
  createdAt: number;
  completedAt?: number;
}

export interface ContributorInfo {
  contributor: string;
  targetAmount: string;
  contributedAmount: string;
  hasContributed: boolean;
  lastContributionTime: number;
}

export interface ContributionInfo {
  contributor: string;
  sourceChainId: number;
  sourceToken: string;
  sourceAmount: string;
  targetAmount: string;
  txHash: string;
  timestamp: number;
  status: 'pending' | 'completed' | 'failed';
}

// Contract-specific types
export interface SplitBill {
  id: string;
  targetAmount: string;
  currentAmount: string;
  targetChainId: number;
  creator: string;
  recipient: string;
  targetToken: string;
  createdAt: number;
  completedAt: number;
  status: 'active' | 'completed';
}

export interface Contribution {
  txHash: string;
  sourceChainId: number;
  sourceAmount: string;
  targetAmount: string;
  contributor: string;
  timestamp: number;
}

// Avail Nexus SDK types
export interface AvailNexusConfig {
  apiKey: string;
  environment: 'testnet' | 'mainnet';
  supportedChains: number[];
}

export interface BridgeAndExecuteParams {
  token: string;
  amount: string;
  sourceChainId: number;
  targetChainId: number;
  recipient: string;
  execute: {
    contractAddress: string;
    functionName: string;
    functionParams: unknown[];
  };
  tokenApproval?: {
    token: string;
    amount: string;
  };
}

export interface BridgeResult {
  transactionHash: string;
  status: 'pending' | 'completed' | 'failed';
  estimatedTime: number;
  gasUsed?: string;
  gasPrice?: string;
}

// Chain and token configuration types
export interface ChainInfo {
  id: number;
  name: string;
  symbol: string;
  rpcUrl: string;
  blockExplorer: string;
  logo?: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

export interface TokenInfo {
  symbol: string;
  name: string;
  decimals: number;
  address: Record<number, string>;
  logo?: string;
}

// Contract configuration types
export interface ContractAddresses {
  [chainId: number]: string;
}

export interface ContractConfig {
  address: string;
  abi: unknown[];
  chainId: number;
  name: string;
  blockExplorer: string;
}

// Form types
export interface Contributor {
  address: string;
  amount: number;
  percentage: number;
}

export interface SplitCreationParams {
  recipient: string;
  targetChainId: number;
  targetToken: string;
  targetAmount: string;
  description: string;
  contributors: string[];
  contributorAmounts: string[];
}

export interface ContributionParams {
  splitId: string;
  sourceChainId: number;
  sourceToken: string;
  sourceAmount: string;
  targetChainId: number;
  targetToken: string;
  targetAmount: string;
}

// Error types
export interface AppError {
  message: string;
  code?: string;
  details?: unknown;
}

// Loading states
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

// Hook return types
export interface UseSplitContractReturn {
  createSplit: (params: SplitCreationParams) => Promise<string>;
  createSimpleSplit: (params: Omit<SplitCreationParams, 'contributorAmounts'>) => Promise<string>;
  contributeToSplit: (params: ContributionParams) => Promise<string>;
  getSplitData: (splitId: string, chainId: number) => Promise<SplitData>;
  getAvailableChains: () => number[];
  isChainSupported: (chainId: number) => boolean;
  clearError: () => void;
  isLoading: boolean;
  error: string | null;
}

export interface UseSplitsDataReturn {
  splits: SplitData[];
  isLoading: boolean;
  error: string | null;
  getSplitsByStatus: (status: 'active' | 'completed') => SplitData[];
  getCreatedSplits: () => SplitData[];
  getReceivedSplits: () => SplitData[];
  getContributedSplits: () => SplitData[];
  refreshSplits: () => void;
}

export interface UseAvailNexusReturn {
  sdk: unknown;
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  bridgeAndExecute: (params: BridgeAndExecuteParams) => Promise<BridgeResult>;
  getTokenBalance: (token: string, address: string, chainId: number) => Promise<string>;
  getSupportedTokens: (chainId: number) => Promise<TokenInfo[]>;
  estimateGas: (params: BridgeAndExecuteParams) => Promise<{
    gasLimit: string;
    gasPrice: string;
    estimatedCost: string;
  }>;
  getTransactionStatus: (txHash: string) => Promise<{
    status: 'pending' | 'completed' | 'failed';
    confirmations: number;
    blockNumber?: number;
  }>;
  clearError: () => void;
}
