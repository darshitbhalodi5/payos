# Avail Nexus SDK Integration

## ✅ Files Created

### Core Files
1. **`lib/services/nexusSDK.ts`** - Nexus SDK service wrapper
2. **`hooks/useNexusSDK.ts`** - React hook for Privy integration

### Example Component
3. **`components/NexusIntegrationExample.tsx`** - Demo component

### Documentation
4. **`lib/nexus-integration.md`** - Complete integration guide

## 🚀 Quick Start

### 1. Install Dependencies

Already installed in your `package.json`:
```bash
npm install @avail-project/nexus-core
```

### 2. Use the Hook in Your Components

```tsx
'use client';

import { useNexusSDK } from '@/hooks/useNexusSDK';

export default function MyComponent() {
  const { isInitialized, nexusService, user } = useNexusSDK();

  const handleBridge = async () => {
    if (!nexusService) return;
    
    try {
      // Simulate the bridge first
      const simulation = await nexusService.simulateBridge({
        token: 'USDC',
        amount: '100',
        toChainId: 421614, // Arbitrum Sepolia
      });

      if (simulation.success) {
        // Execute the bridge
        const result = await nexusService.bridge({
          token: 'USDC',
          amount: '100',
          toChainId: 421614,
        });
        console.log('Bridge successful:', result);
      }
    } catch (error) {
      console.error('Bridge failed:', error);
    }
  };

  if (!isInitialized) {
    return <div>Initializing Nexus SDK...</div>;
  }

  return (
    <button onClick={handleBridge}>
      Bridge USDC to Arbitrum
    </button>
  );
}
```

## 📋 Available Methods

### Basic Operations
- `getUnifiedBalances()` - Get all balances across chains
- `getUnifiedBalance(symbol)` - Get balance for specific token

### Cross-Chain Transfers
- `bridge(params)` - Bridge tokens to another chain
- `simulateBridge(params)` - Simulate bridge before executing
- `transfer(params)` - Transfer tokens on-chain

### Advanced Operations
- `execute(params)` - Execute contract calls
- `bridgeAndExecute(params)` - Bridge and execute in one transaction
- `simulateBridgeAndExecute(params)` - Simulate the above

### Event Handling
- `onProgress(callback)` - Track transaction progress

## 🔗 Integration with Privy

The hook automatically:
1. ✅ Detects Privy authentication
2. ✅ Gets provider from Privy wallet
3. ✅ Initializes Nexus SDK with provider
4. ✅ Cleans up on unmount

## 📝 Example: Bill Splitting with Cross-Chain

```typescript
async function contributeToCrossChainBill(
  splitId: string,
  token: string,
  amount: string,
  targetChainId: number
) {
  const { nexusService } = useNexusSDK();

  // 1. Bridge tokens to target chain using Nexus
  const bridgeResult = await nexusService.bridge({
    token,
    amount,
    toChainId: targetChainId,
  });

  // 2. After bridge completes, interact with PayOS contract
  await contributeToSplit({
    splitId,
    amount,
    chainId: targetChainId,
  });

  return bridgeResult;
}
```

## 🎯 Supported Chains

- Ethereum Sepolia (`11155111`)
- Base Sepolia (`84532`)
- Arbitrum Sepolia (`421614`)
- Optimism Sepolia (`11155420`)

## 🪙 Supported Tokens

- ETH
- USDC
- PYUSD

## 📚 Full Documentation

See `lib/nexus-integration.md` for complete API reference and examples.

