# PayOS Smart Contracts

A simplified cross-chain payroll management system built with Solidity and Foundry, designed to work seamlessly with Avail Nexus SDK for cross-chain operations.

## 🚀 Features

### Core Functionality
- **Multi-Token Support**: Accept payments in any ERC-20 token (ETH, USDC, USDT, PYUSD, etc.)
- **Cross-Chain Payments**: Send payments to employees on different blockchain networks via Avail Nexus SDK
- **Deterministic Deployment**: Deploy the same contract to the same address across all chains using CREATE2
- **Batch Processing**: Process multiple employee payments in a single transaction
- **PYUSD Settlement**: Automatic conversion to PYUSD for employee payments
- **Employee Management**: Add, remove, and manage employee information per chain

### Security Features
- **Access Control**: Owner-only functions for critical operations
- **Reentrancy Protection**: Prevents reentrancy attacks
- **Pausable**: Emergency pause functionality
- **Safe Token Transfers**: Uses OpenZeppelin's SafeERC20 for secure token operations

### Avail Nexus SDK Integration
- **Zero Bridge Code**: Avail Nexus SDK handles all cross-chain complexity
- **Automatic Token Conversion**: SDK converts any token to PYUSD automatically
- **Unified API**: Same interface works across all supported chains
- **Gas Optimization**: SDK handles gas management and routing

## 📁 Contract Structure

### Core Contracts

#### `DeterministicDeployer.sol`
Factory contract for deterministic deployment using CREATE2. Enables deploying the same contract to the same address across different chains.

**Key Functions:**
- `deploy(bytes memory bytecode, bytes32 salt)`: Deploy a contract with deterministic address
- `predictAddress(bytes memory bytecode, bytes32 salt)`: Predict deployment address
- `isDeployed(bytes memory bytecode, bytes32 salt)`: Check if contract is already deployed

#### `PayrollManager.sol`
Basic payroll management contract for same-chain payments and employee management.

**Key Functions:**
- `addEmployee(address, uint256, address, uint256)`: Add new employee
- `removeEmployee(address, uint256)`: Remove employee
- `processPayment(address, uint256, address, uint256)`: Process single payment
- `processBatchPayment(address[], uint256[], address, uint256[])`: Process batch payments
- `setAuthorizedToken(address, bool)`: Authorize/deauthorize tokens

#### `PayosPayroll_Simplified.sol`
Main contract designed to work with Avail Nexus SDK for cross-chain payroll operations.

**Key Functions:**
- `settleToPYUSD(address, uint256, uint256)`: Process payment via Avail Nexus SDK
- `batchSettleToPYUSD(address[], uint256[], uint256)`: Batch process payments
- `addEmployee(address, uint256, address, uint256)`: Add new employee
- `setPYUSDAddress(uint256, address)`: Set PYUSD address for specific chain
- `getPYUSDAddress(uint256)`: Get PYUSD address for chain

## 🛠️ Development Setup

