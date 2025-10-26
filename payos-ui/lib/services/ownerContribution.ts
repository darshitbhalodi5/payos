// Owner contribution service - calls contributeToBill as the contract owner
import { privateKeyToAccount } from 'viem/accounts';
import { createWalletClient, http, toBytes, pad, bytesToHex } from 'viem';
import { getContractConfig } from '@/lib/contracts';
import { PAYOS_SPLIT_ABI } from '@/lib/contract-abi';

interface OwnerContributionParams {
  splitId: string;
  contributor: string;
  sourceChainId: number;
  sourceAmount: string;
  targetAmount: string;
  txHash: string;
}

export async function recordOwnerContribution(params: OwnerContributionParams, chainId: number) {
  const ownerPrivateKey = process.env.NEXT_PUBLIC_OWNER_PRIVATE_KEY;
  
  if (!ownerPrivateKey) {
    throw new Error('Owner private key not configured. Set NEXT_PUBLIC_OWNER_PRIVATE_KEY in .env.local');
  }

  // Get contract config for the chain
  const contractConfig = getContractConfig(chainId);
  
  // Define the chain configuration
  const chain = {
    id: chainId,
    name: contractConfig.name,
    network: 'sepolia',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: {
      default: {
        http: ['https://sepolia.infura.io/v3/'],
      },
      public: {
        http: ['https://sepolia.infura.io/v3/'],
      },
    },
    blockExplorers: {
      default: {
        name: 'Etherscan',
        url: contractConfig.blockExplorer,
      },
    },
  };
  
  // Create wallet client with owner's private key
  const account = privateKeyToAccount(ownerPrivateKey as `0x${string}`);
  const client = createWalletClient({
    account,
    chain,
    transport: http(),
  });

  // Convert splitId to bytes32
  const splitIdBytes32 = convertToBytes32(params.splitId);
  const txHashBytes32 = convertToBytes32(params.txHash);

  // Call contributeToBill as owner
  const hash = await client.writeContract({
    address: contractConfig.address as `0x${string}`,
    abi: PAYOS_SPLIT_ABI,
    functionName: 'contributeToBill',
    args: [
      splitIdBytes32,
      params.contributor as `0x${string}`,
      BigInt(params.sourceChainId),
      BigInt(params.sourceAmount),
      BigInt(params.targetAmount),
      txHashBytes32,
    ],
    account: account,
  });

  return hash;
}

// Helper function to convert string to bytes32
function convertToBytes32(input: string): `0x${string}` {
  // Check if input is already a hex string (starts with 0x)
  if (input.startsWith('0x')) {
    // Parse as hex and pad to 32 bytes
    const bytes = toBytes(input as `0x${string}`);
    const paddedBytes = pad(bytes, { size: 32 });
    return bytesToHex(paddedBytes);
  } else {
    // Treat as regular string
    const bytes = toBytes(input);
    const paddedBytes = pad(bytes, { size: 32 });
    return bytesToHex(paddedBytes);
  }
}

