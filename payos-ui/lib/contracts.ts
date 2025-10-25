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

// Contract addresses for each chain
export const SPLIT_BILL_ADDRESSES: ContractAddresses = {
  11155111: '0x7EbF1eE41F3212Eb48640a08F639E851B1f73aEf', // Ethereum
  421614: '0x7EbF1eE41F3212Eb48640a08F639E851B1f73aEf', // Arbitrum
  11155420: '0x7EbF1eE41F3212Eb48640a08F639E851B1f73aEf', // Optimism
  84532: '0x7EbF1eE41F3212Eb48640a08F639E851B1f73aEf', // Base
  80002: '0x7EbF1eE41F3212Eb48640a08F639E851B1f73aEf', // Polygon
};

// Contract ABI (simplified version)
export const SPLIT_BILL_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_recipient",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_targetChainId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "_targetToken",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_targetAmount",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "_description",
        "type": "string"
      },
      {
        "internalType": "address[]",
        "name": "_contributors",
        "type": "address[]"
      },
      {
        "internalType": "uint256[]",
        "name": "_contributorAmounts",
        "type": "uint256[]"
      }
    ],
    "name": "createSplit",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
];

// Helper function to get contract address for a chain
export function getContractAddress(chainId: number): string {
  const address = SPLIT_BILL_ADDRESSES[chainId];
  if (!address || address === '0x0000000000000000000000000000000000000000') {
    throw new Error(`Contract not deployed on chain ${chainId}`);
  }
  return address;
}

// Helper function to get contract config
export function getContractConfig(chainId: number): ContractConfig {
  const address = getContractAddress(chainId);
  return {
    address,
    abi: SPLIT_BILL_ABI,
    chainId,
    name: getChainName(chainId),
    blockExplorer: getBlockExplorer(chainId)
  };
}

// Helper function to get chain name
export function getChainName(chainId: number): string {
  const chainNames: { [key: number]: string } = {
    1: 'Ethereum',
    42161: 'Arbitrum',
    10: 'Optimism',
    8453: 'Base',
    137: 'Polygon'
  };
  return chainNames[chainId] || 'Unknown';
}

// Helper function to get block explorer URL
export function getBlockExplorer(chainId: number): string {
  const explorers: { [key: number]: string } = {
    1: 'https://etherscan.io',
    42161: 'https://arbiscan.io',
    10: 'https://optimistic.etherscan.io',
    8453: 'https://basescan.org',
    137: 'https://polygonscan.com'
  };
  return explorers[chainId] || '';
}

// Helper function to check if contract is deployed on chain
export function isContractDeployed(chainId: number): boolean {
  const address = SPLIT_BILL_ADDRESSES[chainId];
  return Boolean(address && address !== '0x0000000000000000000000000000000000000000');
}

// Helper function to get all deployed chains
export function getDeployedChains(): number[] {
  return Object.keys(SPLIT_BILL_ADDRESSES)
    .map(Number)
    .filter(chainId => isContractDeployed(chainId));
}
