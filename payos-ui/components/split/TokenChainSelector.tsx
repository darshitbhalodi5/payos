'use client';

import { useState, useEffect } from 'react';
import {
  getAvailableTokens,
  validateTokenSelection,
  getTokenInfo,
  type TokenInfo
} from '@/lib/token-config';
import { SUPPORTED_CHAINS, getChainInfo, validateChainSelection } from '@/lib/chain-config';

interface TokenChainSelectorProps {
  selectedChainId: number;
  selectedToken: string;
  onChainChange: (chainId: number) => void;
  onTokenChange: (token: string) => void;
  disabled?: boolean;
  label?: string;
}

export default function TokenChainSelector({
  selectedChainId,
  selectedToken,
  onChainChange,
  onTokenChange,
  disabled = false,
  label = 'Select Chain & Token'
}: TokenChainSelectorProps) {
  const [availableTokens, setAvailableTokens] = useState<TokenInfo[]>([]);
  const [isValidSelection, setIsValidSelection] = useState(true);

  // Update available tokens when chain changes
  useEffect(() => {
    const tokens = getAvailableTokens(selectedChainId);
    setAvailableTokens(tokens);

    // Check if current token is still available on the new chain
    const isTokenValid = validateTokenSelection(selectedToken, selectedChainId);
    setIsValidSelection(isTokenValid);

    // If current token is not available, select the first available token
    if (!isTokenValid && tokens.length > 0) {
      onTokenChange(tokens[0].symbol);
    }
  }, [selectedChainId, selectedToken, onTokenChange]);

  const handleChainChange = (chainId: number) => {
    if (validateChainSelection(chainId)) {
      onChainChange(chainId);
    }
  };

  const handleTokenChange = (tokenSymbol: string) => {
    if (validateTokenSelection(tokenSymbol, selectedChainId)) {
      onTokenChange(tokenSymbol);
    }
  };

  const selectedChain = getChainInfo(selectedChainId);
  const selectedTokenInfo = getTokenInfo(selectedToken);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-white">{label}</h3>

      {/* Chain Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Chain
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {SUPPORTED_CHAINS.map((chain) => (
            <button
              key={chain.id}
              type="button"
              onClick={() => handleChainChange(chain.id)}
              disabled={disabled}
              className={`p-3 rounded-lg border text-left transition-all ${selectedChainId === chain.id
                  ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                  : 'border-gray-600 bg-gray-700 hover:border-gray-500 text-gray-300'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="font-medium">{chain.name}</div>
              <div className="text-xs text-gray-400">{chain.symbol}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Token Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Token
        </label>
        <div className="grid grid-cols-2 gap-2">
          {availableTokens.map((token) => (
            <button
              key={token.symbol}
              type="button"
              onClick={() => handleTokenChange(token.symbol)}
              disabled={disabled}
              className={`p-3 rounded-lg border text-left transition-all ${selectedToken === token.symbol
                  ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                  : 'border-gray-600 bg-gray-700 hover:border-gray-500 text-gray-300'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="font-medium">{token.symbol}</div>
              <div className="text-xs text-gray-400">{token.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Selection Summary */}
      <div className="bg-gray-700 rounded-lg p-3 border border-gray-600">
        <div className="text-sm text-gray-300">
          <div className="flex items-center justify-between">
            <span>Selected:</span>
            <span className="font-medium">
              {selectedChain?.name} • {selectedTokenInfo?.symbol}
            </span>
          </div>
          {selectedTokenInfo && (
            <div className="text-xs text-gray-400 mt-1">
              {selectedTokenInfo.name} ({selectedTokenInfo.decimals} decimals)
            </div>
          )}
        </div>

        {!isValidSelection && (
          <div className="text-xs text-red-400 mt-2">
            ⚠️ Selected token is not available on this chain
          </div>
        )}
      </div>
    </div>
  );
}
