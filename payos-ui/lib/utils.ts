// Utility functions for PayOS Split functionality
// Common operations, formatting, validation, etc.

import { parseUnits, formatUnits } from 'viem';
import { getTokenInfo } from './token-config';

// ============ FORMATTING UTILITIES ============

/**
 * Format address to show first 6 and last 4 characters
 */
export function formatAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Format amount with proper decimals and token symbol
 */
export function formatAmount(
  amount: string | number,
  tokenSymbol: string,
  showDecimals: number = 2
): string {
  const tokenInfo = getTokenInfo(tokenSymbol);
  if (!tokenInfo) return `${amount} ${tokenSymbol}`;

  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numAmount)) return `0 ${tokenSymbol}`;

  return `${numAmount.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: showDecimals
  })} ${tokenSymbol}`;
}

/**
 * Format amount from wei/smallest unit to human readable
 */
export function formatAmountFromWei(
  amountWei: string | bigint,
  tokenSymbol: string,
  showDecimals: number = 2
): string {
  const tokenInfo = getTokenInfo(tokenSymbol);
  if (!tokenInfo) return `${amountWei} ${tokenSymbol}`;

  try {
    const formatted = formatUnits(BigInt(amountWei.toString()), tokenInfo.decimals);
    const numAmount = parseFloat(formatted);
    
    return `${numAmount.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: showDecimals
    })} ${tokenSymbol}`;
  } catch (error) {
    console.error('Error formatting amount from wei:', error);
    return `${amountWei} ${tokenSymbol}`;
  }
}

/**
 * Convert human readable amount to wei/smallest unit
 */
export function parseAmountToWei(
  amount: string,
  tokenSymbol: string
): string {
  const tokenInfo = getTokenInfo(tokenSymbol);
  if (!tokenInfo) throw new Error(`Token ${tokenSymbol} not found`);

  try {
    return parseUnits(amount, tokenInfo.decimals).toString();
  } catch (error) {
    console.error('Error parsing amount to wei:', error);
    throw new Error(`Invalid amount: ${amount}`);
  }
}

/**
 * Format time relative to now
 */
export function formatTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
}

/**
 * Format time as readable date
 */
export function formatDateTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString();
}

/**
 * Calculate progress percentage
 */
export function calculateProgress(current: string | number, target: string | number): number {
  const currentNum = typeof current === 'string' ? parseFloat(current) : current;
  const targetNum = typeof target === 'string' ? parseFloat(target) : target;
  
  if (isNaN(currentNum) || isNaN(targetNum) || targetNum === 0) return 0;
  
  return Math.min((currentNum / targetNum) * 100, 100);
}

// ============ VALIDATION UTILITIES ============

/**
 * Validate Ethereum address
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Validate chain ID
 */
export function isValidChainId(chainId: number): boolean {
  const supportedChains = [1, 137, 42161, 10, 8453, 11155111, 80002, 421614, 11155420, 84532];
  return supportedChains.includes(chainId);
}

/**
 * Validate token symbol
 */
export function isValidTokenSymbol(symbol: string): boolean {
  const supportedTokens = ['ETH', 'USDC', 'PYUSD'];
  return supportedTokens.includes(symbol.toUpperCase());
}

/**
 * Validate amount (must be positive number)
 */
export function isValidAmount(amount: string | number): boolean {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return !isNaN(numAmount) && numAmount > 0;
}

/**
 * Validate split creation parameters
 */
