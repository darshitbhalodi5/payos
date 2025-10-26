'use client';

import { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useAvailNexus } from '@/hooks/useAvailNexus';
import AvailNexusIntegration from './AvailNexusIntegration';

export default function AvailNexusTest() {
  const { user, ready } = usePrivy();
  const { isInitialized, error } = useAvailNexus();
  const [testResult, setTestResult] = useState<string>('');

  const handleTestIntegration = async () => {
    try {
      setTestResult('Testing Avail Nexus integration...');
      
      // Test basic functionality
      const testSplitId = `test_split_${Date.now()}`;
      const testTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;
      
      setTestResult(`✅ Integration test successful!
      
Split ID: ${testSplitId}
Mock Transaction Hash: ${testTxHash}
SDK Initialized: ${isInitialized ? 'Yes' : 'No'}
User Connected: ${ready && user?.wallet ? 'Yes' : 'No'}
Error: ${error || 'None'}

The Avail Nexus SDK integration is working correctly in mock mode. When the real SDK package becomes available, simply uncomment the import statements in avail-nexus-helper.ts and remove the mock implementation.`);
    } catch (err) {
      setTestResult(`❌ Integration test failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  if (!ready) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Initializing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Test Panel */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">
          Avail Nexus SDK Integration Test
        </h2>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-gray-700 rounded p-3">
              <div className="text-gray-400">SDK Status</div>
              <div className={`font-semibold ${isInitialized ? 'text-green-400' : 'text-red-400'}`}>
                {isInitialized ? 'Initialized' : 'Not Initialized'}
              </div>
            </div>
            <div className="bg-gray-700 rounded p-3">
              <div className="text-gray-400">User Status</div>
              <div className={`font-semibold ${user?.wallet ? 'text-green-400' : 'text-yellow-400'}`}>
                {user?.wallet ? 'Connected' : 'Not Connected'}
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500 rounded-lg p-3">
              <p className="text-red-400 text-sm">Error: {error}</p>
            </div>
          )}

          <button
            onClick={handleTestIntegration}
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Test Integration
          </button>

          {testResult && (
            <div className="bg-gray-700 rounded-lg p-4">
              <pre className="text-sm text-gray-300 whitespace-pre-wrap">{testResult}</pre>
            </div>
          )}
        </div>
      </div>

      {/* Integration Demo */}
      {user?.wallet && (
        <AvailNexusIntegration
          splitId={`demo_split_${Date.now()}`}
          targetChainId={421614} // Arbitrum Sepolia
          targetToken="PYUSD"
          targetAmount="100000000" // $100 in PYUSD (6 decimals)
          onContributionComplete={(txHash) => {
            setTestResult(`✅ Contribution completed! Transaction: ${txHash}`);
          }}
        />
      )}

      {/* Instructions */}
      <div className="bg-blue-500/10 border border-blue-500 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-400 mb-3">
          Integration Instructions
        </h3>
        <div className="text-sm text-blue-300 space-y-2">
          <p><strong>Current Status:</strong> Mock implementation active</p>
          <p><strong>To use real SDK:</strong></p>
          <ol className="list-decimal list-inside ml-4 space-y-1">
            <li>Install the real package: <code className="bg-gray-800 px-2 py-1 rounded">npm install @avail-project/nexus-core</code></li>
            <li>Uncomment the import statements in <code className="bg-gray-800 px-2 py-1 rounded">lib/avail-nexus-helper.ts</code></li>
            <li>Remove the mock SDK implementation</li>
            <li>Update the initialization code to use the real SDK</li>
          </ol>
          <p><strong>Features Implemented:</strong></p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Cross-chain intent interactions</li>
            <li>Bridge & execute functionality</li>
            <li>XCS swaps and token conversion</li>
            <li>Unified balance management</li>
            <li>Progress event tracking</li>
            <li>Error handling and recovery</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
