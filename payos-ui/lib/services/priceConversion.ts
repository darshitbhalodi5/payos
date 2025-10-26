// Price conversion service using CoinGecko API

interface TokenPrice {
  [key: string]: number;
}

interface ConversionResult {
  convertedAmount: string;
  rate: number;
}

const TOKEN_TO_COINGECKO_ID: Record<string, string> = {
  ETH: 'ethereum',
  USDC: 'usd-coin',
  PYUSD: 'paypal-usd',
};

// Cache for prices (5 minutes)
let priceCache: {
  data: TokenPrice | null;
  timestamp: number;
} = {
  data: null,
  timestamp: 0,
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function fetchTokenPrices(): Promise<TokenPrice> {
  try {
    const tokenIds = Object.values(TOKEN_TO_COINGECKO_ID).join(',');
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${tokenIds}&vs_currencies=usd`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch token prices');
    }

    const data = await response.json();

    // Convert CoinGecko format to our format
    const prices: TokenPrice = {};
    for (const [token, id] of Object.entries(TOKEN_TO_COINGECKO_ID)) {
      prices[token] = data[id]?.usd || 0;
    }

    return prices;
  } catch (error) {
    console.error('Error fetching token prices:', error);
    // Return fallback prices
    return {
      ETH: 2500, // Example fallback
      USDC: 1,
      PYUSD: 1,
    };
  }
}

async function getTokenPrices(): Promise<TokenPrice> {
  const now = Date.now();

  // Check cache
  if (priceCache.data && now - priceCache.timestamp < CACHE_DURATION) {
    return priceCache.data;
  }

  // Fetch new prices
  const prices = await fetchTokenPrices();
  priceCache = {
    data: prices,
    timestamp: now,
  };

  return prices;
}

export async function convertTokenAmount(
  amount: string,
  fromToken: string,
  toToken: string
): Promise<ConversionResult> {
  if (fromToken === toToken) {
    return {
      convertedAmount: amount,
      rate: 1,
    };
  }

  const prices = await getTokenPrices();
  const fromPrice = prices[fromToken.toUpperCase()] || 0;
  const toPrice = prices[toToken.toUpperCase()] || 0;

  if (fromPrice === 0 || toPrice === 0) {
    throw new Error(`Unable to get price for ${fromToken} or ${toToken}`);
  }

  // Convert to USD value first, then to target token
  const usdValue = parseFloat(amount) * fromPrice;
  const convertedAmount = (usdValue / toPrice).toFixed(6);
  const rate = toPrice / fromPrice;

  return {
    convertedAmount,
    rate,
  };
}

export async function getTokenPrice(tokenSymbol: string): Promise<number> {
  const prices = await getTokenPrices();
  return prices[tokenSymbol.toUpperCase()] || 0;
}

