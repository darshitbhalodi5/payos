# PayOS UI

A modern, responsive web application for cross-chain bill splitting built with Next.js 15, React 19, and integrated with Avail Nexus SDK for seamless cross-chain operations.

## 🚀 Features

### Core Functionality
- **Split Creation**: Create bill splits with multiple contributors
- **Cross-Chain Contributions**: Contribute to splits from any supported chain
- **Payment Processing**: Cross-chain payments using Avail Nexus SDK
- **Real-time Tracking**: Live split progress and contribution status
- **Multi-chain Support**: Ethereum Sepolia, Arbitrum Sepolia, Optimism Sepolia, Base Sepolia

### Technical Features
- **Next.js 15**: Latest App Router with React 19
- **TypeScript**: Full type safety throughout the application
- **Tailwind CSS**: Modern, responsive design system
- **Privy Integration**: Seamless wallet authentication
- **Wagmi/Viem**: Ethereum interaction library
- **Avail Nexus SDK**: Cross-chain payment processing

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Privy
- **Ethereum**: Wagmi + Viem
- **Cross-chain**: Avail Nexus SDK
- **State Management**: React Query (TanStack Query)
- **UI Components**: Custom components with Radix UI primitives

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- Yarn or npm
- Git

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd payos-ui
```

2. Install dependencies:
```bash
yarn install
# or
npm install
```

3. Configure your environment variables:
```env
NEXT_PUBLIC_PRIVY_APP_ID
OP_SEPOLIA_RPC_URL
BASE_SEPOLIA_RPC_URL
POLYGON_AMOY_RPC_URL
ARB_SEPOLIA_RPC_URL
ETH_SEPOLIA_RPC_URL

NEXT_PUBLIC_ENABLE_TESTNET=true
NEXT_PUBLIC_ENABLE_MAINNET=false
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_DEBUG_LOGS=true

MONGODB_URI
```

5. Run the development server:
```bash
yarn dev
# or
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔧 Usage

### Creating a Split
1. Connect your wallet using Privy
2. Navigate to "Create Split" 
3. Enter recipient address, target chain, token, and amount
4. Add contributors with custom amounts (up to 10 contributors)
5. Submit the transaction to create split on-chain

### Contributing to a Split
1. View active splits you're involved in
2. Select a split to contribute to
3. Choose token and chain for your contribution
4. Enter contribution amount
5. Complete payment - cross-chain bridging handled automatically via Nexus SDK

### Split Management
- View all splits (created, contributed, received)
- Filter by status (active, completed), chain, or ownership
- Track progress in real-time
- View transaction details and contributor information

## 🌐 Supported Chains

- **Ethereum Sepolia** (Chain ID: 11155111)
- **Arbitrum Sepolia** (Chain ID: 421614)
- **Optimism Sepolia** (Chain ID: 11155420)
- **Base Sepolia** (Chain ID: 84532)

## 💳 Supported Tokens

- **ETH**: Ethereum native token
- **USDC**: USD Coin (Circle)
- **PYUSD**: PayPal USD

## 🔒 Security Features

- **Wallet Authentication**: Secure wallet connection via Privy
- **Transaction Signing**: All transactions require user approval
- **Smart Contract Integration**: OpenZeppelin audited contracts with reentrancy protection
- **Access Control**: Owner-only functions for contribution recording
- **Input Validation**: Comprehensive validation for all split parameters
- **Safe ERC20 Transfers**: Uses SafeERC20 for secure token operations

## 🚀 Deployment

### Vercel
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

## 🔧 Development

### Available Scripts
- `yarn dev`: Start development server
- `yarn build`: Build for production
- `yarn start`: Start production server
- `yarn lint`: Run ESLint

### Code Style
- TypeScript for type safety
- ESLint for code quality
- Prettier for code formatting
- Tailwind CSS for styling

**Built with ❤️ for the future of cross-chain bill splitting**