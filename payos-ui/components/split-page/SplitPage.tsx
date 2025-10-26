'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Image from 'next/image';
import EnhancedSplitList from '@/components/split/EnhancedSplitList';
import SplitDetailsView from '@/components/split/SplitDetailsView';
import SplitContributionInterface from '@/components/split/SplitContributionInterface';

type ViewMode = 'list' | 'view' | 'contribute';

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
                        <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center overflow-hidden" style={{ background: 'var(--background)', border: '2px solid var(--accent)' }}>
                            <Image src="/payos.ico" alt="Payos Logo" width={48} height={48} className="object-contain" />
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
        setViewMode('view');
    };

    const handleContribute = (splitId: string) => {
        setSelectedSplitId(splitId);
        setViewMode('contribute');
    };

    const handleBackToList = () => {
        setViewMode('list');
        setSelectedSplitId('');
    };

    const handleContributionComplete = () => {
        // Refresh the split data or show success message
        setViewMode('list');
        setSelectedSplitId('');
    };

    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
            <div className="container mx-auto px-4 py-8">
                {/* Content */}
                {viewMode === 'list' && (
                    <EnhancedSplitList
                        onSplitSelect={handleSplitSelect}
                        onCreateSplit={handleCreateSplit}
                        onContribute={handleContribute}
                    />
                )}

                {viewMode === 'view' && selectedSplitId && (
                    <SplitDetailsView
                        splitId={selectedSplitId}
                        onBack={handleBackToList}
                        onContribute={handleContribute}
                    />
                )}

                {viewMode === 'contribute' && selectedSplitId && (
                    <SplitContributionInterface
                        splitId={selectedSplitId}
                        onBack={handleBackToList}
                        onContributionComplete={handleContributionComplete}
                    />
                )}
            </div>
        </div>
    );
}
