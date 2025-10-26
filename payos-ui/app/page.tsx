'use client';

import SupportedChains from '@/components/homepage/SupportedChains';
import SupportedTokens from '@/components/homepage/SupportedTokens';

export default function Home() {

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--background)' }}>
      <div className="max-w-4xl w-full mx-4">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="w-24 h-24 rounded-full mx-auto mb-8 flex items-center justify-center" style={{ background: 'linear-gradient(to right, var(--accent), #8b5cf6)' }}>
            <span className="text-4xl font-bold text-white">P</span>
          </div>
          <h1 className="text-6xl font-bold mb-6" style={{ color: 'var(--foreground)' }}>
            Payos
          </h1>
          <p className="text-2xl mb-8" style={{ color: 'var(--muted)' }}>
            Cross-chain split bill made simple
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="text-center p-6 rounded-lg border" style={{ backgroundColor: 'var(--background)', borderColor: 'var(--accent)' }}>
            <div className="text-4xl mb-4">🌐</div>
            <h3 className="text-xl font-semibold mb-3" style={{ color: 'var(--foreground)' }}>Multi-Chain Support</h3>
            <p style={{ color: 'var(--muted)' }}>
              Seamlessly work across multiple blockchain networks with unified experience
            </p>
          </div>
          <div className="text-center p-6 rounded-lg border" style={{ backgroundColor: 'var(--background)', borderColor: 'var(--accent)' }}>
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold mb-3" style={{ color: 'var(--foreground)' }}>Fast & Secure</h3>
            <p style={{ color: 'var(--muted)' }}>
              Lightning-fast transactions with enterprise-grade security
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

        {/* Supported Chains Section */}
        <div className="mb-16">
          <SupportedChains />
        </div>

        {/* Supported Tokens Section */}
        <div className="mb-16">
          <SupportedTokens />
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-6" style={{ color: 'var(--foreground)' }}>
            Ready to get started?
          </h2>
          <p className="text-lg mb-8" style={{ color: 'var(--muted)' }}>
            Connect your wallet and start managing cross-chain split bill today
          </p>
        </div>
      </div>
    </div>
  );
}