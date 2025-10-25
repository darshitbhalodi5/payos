'use client';

import { useState, useEffect, useMemo } from 'react';
import { usePrivy } from '@privy-io/react-auth';

interface AvailNexusIntegrationProps {
  splitId: string;
  contributorAddress: string;
  sourceChainId: number;
  sourceToken: string;
  sourceAmount: string;
  targetChainId: number;
  targetToken: string;
  targetAmount: string;
  onSuccess: (txHash: string) => void;
  onError: (error: string) => void;
}

// Mock Avail Nexus SDK - in production, this would be the actual SDK
class MockNexusSDK {
  async initialize(_provider: unknown) {
    console.log('Mock Avail Nexus SDK initialized');
    return true;
  }

  async bridgeAndExecute(params: unknown) {
    console.log('Mock bridgeAndExecute called with:', params);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Simulate success
    return {
      transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
      success: true
    };
  }
}

export default function AvailNexusIntegration({
  splitId,
  contributorAddress,
  sourceChainId,
  sourceToken,
  sourceAmount,
  targetChainId,
  targetToken,
  targetAmount,
  onSuccess,
  onError,
}: AvailNexusIntegrationProps) {
  const { user } = usePrivy();
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');

  const steps = useMemo(() => [
    'Initializing Avail Nexus SDK...',
    'Bridging tokens across chains...',
    'Converting to target token...',
    'Executing smart contract...',
    'Confirming transaction...',
  ], []);

  useEffect(() => {
    if (isProcessing) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 20;
        });
      }, 600);

      return () => clearInterval(interval);
    }
  }, [isProcessing]);

  useEffect(() => {
    if (isProcessing) {
      const stepInterval = setInterval(() => {
        setCurrentStep(prev => {
          const currentIndex = steps.indexOf(prev);
          const nextIndex = (currentIndex + 1) % steps.length;
          return steps[nextIndex];
        });
      }, 600);

      return () => clearInterval(stepInterval);
    }
  }, [isProcessing, steps]);

  const processPayment = async () => {
    if (!user?.wallet?.address) {
      onError('Wallet not connected');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setCurrentStep(steps[0]);

    try {
      // Initialize mock SDK
      const sdk = new MockNexusSDK();
      await sdk.initialize(window.ethereum);

      // Prepare bridge and execute parameters
      const bridgeParams = {
        token: sourceToken,
        amount: sourceAmount,
        sourceChains: [sourceChainId],
        
        toChainId: targetChainId,
        recipient: process.env.NEXT_PUBLIC_SPLIT_CONTRACT_ADDRESS || '0xSplitContract',
        
        execute: {
          contractAddress: process.env.NEXT_PUBLIC_SPLIT_CONTRACT_ADDRESS || '0xSplitContract',
          functionName: 'contributeToBill',
          buildFunctionParams: () => ({
            functionParams: [
              splitId,
              contributorAddress,
              sourceChainId,
              sourceToken,
              sourceAmount,
              targetAmount
            ]
          }),
          tokenApproval: {
            token: targetToken,
            amount: targetAmount
          }
        }
      };

      // In production, this would be the actual Avail Nexus SDK call:
      /*
      const result = await sdk.bridgeAndExecute(bridgeParams);
      */

      // For now, use mock implementation
      const result = await sdk.bridgeAndExecute(bridgeParams);

      if (result.success) {
        onSuccess(result.transactionHash);
      } else {
        onError('Transaction failed');
      }
    } catch (error) {
      console.error('Avail Nexus SDK error:', error);
      onError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatAmount = (amount: string, token: string) => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return '';
    return `${numAmount.toLocaleString()} ${token}`;
  };

  const getChainName = (chainId: number) => {
    const chains: { [key: number]: string } = {
      1: 'Ethereum',
      137: 'Polygon',
      42161: 'Arbitrum',
      10: 'Optimism',
      8453: 'Base',
    };
    return chains[chainId] || `Chain ${chainId}`;
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
          <span className="text-2xl">🚀</span>
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">Avail Nexus SDK</h2>
        <p className="text-gray-400 text-sm">
          Seamless cross-chain payment processing
        </p>
      </div>

      {/* Payment Summary */}
      <div className="bg-gray-700 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-medium text-gray-300 mb-3">Payment Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">From:</span>
            <span className="text-white">
              {formatAmount(sourceAmount, sourceToken)} on {getChainName(sourceChainId)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">To:</span>
            <span className="text-white">
              {formatAmount(targetAmount, targetToken)} on {getChainName(targetChainId)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Split ID:</span>
            <span className="text-white font-mono text-xs">
              {splitId.slice(0, 10)}...{splitId.slice(-8)}
            </span>
          </div>
        </div>
      </div>

      {/* Processing Status */}
      {isProcessing && (
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Processing...</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-300 mb-2">{currentStep}</div>
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
          </div>
        </div>
      )}

      {/* Features List */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-300 mb-3">What Avail Nexus SDK handles:</h3>
        <ul className="space-y-2 text-sm text-gray-400">
          <li className="flex items-center">
            <span className="text-green-500 mr-2">✓</span>
            Cross-chain token bridging
          </li>
          <li className="flex items-center">
            <span className="text-green-500 mr-2">✓</span>
            Automatic token conversion
          </li>
          <li className="flex items-center">
            <span className="text-green-500 mr-2">✓</span>
            Gas fee optimization
          </li>
          <li className="flex items-center">
            <span className="text-green-500 mr-2">✓</span>
            Transaction confirmation
          </li>
          <li className="flex items-center">
            <span className="text-green-500 mr-2">✓</span>
            Smart contract execution
          </li>
        </ul>
      </div>

      {/* Action Button */}
      <button
        onClick={processPayment}
        disabled={isProcessing}
        className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isProcessing ? 'Processing...' : 'Process Payment with Avail Nexus SDK'}
      </button>

      {/* Info Footer */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          Powered by Avail Nexus SDK • Cross-chain made simple
        </p>
      </div>
    </div>
  );
}
