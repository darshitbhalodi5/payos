import { ETH_SEPOLIA_RPC, ARB_SEPOLIA_RPC, OP_SEPOLIA_RPC, BASE_SEPOLIA_RPC } from '@/lib/environment-config';

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
        logo: 'eth.svg',
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
        logo: 'arb.svg',
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
        logo: 'op.svg',
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
        logo: 'base.svg',
        rpcUrl: BASE_SEPOLIA_RPC,
        blockExplorer: 'https://sepolia.basescan.org',
        nativeCurrency: {
            name: 'Ether',
            symbol: 'ETH',
            decimals: 18,
        },
    },
];

// Get chain info by chain id
export function getChainInfo(chainId: number): ChainInfo | null {
    return SUPPORTED_CHAINS.find(c => c.id === chainId) || null;
}

// Validate chain selection
export function validateChainSelection(chainId: number): boolean {
    return SUPPORTED_CHAINS.some(chain => chain.id === chainId);
}