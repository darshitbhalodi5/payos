# PayOS Smart Contracts

A cross-chain bill splitting system built with Solidity and Foundry, enabling users to create and contribute to split bills across multiple blockchain networks.

## 🚀 Features

### Core Functionality
- **Bill Splitting**: Create split bills with multiple contributors
- **Cross-Chain Support**: Deploy the same contract to the same address across all chains using CREATE2
- **Multi-Token Support**: Accept contributions in various ERC-20 tokens (ETH, USDC, PYUSD, etc.)
- **Automatic Settlement**: Automatically distribute funds when target amount is reached
- **Contributor Management**: Add and manage contributors for each split bill
- **Real-time Tracking**: Track contribution progress and status

### Security Features
- **Access Control**: Owner-only functions for critical operations
- **Reentrancy Protection**: Prevents reentrancy attacks using OpenZeppelin's ReentrancyGuard
- **Safe Token Transfers**: Uses OpenZeppelin's SafeERC20 for secure token operations
- **Input Validation**: Comprehensive validation for all inputs
- **Custom Errors**: Gas-efficient error handling

### Deterministic Deployment
- **CREATE2 Deployment**: Same contract address across all supported chains
- **Predictable Addresses**: Know your contract address before deployment
- **Cross-Chain Consistency**: Identical contract behavior across networks

## 📁 Contract Structure

### Core Contract

#### `PayosSplit.sol`
Main contract for bill splitting functionality with cross-chain support.

**Key Functions:**
- `createSplit(address, uint256, address, uint256, string, address[], uint256[])`: Create a new split bill
- `contributeToBill(bytes32, address, uint256, uint256, uint256, bytes32)`: Contribute to an existing split bill
- `getSplit(bytes32)`: Get split bill details
- `getContributions(bytes32)`: Get all contributions for a split bill
- `getSplitContributors(bytes32)`: Get contributor information
- `getSplitProgress(bytes32)`: Get contribution progress
- `isSplitActive(bytes32)`: Check if split bill is still active

**Key Structs:**
- `SplitBill`: Contains split bill information (id, amounts, creator, recipient, etc.)
- `Contribution`: Records individual contributions (contributor, amounts, transaction hash)
- `ContributorInfo`: Contributor details (target amount, contributed amount, status)

**Events:**
- `SplitCreated`: Emitted when a new split bill is created
- `ContributionMade`: Emitted when someone contributes to a split bill
- `SplitCompleted`: Emitted when a split bill reaches its target and is settled

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

## 🚀 Deployment

### Deterministic Deployment

Deploy the PayosSplit contract to the same address across all chains:

```bash
# Set your private key
export PRIVATE_KEY="your-private-key"

# Deploy to all supported chains
./bash-scripts/deploy_payos_split.sh
```

### Manual Deployment

Deploy to a specific chain:

```bash
# Deploy to Arbitrum Sepolia
forge script script/DeployPayosSplit.s.sol:DeployPayosSplit \
  --fork-url $ARB_SEPOLIA_RPC_URL \
  --broadcast \
  --legacy
```

### Contract Verification

Verify contracts on all block explorers:

```bash
./bash-scripts/verify_simple.sh
```

### Deployed Contract Address

**Contract Address**: `0x3bdeD6E96eeeB7858701A0291dBA9A84c8b9D801`

This address is the same across all networks due to deterministic deployment using CREATE2.

### Supported Chains

- **Arbitrum Sepolia** (Chain ID: 421614) - https://sepolia.arbiscan.io/address/0x3bdeD6E96eeeB7858701A0291dBA9A84c8b9D801
- **Base Sepolia** (Chain ID: 84532) - https://sepolia.basescan.org/address/0x3bdeD6E96eeeB7858701A0291dBA9A84c8b9D801
- **Optimism Sepolia** (Chain ID: 11155420) - https://sepolia-optimism.etherscan.io/address/0x3bdeD6E96eeeB7858701A0291dBA9A84c8b9D801
- **Ethereum Sepolia** (Chain ID: 11155111) - https://sepolia.etherscan.io/address/0x3bdeD6E96eeeB7858701A0291dBA9A84c8b9D801

### Environment Setup

Create a `.env` file with your configuration:

```bash
# Copy the example file
cp env.example .env

# Edit with your values
PRIVATE_KEY=your_private_key_here
ARB_SEPOLIA_RPC_URL=https://arbitrum-sepolia.infura.io/v3/your_key
BASE_SEPOLIA_RPC_URL=https://base-sepolia.infura.io/v3/your_key
OP_SEPOLIA_RPC_URL=https://optimism-sepolia.infura.io/v3/your_key
ETH_SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your_key
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### Deployment Scripts

The project includes automated deployment and verification scripts:

#### `bash-scripts/deploy_payos_split.sh`
- Deploys PayosSplit contract to all supported chains
- Uses deterministic deployment (CREATE2)
- Provides deployment status and contract addresses

#### `bash-scripts/verify_simple.sh`
- Verifies deployed contracts on all block explorers
- Uses Etherscan API for verification
- Provides verification status for each chain

**Built with ❤️ for the future of cross-chain bill splitting**