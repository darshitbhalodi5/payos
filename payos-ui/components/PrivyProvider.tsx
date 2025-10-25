'use client';

import { PrivyProvider as PrivyProviderBase } from '@privy-io/react-auth';
import { WagmiProvider } from '@privy-io/wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http } from 'viem';
import { sepolia, arbitrumSepolia, optimismSepolia, baseSepolia } from 'viem/chains';
import { createConfig } from 'wagmi';

// Configure wagmi
const config = createConfig({
  chains: [sepolia, arbitrumSepolia, optimismSepolia, baseSepolia],
  transports: {
    [sepolia.id]: http(),
    [arbitrumSepolia.id]: http(),
    [optimismSepolia.id]: http(),
    [baseSepolia.id]: http(),
  },
});

// Create a query client
const queryClient = new QueryClient();

export default function PrivyProvider({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProviderBase
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || 'your-privy-app-id'}
      config={{
        loginMethods: ['wallet'],
        appearance: {
          theme: 'dark',
          accentColor: '#66d9ff',
          logo: '/payos.ico',
        },
        embeddedWallets: {
          ethereum: {
            createOnLogin: 'users-without-wallets',
          },
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={config}>
          {children}
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProviderBase>
  );
}
