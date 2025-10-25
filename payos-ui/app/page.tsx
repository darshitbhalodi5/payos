'use client';

import { usePrivy } from '@privy-io/react-auth';

export default function Home() {
  const { authenticated, ready } = usePrivy();

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--background)' }}>
      <div className="max-w-4xl w-full mx-4">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="w-24 h-24 rounded-full mx-auto mb-8 flex items-center justify-center" style={{ background: 'linear-gradient(to right, var(--accent), #8b5cf6)' }}>
            <span className="text-4xl font-bold text-white">P</span>
          </div>
          <h1 className="text-6xl font-bold mb-6" style={{ color: 'var(--foreground)' }}>
            PayOS
          </h1>
          <p className="text-2xl mb-8" style={{ color: 'var(--muted)' }}>
            Cross-chain payroll made simple
          </p>
          <p className="text-lg max-w-2xl mx-auto mb-12" style={{ color: 'var(--muted)' }}>
            Pay employees on any chain with ease. Leverage Avail Nexus SDK for seamless cross-chain payments,
            automatic token conversion to PYUSD, and instant settlement across multiple blockchain networks.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="text-center p-6 rounded-lg border" style={{ backgroundColor: 'var(--background)', borderColor: 'var(--accent)' }}>
            <div className="text-4xl mb-4">🌐</div>
            <h3 className="text-xl font-semibold mb-3" style={{ color: 'var(--foreground)' }}>Multi-Chain Support</h3>
            <p style={{ color: 'var(--muted)' }}>
              Support for Ethereum, Polygon, Arbitrum, Optimism, and Base networks
            </p>
          </div>
          <div className="text-center p-6 rounded-lg border" style={{ backgroundColor: 'var(--background)', borderColor: 'var(--accent)' }}>
            <div className="text-4xl mb-4">🚀</div>
            <h3 className="text-xl font-semibold mb-3" style={{ color: 'var(--foreground)' }}>Avail Nexus SDK</h3>
            <p style={{ color: 'var(--muted)' }}>
              Seamless cross-chain bridging and automatic token conversion
            </p>
          </div>
          <div className="text-center p-6 rounded-lg border" style={{ backgroundColor: 'var(--background)', borderColor: 'var(--accent)' }}>
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-xl font-semibold mb-3" style={{ color: 'var(--foreground)' }}>PYUSD Settlement</h3>
            <p style={{ color: 'var(--muted)' }}>
              Automatic conversion to PYUSD for stable, reliable payments
            </p>
          </div>
        </div>

        {/* ETHGlobal Prize Targets */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-8" style={{ color: 'var(--foreground)' }}>🎯 ETHGlobal Prize Targets</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-lg border" style={{ backgroundColor: 'rgba(68, 210, 255, 0.1)', borderColor: 'var(--accent)' }}>
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--accent)' }}>Avail Nexus SDK</h3>
              <p className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>$10,000</p>
            </div>
            <div className="p-6 rounded-lg border" style={{ backgroundColor: 'rgba(68, 210, 255, 0.1)', borderColor: 'var(--accent)' }}>
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--accent)' }}>PYUSD Integration</h3>
              <p className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>$10,000</p>
            </div>
            <div className="p-6 rounded-lg border" style={{ backgroundColor: 'rgba(68, 210, 255, 0.1)', borderColor: 'var(--accent)' }}>
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--accent)' }}>Pyth Network</h3>
              <p className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>$5,000</p>
            </div>
            <div className="p-6 rounded-lg border" style={{ backgroundColor: 'rgba(68, 210, 255, 0.1)', borderColor: 'var(--accent)' }}>
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--accent)' }}>Yellow Network</h3>
              <p className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>$5,000</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-6" style={{ color: 'var(--foreground)' }}>
            Ready to get started?
          </h2>
          <p className="text-lg mb-8" style={{ color: 'var(--muted)' }}>
            Connect your wallet and start managing cross-chain payroll today
          </p>
          <div className="text-sm" style={{ color: 'var(--muted)' }}>
            {!ready ? 'Loading...' : !authenticated ? 'Please connect your wallet to access the payroll dashboard' : 'Redirecting to payroll dashboard...'}
          </div>
        </div>
      </div>
    </div>
  );
}