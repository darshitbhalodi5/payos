export interface TokenInfo {
  symbol: string;
  name: string;
  decimals: number;
  address: Record<number, string>;
  logo?: string;
}

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
    },
  },
];

// Token availability by chain
export const TOKEN_AVAILABILITY: Record<number, string[]> = {
  11155111: ['ETH', 'PYUSD', 'USDC'],
  421614: ['ETH', 'PYUSD', 'USDC'],
  11155420: ['ETH', 'USDC'],
  84532: ['ETH', 'USDC'],
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

// Default configurations
export const DEFAULT_CHAIN_ID = 11155111;
export const DEFAULT_TOKEN = 'PYUSD';
