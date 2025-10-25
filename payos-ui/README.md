# PayOS UI

A modern, responsive web application for cross-chain payroll management built with Next.js 15, React 19, and integrated with Avail Nexus SDK for seamless cross-chain operations.

## 🚀 Features

### Core Functionality
- **Dashboard**: Overview of payroll operations, statistics, and recent activity
- **Employee Management**: Add, edit, and manage employees across multiple chains
- **Payment Processing**: Cross-chain payments using Avail Nexus SDK
- **Real-time Updates**: Live payment status and transaction tracking
- **Multi-chain Support**: Ethereum, Arbitrum, Optimism, Base

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

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Configure your environment variables:
```env
NEXT_PUBLIC_PRIVY_APP_ID=your-privy-app-id
NEXT_PUBLIC_PAYOS_CONTRACT_ADDRESS=your-contract-address
NEXT_PUBLIC_AVAILL_NEXUS_API_KEY=your-nexus-api-key
```

5. Run the development server:
```bash
yarn dev
# or
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
payos-ui/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── layout/           # Layout components
│   │   └── Navbar.tsx    # Navigation bar
│   ├── Dashboard.tsx     # Dashboard component
│   ├── EmployeeManager.tsx # Employee management
│   ├── PaymentProcessor.tsx # Payment processing
│   └── PrivyProvider.tsx # Privy authentication provider
├── public/               # Static assets
├── package.json         # Dependencies
└── README.md           # This file
```

## 🎯 ETHGlobal Prize Integration

### Avail Nexus SDK ($10,000)
- **Cross-chain Intent Interactions**: Seamless cross-chain payment processing
- **Bridge & Execute**: Automatic token bridging and smart contract execution
- **XCS Swaps**: Built-in token conversion capabilities

### PYUSD ($10,000)
- **Settlement Currency**: PYUSD as the primary settlement token
- **Multi-chain Support**: PYUSD addresses configured for all supported chains
- **Smart Contract Integration**: Direct integration with PayOS contracts

### Pyth Network ($5,000)
- **Price Feeds**: Real-time token price data for conversions
- **Oracle Integration**: Secure price data for cross-chain operations

### Yellow Network ($5,000)
- **State Channels**: Architecture ready for off-chain payroll processing
- **Instant Settlement**: Fast payment processing capabilities

## 🔧 Usage

### Dashboard
- View payroll statistics and recent activity
- Quick access to employee management and payments
- Chain status and supported networks overview

### Employee Management
- Add new employees with wallet addresses and preferences
- Configure preferred chains and tokens
- Set salary amounts and payment schedules
- Activate/deactivate employees

### Payment Processing
- Select employees for batch payments
- Choose payment tokens (ETH, USDC, PYUSD)
- Process cross-chain payments via Avail Nexus SDK
- Track payment status and transaction hashes

## 🌐 Supported Chains

- **Ethereum Sepolia** (Chain ID: 11155111)
- **Arbitrum Sepolia** (Chain ID: 421614)
- **Optimism Sepolia** (Chain ID: 11155420)
- **Base Sepolia** (Chain ID: 84532)

## 💳 Supported Tokens

- **ETH**: Ethereum native token
- **USDC**: USD Coin (Circle)
- **PYUSD**: PayPal USD (Primary settlement currency)

## 🔒 Security Features

- **Wallet Authentication**: Secure wallet connection via Privy
- **Transaction Signing**: All transactions require user approval
- **Smart Contract Integration**: Direct interaction with deployed contracts
- **Cross-chain Validation**: Secure cross-chain message validation

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- DigitalOcean App Platform

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

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For questions and support, please open an issue in the repository or contact the development team.

---

**Built with ❤️ for the future of cross-chain payroll management**