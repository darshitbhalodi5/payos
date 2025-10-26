'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import SplitCreationForm from '@/components/split/SplitCreationForm';

export default function NewSplitPage() {
  const { authenticated, user } = usePrivy();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (!authenticated) {
      router.push('/split');
    }
  }, [authenticated, router]);

  const handleSplitCreated = () => {
    setIsRedirecting(true);
    // Redirect back to split list after creation
    router.push('/split');
  };

  const handleClose = () => {
    router.push('/split');
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--background)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Redirecting...</p>
        </div>
      </div>
    );
  }

  if (isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--background)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Split created! Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      <div className="container mx-auto px-4 py-8">
        <SplitCreationForm
          onSplitCreated={handleSplitCreated}
          onClose={handleClose}
          defaultRecipient={user?.wallet?.address || ''}
        />
      </div>
    </div>
  );
}
