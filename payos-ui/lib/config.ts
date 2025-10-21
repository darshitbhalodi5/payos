import { OP_SEPOLIA_RPC, BASE_SEPOLIA_RPC, POLYGON_AMOY_RPC, ARB_SEPOLIA_RPC, ETH_SEPOLIA_RPC } from '@/lib/environment-config';

export interface TokenInfo {
  symbol: string;
  name: string;
  decimals: number;
  address: Record<number, string>;
  logo?: string;
}

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

// Supported Chains
export const SUPPORTED_CHAINS: ChainInfo[] = [
  {
    id: 11155111,
    name: 'Ethereum Sepolia',
    symbol: 'ETH',
    rpcUrl: ETH_SEPOLIA_RPC,
    blockExplorer: 'https://sepolia.etherscan.io',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
  },
  {
    id: 421614,
    name: 'Arbitrum Sepolia',
    symbol: 'ARB',
    rpcUrl: ARB_SEPOLIA_RPC,
    blockExplorer: 'https://sepolia.arbiscan.io',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
  },
  {
    id: 11155420,
    name: 'Optimism Sepolia',
    symbol: 'OP',
    rpcUrl: OP_SEPOLIA_RPC,
    blockExplorer: 'https://sepolia-optimism.etherscan.io',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
  },
  {
    id: 84532,
    name: 'Base Sepolia',
    symbol: 'BASE',
    rpcUrl: BASE_SEPOLIA_RPC,
    blockExplorer: 'https://sepolia.basescan.org',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
  },
  {
    id: 80002,
    name: 'Polygon Amoy',
    symbol: 'POL',
    rpcUrl: POLYGON_AMOY_RPC,
    blockExplorer: 'https://amoy.polygonscan.com',
    nativeCurrency: {
      name: 'Polygon',
      symbol: 'POL',
      decimals: 18,
    },
  },
];

// Supported Tokens with addresses for each chain
export const SUPPORTED_TOKENS: TokenInfo[] = [
  {
    symbol: 'ETH',
    name: 'Ether',
    decimals: 18,
    address: {
      11155111: '0x0000000000000000000000000000000000000000', // Native ETH
      421614: '0x0000000000000000000000000000000000000000', // Native ETH on Arbitrum
      11155420: '0x0000000000000000000000000000000000000000', // Native ETH on Optimism
      84532: '0x0000000000000000000000000000000000000000', // Native ETH on Base
      80002: '0x52eF3d68BaB452a294342DC3e5f464d7f610f72E', // Wrapped ETH on Polygon
    },
  },
  {
    symbol: 'PYUSD',
    name: 'PayPal USD',
    decimals: 6,
    address: {
      11155111: '0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9', // Ethereum
      421614: '0x6c3ea9036406852006290770BEdFcAbA0e23A0e8', // Arbitrum
      11155420: '0x6c3ea9036406852006290770BEdFcAbA0e23A0e8', // Optimism
      84532: '0x6c3ea9036406852006290770BEdFcAbA0e23A0e8', // Base
      80002: '0x6c3ea9036406852006290770BEdFcAbA0e23A0e8', // Polygon
    },
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    address: {
      11155111: '0xA0b86a33e6441C8C06dDD4341B4c24CB16f56E38', // Ethereum
      421614: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', // Arbitrum
      11155420: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85', // Optimism
      84532: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // Base
      80002: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', // Polygon
    },
  },
  {
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
    address: {
      11155111: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // Ethereum
      421614: '0x30fa2fbe15c1eadfbef28c188b7b8dbd3c1ff2eb',
      11155420: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58', // Optimism
      84532: '0x323e78f944A9a1FcF3a10efcC5319DBb0bB6e673',
      80002: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', // Polygon
    },
  },
];

// Token availability by chain
export const TOKEN_AVAILABILITY: Record<number, string[]> = {
  11155111: ['ETH', 'PYUSD', 'USDC', 'USDT'],
  421614: ['ETH', 'PYUSD', 'USDC', 'USDT'],
  11155420: ['ETH', 'USDC', 'USDT'],
  84532: ['ETH', 'USDC', 'USDT'],
  80002: ['ETH', 'USDC', 'USDT'],
};

// Helper functions
export function getTokenAddress(symbol: string, chainId: number): string | null {
  const token = SUPPORTED_TOKENS.find(t => t.symbol === symbol);
  if (!token) return null;
  return token.address[chainId] || null;
}

export function getTokenInfo(symbol: string): TokenInfo | null {
  return SUPPORTED_TOKENS.find(t => t.symbol === symbol) || null;
}

export function getChainInfo(chainId: number): ChainInfo | null {
  return SUPPORTED_CHAINS.find(c => c.id === chainId) || null;
}

export function getAvailableTokens(chainId: number): TokenInfo[] {
  const availableSymbols = TOKEN_AVAILABILITY[chainId] || [];
  return SUPPORTED_TOKENS.filter(token => availableSymbols.includes(token.symbol));
}

export function isTokenAvailableOnChain(symbol: string, chainId: number): boolean {
  const availableTokens = getAvailableTokens(chainId);
  return availableTokens.some(token => token.symbol === symbol);
}

export function validateTokenSelection(symbol: string, chainId: number): boolean {
  return isTokenAvailableOnChain(symbol, chainId);
}

export function validateChainSelection(chainId: number): boolean {
  return SUPPORTED_CHAINS.some(chain => chain.id === chainId);
}

// Default configurations
export const DEFAULT_CHAIN_ID = 11155111; // Arbitrum
export const DEFAULT_TOKEN = 'PYUSD';
