# PayOS Split Functionality

This directory contains the frontend components for the PayOS split functionality, which allows users to split bills across multiple contributors using any token from any supported blockchain.

## Components

### SplitList.tsx
- Displays all available splits
- Filtering by status (all, active, completed, my-splits)
- Shows split progress, contributors, and time remaining
- Handles navigation to individual splits

### SplitCreationForm.tsx
- Modal form for creating new bill splits
- Input validation for recipient, amount, description, expiry
- Chain and token selection
- Preview of split details before creation

### SplitPaymentInterface.tsx
- Main interface for contributing to splits
- Multi-chain payment options
- Real-time progress tracking
- Contribution history display
- Integration with Avail Nexus SDK

### AvailNexusIntegration.tsx
- Handles cross-chain payment processing
- Mock implementation of Avail Nexus SDK
- Progress tracking and status updates
- Error handling and user feedback

## Features

### Core Functionality
- **Split Creation**: Create bill splits with target amount, recipient, and expiry
- **Multi-Chain Payments**: Pay from any supported chain with any token
- **Real-time Progress**: Live updates of contribution progress
- **Auto-Settlement**: Automatic payment when target amount is reached
- **Refund System**: Claim refunds for cancelled or expired splits

### Supported Chains
- Ethereum Sepolia (11155111)
- Arbitrum Sepolia (421614)
- Optimism Sepolia (11155420)
- Base Sepolia (84532)

### Supported Tokens
- ETH (Ethereum)
- PYUSD (PayPal USD)
- USDC (USD Coin)

## Integration with Avail Nexus SDK

The split functionality leverages Avail Nexus SDK for seamless cross-chain operations:

```typescript
// Example payment flow
await sdk.bridgeAndExecute({
  token: 'ETH',
  amount: '2.5',
  sourceChains: [11155111], // Ethereum Sepolia
  
  toChainId: 421614, // Arbitrum Sepolia
  recipient: SPLIT_CONTRACT_ADDRESS,
  
  execute: {
    contractAddress: SPLIT_CONTRACT_ADDRESS,
    functionName: 'contributeToBill',
    buildFunctionParams: () => ({
      functionParams: [
        splitId,
        contributorAddress,
        sourceChainId,
        sourceToken,
        sourceAmount,
        targetAmount
      ]
    }),
    tokenApproval: {
      token: 'PYUSD',
      amount: targetAmount
    }
  }
});
```

## Usage

1. **Create Split**: Use `SplitCreationForm` to create a new bill split
2. **View Splits**: Use `SplitList` to browse and filter available splits
3. **Contribute**: Use `SplitPaymentInterface` to make payments to active splits
4. **Track Progress**: Real-time updates show contribution progress and status

## Smart Contract Integration

The frontend integrates with the `PayosSplitBill.sol` smart contract:

- `createSplit()` - Create new splits
- `contributeToBill()` - Make contributions (called by Avail SDK)
- `getSplit()` - Retrieve split details
- `getContributions()` - Get contribution history
- `claimRefund()` - Claim refunds for cancelled/expired splits

## Development Status

✅ Smart Contract Implementation  
✅ Frontend Components  
✅ Avail Nexus SDK Integration (Mock)  
✅ Multi-chain Support  
✅ Real-time Progress Tracking  
✅ Responsive Design  

## Next Steps

1. **Real Avail SDK Integration**: Replace mock implementation with actual SDK
2. **Contract Deployment**: Deploy smart contracts to testnet
3. **Price Feed Integration**: Add real-time token conversion rates
4. **Enhanced UX**: Add animations, better error handling, and notifications
5. **Mobile Optimization**: Further mobile-specific improvements