export function validateSplitCreation(params: {
  recipient: string;
  targetChainId: number;
  targetToken: string;
  targetAmount: string;
  description: string;
  contributors: string[];
  contributorAmounts: string[];
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate recipient
  if (!params.recipient || !isValidAddress(params.recipient)) {
    errors.push('Invalid recipient address');
  }

  // Validate chain
  if (!isValidChainId(params.targetChainId)) {
    errors.push('Invalid target chain ID');
  }

  // Validate token
  if (!isValidTokenSymbol(params.targetToken)) {
    errors.push('Invalid target token');
  }

  // Validate amount
  if (!isValidAmount(params.targetAmount)) {
    errors.push('Invalid target amount');
  }

  // Validate description
  if (!params.description || params.description.trim().length === 0) {
    errors.push('Description is required');
  }

  // Validate contributors
  if (params.contributors.length === 0) {
    errors.push('At least one contributor is required');
  }

  if (params.contributors.length > 10) {
    errors.push('Maximum 10 contributors allowed');
  }

  // Validate contributor addresses
  for (let i = 0; i < params.contributors.length; i++) {
    if (!isValidAddress(params.contributors[i])) {
      errors.push(`Invalid contributor address at index ${i}`);
    }
  }

  // Validate contributor amounts
  for (let i = 0; i < params.contributorAmounts.length; i++) {
    if (!isValidAmount(params.contributorAmounts[i])) {
      errors.push(`Invalid contributor amount at index ${i}`);
    }
  }

  // Validate total amounts match
  if (params.contributors.length === params.contributorAmounts.length) {
    const totalContributorAmount = params.contributorAmounts.reduce(
      (sum, amount) => sum + parseFloat(amount),
      0
    );
    const targetAmount = parseFloat(params.targetAmount);
    
    if (Math.abs(totalContributorAmount - targetAmount) > 0.01) {
      errors.push('Contributor amounts must equal target amount');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// ============ CALCULATION UTILITIES ============

/**
 * Calculate equal distribution amounts
 */
export function calculateEqualDistribution(
  totalAmount: number,
  contributorCount: number
): number[] {
  if (contributorCount === 0) return [];
  
  const amountPerContributor = totalAmount / contributorCount;
  const amounts: number[] = [];
  
  for (let i = 0; i < contributorCount; i++) {
    amounts.push(amountPerContributor);
  }
  
  return amounts;
}

/**
 * Calculate percentage distribution
 */
export function calculatePercentageDistribution(
  totalAmount: number,
  percentages: number[]
): number[] {
  return percentages.map(percentage => (totalAmount * percentage) / 100);
}

/**
 * Calculate gas cost in USD (approximate)
 */
export function calculateGasCostUSD(
  gasUsed: string,
  gasPrice: string,
  ethPriceUSD: number = 2000
): number {
  try {
    const gasUsedNum = parseFloat(gasUsed);
    const gasPriceNum = parseFloat(gasPrice);
    const gasCostETH = (gasUsedNum * gasPriceNum) / 1e18;
    return gasCostETH * ethPriceUSD;
  } catch (error) {
    console.error('Error calculating gas cost:', error);
    return 0;
  }
}

// ============ STRING UTILITIES ============

/**
 * Truncate string to specified length
 */
export function truncateString(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}

/**
 * Capitalize first letter
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Convert camelCase to Title Case
 */
export function camelToTitle(str: string): string {
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

// ============ ARRAY UTILITIES ============

/**
 * Remove duplicates from array
 */
export function removeDuplicates<T>(array: T[]): T[] {
  return [...new Set(array)];
}

/**
 * Chunk array into smaller arrays
 */
export function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

/**
 * Sort array by property
 */
export function sortBy<T>(
  array: T[],
  key: keyof T,
  direction: 'asc' | 'desc' = 'asc'
): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
}

// ============ ERROR UTILITIES ============

/**
 * Extract error message from various error types
 */
export function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  
  return 'An unknown error occurred';
}

/**
 * Check if error is a specific type
 */
export function isErrorType(error: unknown, type: string): boolean {
  return error instanceof Error && error.name === type;
}

// ============ LOCAL STORAGE UTILITIES ============

/**
 * Safe localStorage get
 */
export function getFromStorage(key: string, defaultValue: unknown = null): unknown {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return defaultValue;
  }
}

/**
 * Safe localStorage set
 */
export function setToStorage(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error('Error writing to localStorage:', error);
    return false;
  }
}

/**
 * Safe localStorage remove
 */
export function removeFromStorage(key: string): boolean {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Error removing from localStorage:', error);
    return false;
  }
}

// ============ DEBOUNCE UTILITIES ============

/**
 * Debounce function calls
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function calls
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}
