'use client';

import { useState } from 'react';
import { useNexusSDK } from '@/hooks/useNexusSDK';

export default function NexusIntegrationExample() {
  const { isInitialized, isInitializing, error, nexusService, user } = useNexusSDK();
  const [balances, setBalances] = useState<Array<{ symbol: string; balance: string; chainId?: number }>>([]);
  const [loading, setLoading] = useState(false);

  const fetchBalances = async () => {
    if (!nexusService) return;
    
    setLoading(true);
    try {
      const result = await nexusService.getUnifiedBalances();
      setBalances(result);
    } catch (err) {
      console.error('Failed to fetch balances:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
      <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
        Avail Nexus SDK Integration
      </h2>

      {/* Status */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-3 h-3 rounded-full ${isInitialized ? 'bg-green-500' : isInitializing ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
          <span className="text-sm" style={{ color: 'var(--muted)' }}>
            Status: {isInitialized ? 'Initialized' : isInitializing ? 'Initializing...' : 'Not Initialized'}
          </span>
        </div>
        
        {error && (
          <div className="text-red-500 text-sm mb-2">
            Error: {error}
          </div>
        )}

        {user && (
          <div className="text-sm" style={{ color: 'var(--muted)' }}>
            User: {user.wallet?.address}
          </div>
        )}
      </div>

      {/* Actions */}
      {isInitialized && (
        <div className="space-y-3">
          <button
            onClick={fetchBalances}
            disabled={loading}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Fetch Unified Balances'}
          </button>

          {balances.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
                Your Balances
              </h3>
              <div className="space-y-2">
                {balances.map((balance, index) => (
                  <div key={index} className="p-3 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex justify-between items-center">
                      <span className="font-medium" style={{ color: 'var(--foreground)' }}>
                        {balance.symbol}
                      </span>
                      <span className="text-sm" style={{ color: 'var(--muted)' }}>
                        {balance.balance} {balance.symbol}
                      </span>
                    </div>
                    <div className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                      Chain ID: {balance.chainId}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!isInitialized && !isInitializing && (
        <div className="text-sm" style={{ color: 'var(--muted)' }}>
          Please connect your wallet to initialize Nexus SDK
        </div>
      )}
    </div>
  );
}