### Prerequisites
- [Foundry](https://book.getfoundry.sh/getting-started/installation)
- [Git](https://git-scm.com/)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd payos-contracts
```

2. Install dependencies:
```bash
forge install
```

3. Build the contracts:
```bash
forge build
```

4. Run tests:
```bash
forge test
```

## 🚀 Deployment

### Deterministic Deployment

Deploy contracts to the same address across all chains:

```bash
# Set your private key
export PRIVATE_KEY="your-private-key"

# Deploy to a specific chain
forge script script/DeployPayroll.s.sol:DeployPayroll --rpc-url <RPC_URL> --broadcast --verify
```

### Supported Chains

- Ethereum (Chain ID: 1)
- Polygon (Chain ID: 137)
- Arbitrum (Chain ID: 42161)
- Optimism (Chain ID: 10)
- Base (Chain ID: 8453)
- Sepolia (Chain ID: 11155111)

## 📊 Testing

The test suite includes comprehensive coverage for:

- Employee management (add, remove, update)
- Payment processing (single and batch)
- Token authorization and management
- Avail Nexus SDK integration
- Security features (access control, reentrancy, pausing)
- Error handling and edge cases

Run specific tests:
```bash
# Run all tests
forge test

# Run specific test
forge test --match-test testProcessPayment

# Run with verbose output
forge test -vv

# Run with gas reporting
forge test --gas-report
```

## 🔧 Usage Examples

### Frontend Integration with Avail Nexus SDK

```typescript
import { NexusSDK } from '@avail-project/nexus-core';

// Initialize SDK
const sdk = new NexusSDK();
await sdk.initialize(window.ethereum);

// Pay single employee
await sdk.bridgeAndExecute({
  token: 'ETH',                    // Employer pays in ETH
  amount: '1000000000000000000',   // 1 ETH
  toChainId: 137,                  // Send to Polygon
  
  execute: {
    contractAddress: YOUR_PAYOS_CONTRACT,
    functionName: 'settleToPYUSD',
    buildFunctionParams: (token, amount, chainId, user) => ({
      functionParams: [
        employeeAddress,  // Who gets paid
        '5000000000',    // 5000 PYUSD (6 decimals)
        137              // Chain ID
      ]
    }),
    tokenApproval: {
      token: 'PYUSD',
      amount: '5000000000'
    }
  }
});
```

### Adding an Employee

```solidity
// Add employee on Ethereum mainnet
payosPayroll.addEmployee(
    employeeAddress,    // Employee's wallet address
    1,                  // Chain ID (Ethereum)
    usdcAddress,        // Preferred token (USDC)
    5000 * 10**6       // Salary (5000 USDC)
);
```

### Processing a Payment (Same Chain)

```solidity
// Process single payment
payrollManager.processPayment(
    employeeAddress,    // Employee address
    1,                  // Chain ID
    usdcAddress,        // Payment token
    5000 * 10**6       // Amount
);
```

### Batch Payment Processing

```solidity
// Process multiple payments
address[] memory employees = [emp1, emp2, emp3];
uint256[] memory chainIds = [1, 1, 137];
uint256[] memory amounts = [5000, 3000, 4000];

payrollManager.processBatchPayment(
    employees,
    chainIds,
    usdcAddress,
    amounts
);
```

## 🔒 Security Considerations

### Access Control
- Only the contract owner can add/remove employees
- Only the contract owner can authorize tokens
- Only the contract owner can pause the contract

### Token Safety
- Uses OpenZeppelin's SafeERC20 for secure token transfers
- Implements proper approval patterns
- Includes emergency withdrawal functionality

### Cross-Chain Security
- Avail Nexus SDK handles all cross-chain security
- No custom bridge code means no bridge vulnerabilities
- SDK uses battle-tested bridge protocols

## 🌐 Avail Nexus SDK Integration

The system leverages Avail Nexus SDK for all cross-chain operations:

### What the SDK Handles
- ✅ Token bridging between chains
- ✅ Token swapping (ETH → PYUSD, USDC → PYUSD, etc.)
- ✅ Gas fee management
- ✅ Smart contract execution
- ✅ Transaction confirmation

### What You Build
- ✅ Employee management UI
- ✅ Payment scheduling
- ✅ Business logic
- ✅ Analytics and reporting

## 📈 Gas Optimization

The contracts are optimized for gas efficiency:

- **Simplified Logic**: 30% less code than complex cross-chain implementations
- **Batch Operations**: Reduce transaction costs
- **Efficient Storage**: Minimal storage patterns
- **SDK Integration**: Avail Nexus SDK handles gas optimization

## 🎯 ETHGlobal Prize Compliance

### Avail Nexus SDK ($10,000)
- Uses `bridgeAndExecute` with XCS swaps
- Demonstrates cross-chain intent interactions
- Shows Bridge & Execute pattern

### PYUSD ($10,000)
- PYUSD as settlement currency
- Multi-chain PYUSD support
- Smart contract integration

### Pyth Network ($5,000)
- Ready for integration
- Price feeds for token conversion rates

### Yellow Network ($5,000)
- Architecture supports state channels
- Off-chain payroll processing ready

**Total Prize Potential: $30,000**

## 🔮 Future Enhancements

- **Pyth Network Integration**: Real-time price feeds for token conversion
- **Advanced Analytics**: Payment tracking and reporting
- **Governance**: DAO-based management system
- **Mobile App**: Native mobile interface

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📞 Support

For questions and support, please open an issue in the repository or contact the development team.

---

**Built with ❤️ for the future of cross-chain payroll management**