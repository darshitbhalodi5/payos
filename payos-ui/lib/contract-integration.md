# Contract Integration Guide

## Overview
This guide explains how to integrate the deployed PayosSplit contract with the frontend application.

## Contract Functions Needed

### Current Contract Functions (PayosSplit.sol)
- `createSplit()` - Creates a new split
- `contributeToBill()` - Records a contribution (onlyOwner)
- `getSplit()` - Gets split details
- `getContributions()` - Gets all contributions for a split
- `getSplitContributors()` - Gets contributor info
- `isAuthorizedContributor()` - Checks if address is authorized
- `getSplitProgress()` - Gets current vs target amounts
- `isSplitActive()` - Checks if split is active

### Missing Functions (Need to Add to Contract)
To fully support the frontend functionality, the contract needs these additional functions:

```solidity
// Get splits by creator
function getSplitsByCreator(address creator) external view returns (bytes32[] memory);

// Get splits by recipient  
function getSplitsByRecipient(address recipient) external view returns (bytes32[] memory);

// Get splits where address is contributor
function getSplitsByContributor(address contributor) external view returns (bytes32[] memory);

// Get all splits with pagination
function getAllSplits(uint256 offset, uint256 limit) external view returns (bytes32[] memory);

// Get split count
function getSplitCount() external view returns (uint256);
```

## Frontend Integration

### 1. Contract Addresses
Update the contract addresses in `lib/contracts.ts` with your deployed addresses:

```typescript
export const SPLIT_BILL_ADDRESSES: ContractAddresses = {
  11155111: '0xYourEthereumSepoliaAddress', // Ethereum Sepolia
  421614: '0xYourArbitrumSepoliaAddress', // Arbitrum Sepolia
  11155420: '0xYourOptimismSepoliaAddress', // Optimism Sepolia
  84532: '0xYourBaseSepoliaAddress', // Base Sepolia
  80002: '0xYourPolygonAmoyAddress', // Polygon Amoy
};
```

### 2. Contract ABI
Update the ABI in `lib/contracts.ts` with the complete ABI from your deployed contract.

### 3. Hook Implementation
The `useSplitsData` hook currently uses mock data. To integrate with real contract:

1. Replace mock data in `useSplitsData.ts` with actual contract calls
2. Use `useReadContract` from wagmi for read operations
3. Use `useWriteContract` for write operations

### 4. Event Listening
Listen to contract events for real-time updates:

```typescript
// Listen to SplitCreated events
const { data: splitCreatedEvents } = useWatchContractEvent({
  address: contractAddress,
  abi: contractABI,
  eventName: 'SplitCreated',
  onLogs: (logs) => {
    // Update splits list
    refreshSplits();
  }
});
```

## Implementation Steps

### Step 1: Update Contract Addresses
1. Deploy contract to all target chains
2. Update addresses in `lib/contracts.ts`
3. Verify contracts on block explorers

### Step 2: Add Missing Contract Functions
1. Add the missing view functions to PayosSplit.sol
2. Deploy updated contract
3. Update contract addresses

### Step 3: Update Frontend Hooks
1. Replace mock data in `useSplitsData.ts`
2. Implement real contract calls
3. Add error handling and loading states

### Step 4: Add Event Listening
1. Listen to contract events
2. Update UI in real-time
3. Handle network changes

## Testing

### Local Testing
1. Deploy contract to local testnet
2. Update contract address
3. Test all functionality

### Testnet Testing
1. Deploy to testnets (Sepolia, Amoy, etc.)
2. Test cross-chain functionality
3. Verify all features work

### Production Deployment
1. Deploy to production testnet
2. Update production addresses
3. Monitor contract events

## Security Considerations

1. **Access Control**: Only owner can call `contributeToBill`
2. **Input Validation**: Validate all inputs
3. **Reentrancy**: Contract uses ReentrancyGuard
4. **Gas Optimization**: Use efficient data structures
5. **Event Emission**: Emit events for all state changes

## Monitoring

1. **Contract Events**: Monitor all events
2. **Error Tracking**: Track contract errors
3. **Gas Usage**: Monitor gas consumption
4. **User Activity**: Track user interactions

## Troubleshooting

### Common Issues
1. **Contract Not Deployed**: Check contract addresses
2. **Wrong Network**: Ensure user is on correct chain
3. **Insufficient Gas**: Check gas limits
4. **Invalid Input**: Validate all inputs

### Debug Steps
1. Check contract address
2. Verify ABI
3. Check network
4. Validate inputs
5. Check gas limits
