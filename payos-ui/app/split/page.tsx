'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import EnhancedSplitList from '@/components/split/EnhancedSplitList';
import SplitPaymentInterface from '@/components/split/SplitPaymentInterface';

type ViewMode = 'list' | 'payment';

export default function SplitPage() {
  const { authenticated } = usePrivy();
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedSplitId, setSelectedSplitId] = useState<string>('');

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--background)' }}>
        <div className="max-w-md w-full rounded-2xl shadow-xl p-8 text-center border" style={{ backgroundColor: 'var(--background)', borderColor: 'var(--accent)', color: 'var(--foreground)' }}>
          <div className="mb-6">
            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: 'linear-gradient(to right, var(--accent), #8b5cf6)' }}>
              <span className="text-2xl font-bold text-white">S</span>
            </div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>Split Feature</h1>
            <p style={{ color: 'var(--muted)' }}>Connect your wallet to access the split functionality</p>
          </div>
        </div>
      </div>
    );
  }

  const handleCreateSplit = () => {
    router.push('/split/new');
  };

  const handleSplitSelect = (splitId: string) => {
    setSelectedSplitId(splitId);
    setViewMode('payment');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedSplitId('');
  };

  const handlePaymentComplete = () => {
    // Refresh the split data or show success message
    setViewMode('list');
    setSelectedSplitId('');
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      <div className="container mx-auto px-4 py-8">
        {/* Navigation */}
        {viewMode !== 'list' && (
          <div className="mb-6">
            <button
              onClick={handleBackToList}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <span>←</span>
              <span>Back to Splits</span>
            </button>
          </div>
        )}

        {/* Content */}
        {viewMode === 'list' && (
          <EnhancedSplitList
            onSplitSelect={handleSplitSelect}
            onCreateSplit={handleCreateSplit}
          />
        )}

        {viewMode === 'payment' && selectedSplitId && (
          <SplitPaymentInterface
            splitId={selectedSplitId}
            onPaymentComplete={handlePaymentComplete}
          />
        )}
      </div>
    </div>
  );
}
