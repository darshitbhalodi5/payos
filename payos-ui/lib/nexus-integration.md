# Avail Nexus SDK Integration Guide

## Overview

This guide explains how to integrate and use the Avail Nexus SDK in your PayOS application for cross-chain bill splitting.

## Files Created

1. **`lib/services/nexusSDK.ts`**: Core Nexus SDK service wrapper
2. **`hooks/useNexusSDK.ts`**: React hook for easy Nexus SDK access
3. **`components/NexusIntegrationExample.tsx`**: Example component demonstrating usage

## Setup

### 1. Dependencies

The Nexus SDK is already installed in your `package.json`:
```json
{
  "dependencies": {
    "@avail-project/nexus-core": "^0.0.2"
  }
}
```

### 2. Using the Hook

```tsx
import { useNexusSDK } from '@/hooks/useNexusSDK';

function MyComponent() {
  const { isInitialized, nexusService, user } = useNexusSDK();

  if (!isInitialized) {
    return <div>Initializing Nexus SDK...</div>;
  }

  // Use nexusService to interact with SDK
  const handleBridge = async () => {
    const result = await nexusService.bridge({
      token: 'USDC',
      amount: '100',
      toChainId: 421614, // Arbitrum Sepolia
    });
  };

  return (
    <div>
      {/* Your UI */}
    </div>
  );
}
```

## API Reference

### NexusService Methods

#### Initialize
```typescript
const nexusService = getNexusService();
await nexusService.initialize(provider);
```

#### Get Balances
```typescript
// Get all balances across all chains
const balances = await nexusService.getUnifiedBalances();

// Get balance for a specific token
const usdcBalance = await nexusService.getUnifiedBalance('USDC');
```

#### Bridge Assets
```typescript
// Bridge tokens across chains
const result = await nexusService.bridge({
  token: 'USDC',
  amount: '100',
  toChainId: 421614, // Arbitrum Sepolia
});

// Simulate bridge before executing
const simulation = await nexusService.simulateBridge({
  token: 'USDC',
  amount: '100',
  toChainId: 421614,
});
```

#### Transfer Tokens
```typescript
const result = await nexusService.transfer({
  token: 'USDC',
  amount: '100',
  toChainId: 421614,
  recipient: '0x...',
});
```

#### Progress Tracking
```typescript
nexusService.onProgress((event, data) => {
  console.log('Event:', event, 'Data:', data);
});
```

## Supported Chains

- **Ethereum Sepolia**: Chain ID `11155111`
- **Base Sepolia**: Chain ID `84532`
- **Arbitrum Sepolia**: Chain ID `421614`
- **Optimism Sepolia**: Chain ID `11155420`

## Supported Tokens

- **ETH** (Ethereum)
- **USDC** (USD Coin)
- **PYUSD** (PayPal USD)

## Example Usage in Bill Splitting

```typescript
async function contributeToBill(amount: string, targetChain: number) {
  const nexusService = getNexusService();
  
  // 1. Simulate the bridge
  const simulation = await nexusService.simulateBridge({
    token: 'USDC',
    amount: amount,
    toChainId: targetChain,
  });

  // 2. Check if sufficient balance
  if (simulation.success) {
    // 3. Execute the bridge
    const result = await nexusService.bridge({
      token: 'USDC',
      amount: amount,
      toChainId: targetChain,
    });
    
    return result;
  }
}
```

## Integration with PayOS Contract

You can combine Nexus SDK for cross-chain transfers with your PayOS contract:

```typescript
// 1. Bridge tokens using Nexus
const bridgeResult = await nexusService.bridge({
  token: 'USDC',
  amount: amount,
  toChainId: recipientChainId,
});

// 2. After bridge completes, interact with PayOS contract
await contributeToSplit({
  splitId,
  amount,
  chainId: recipientChainId,
});
```

## Error Handling

```typescript
try {
  const result = await nexusService.bridge(params);
} catch (error) {
  if (error instanceof Error) {
    console.error('Bridge failed:', error.message);
  }
}
```

## Best Practices

1. **Always simulate before executing**: Use `simulateBridge()` before calling `bridge()`
2. **Check initialization**: Always verify `isInitialized` before using the service
3. **Handle progress events**: Use `onProgress` to track transaction status
4. **Clean up**: The hook automatically deinitializes on unmount
5. **Error handling**: Wrap SDK calls in try-catch blocks

## Troubleshooting

### SDK Not Initializing

- Ensure the user is authenticated with Privy
- Check that the wallet is connected
- Verify the provider is passed correctly

### Transaction Failures

- Check token balance before bridging
- Verify the target chain ID is supported
- Ensure sufficient gas on source chain

### Balance Issues

- Wait for bridge completion before checking balances
- Some operations may take a few minutes
- Check progress events for status updates

## Further Reading

- [Nexus SDK Documentation](https://docs.availproject.org/nexus)
- [Privy Integration Guide](https://docs.privy.io/)
- [Cross-Chain Best Practices](https://docs.availproject.org/nexus/guides/cross-chain-transfers)

