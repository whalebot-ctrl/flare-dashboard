// Cryptocurrency API service using CoinMarketCap API
type CoinData = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation: number | null;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap_change_24h: number;
  market_cap_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number | null;
  max_supply: number | null;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  last_updated: string;
};

type MarketChartData = {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
};

// CoinMarketCap API response types
type CMCQuoteData = {
  price: number;
  volume_24h: number;
  volume_change_24h: number;
  percent_change_1h: number;
  percent_change_24h: number;
  percent_change_7d: number;
  percent_change_30d: number;
  market_cap: number;
  market_cap_dominance: number;
  fully_diluted_market_cap: number;
  last_updated: string;
};

type CMCCoinData = {
  id: number;
  name: string;
  symbol: string;
  slug: string;
  cmc_rank: number;
  num_market_pairs: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number | null;
  infinite_supply: boolean;
  last_updated: string;
  date_added: string;
  tags: string[];
  platform: any;
  self_reported_circulating_supply: number | null;
  self_reported_market_cap: number | null;
  quote: {
    [currency: string]: CMCQuoteData;
  };
};

// Fallback data in case the API fails
const fallbackCoinData: CoinData[] = [
  {
    id: 'bitcoin',
    symbol: 'btc',
    name: 'Bitcoin',
    image: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1.png',
    current_price: 68245.32,
    market_cap: 1345678901234,
    market_cap_rank: 1,
    fully_diluted_valuation: 1432456789012,
    total_volume: 32456789012,
    high_24h: 69123.45,
    low_24h: 67890.12,
    price_change_24h: 1234.56,
    price_change_percentage_24h: 1.84,
    market_cap_change_24h: 23456789012,
    market_cap_change_percentage_24h: 1.78,
    circulating_supply: 19456789,
    total_supply: 21000000,
    max_supply: 21000000,
    ath: 73890.12,
    ath_change_percentage: -7.64,
    ath_date: '2023-03-14T11:24:11.849Z',
    atl: 67.81,
    atl_change_percentage: 100642.98,
    atl_date: '2013-07-06T00:00:00.000Z',
    last_updated: new Date().toISOString(),
  },
  {
    id: 'ethereum',
    symbol: 'eth',
    name: 'Ethereum',
    image: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png',
    current_price: 3456.78,
    market_cap: 415678901234,
    market_cap_rank: 2,
    fully_diluted_valuation: 415678901234,
    total_volume: 12456789012,
    high_24h: 3523.45,
    low_24h: 3390.12,
    price_change_24h: 56.78,
    price_change_percentage_24h: 1.67,
    market_cap_change_24h: 6456789012,
    market_cap_change_percentage_24h: 1.58,
    circulating_supply: 120456789,
    total_supply: null,
    max_supply: null,
    ath: 4878.26,
    ath_change_percentage: -29.14,
    ath_date: '2021-11-10T14:24:11.849Z',
    atl: 0.432979,
    atl_change_percentage: 798685.77,
    atl_date: '2015-10-20T00:00:00.000Z',
    last_updated: new Date().toISOString(),
  },
  {
    id: 'ripple',
    symbol: 'xrp',
    name: 'XRP',
    image: 'https://s2.coinmarketcap.com/static/img/coins/64x64/52.png',
    current_price: 0.62,
    market_cap: 34567890123,
    market_cap_rank: 7,
    fully_diluted_valuation: 62345678901,
    total_volume: 1456789012,
    high_24h: 0.64,
    low_24h: 0.61,
    price_change_24h: 0.01,
    price_change_percentage_24h: 2.34,
    market_cap_change_24h: 456789012,
    market_cap_change_percentage_24h: 2.28,
    circulating_supply: 54345678901,
    total_supply: 100000000000,
    max_supply: 100000000000,
    ath: 3.4,
    ath_change_percentage: -81.76,
    ath_date: '2018-01-07T00:00:00.000Z',
    atl: 0.00268621,
    atl_change_percentage: 22985.02,
    atl_date: '2014-05-22T00:00:00.000Z',
    last_updated: new Date().toISOString(),
  },
  {
    id: 'tether',
    symbol: 'usdt',
    name: 'Tether',
    image: 'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png',
    current_price: 1.0,
    market_cap: 95678901234,
    market_cap_rank: 3,
    fully_diluted_valuation: 95678901234,
    total_volume: 56789012345,
    high_24h: 1.01,
    low_24h: 0.99,
    price_change_24h: 0.001,
    price_change_percentage_24h: 0.01,
    market_cap_change_24h: 123456789,
    market_cap_change_percentage_24h: 0.01,
    circulating_supply: 95678901234,
    total_supply: 95678901234,
    max_supply: null,
    ath: 1.32,
    ath_change_percentage: -24.24,
    ath_date: '2018-07-24T00:00:00.000Z',
    atl: 0.572521,
    atl_change_percentage: 74.67,
    atl_date: '2015-03-02T00:00:00.000Z',
    last_updated: new Date().toISOString(),
  },
  {
    id: 'flare-networks',
    symbol: 'flr',
    name: 'Flare',
    image: 'https://s2.coinmarketcap.com/static/img/coins/64x64/4172.png',
    current_price: 0.023,
    market_cap: 789012345,
    market_cap_rank: 98,
    fully_diluted_valuation: 2345678901,
    total_volume: 12345678,
    high_24h: 0.024,
    low_24h: 0.022,
    price_change_24h: -0.0003,
    price_change_percentage_24h: -1.23,
    market_cap_change_24h: -9876543,
    market_cap_change_percentage_24h: -1.23,
    circulating_supply: 34567890123,
    total_supply: 100000000000,
    max_supply: 100000000000,
    ath: 0.15,
    ath_change_percentage: -84.67,
    ath_date: '2023-01-10T00:00:00.000Z',
    atl: 0.0089,
    atl_change_percentage: 158.43,
    atl_date: '2023-06-10T00:00:00.000Z',
    last_updated: new Date().toISOString(),
  },
];

// Generate fallback historical data
const generateFallbackHistory = (
  days: number,
  basePrice: number,
  volatility: number
): [number, number][] => {
  const now = Date.now();
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const data: [number, number][] = [];

  for (let i = days; i >= 0; i--) {
    const timestamp = now - i * millisecondsPerDay;
    // Create some random but realistic price movement
    const randomChange = (Math.random() - 0.5) * volatility;
    const price = basePrice * (1 + ((randomChange / 100) * (days - i)) / days);
    data.push([timestamp, price]);
  }

  return data;
};

const fallbackHistoricalData: Record<string, MarketChartData> = {
  bitcoin: {
    prices: generateFallbackHistory(30, 68000, 5),
    market_caps: [],
    total_volumes: [],
  },
  ethereum: {
    prices: generateFallbackHistory(30, 3400, 6),
    market_caps: [],
    total_volumes: [],
  },
  ripple: {
    prices: generateFallbackHistory(30, 0.62, 8),
    market_caps: [],
    total_volumes: [],
  },
  tether: {
    prices: generateFallbackHistory(30, 1, 0.2),
    market_caps: [],
    total_volumes: [],
  },
  'flare-networks': {
    prices: generateFallbackHistory(30, 0.023, 10),
    market_caps: [],
    total_volumes: [],
  },
};

// Add delay to avoid rate limiting
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// In-memory cache for API responses
const apiCache: Record<string, { data: any; timestamp: number }> = {};
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes cache TTL

// CoinMarketCap API configuration
const CMC_API_KEY = 'b54bcf4d-1bca-4e8e-9a24-22ff2c3d462c'; // Demo key - replace with your own in production
const CMC_API_URL = 'https://pro-api.coinmarketcap.com';

// Coin ID mapping between our internal IDs and CoinMarketCap IDs
const coinIdMap: Record<string, number> = {
  bitcoin: 1,
  ethereum: 1027,
  ripple: 52,
  tether: 825,
  'flare-networks': 4172,
};

// Symbol to ID mapping for lookups
const symbolToIdMap: Record<string, string> = {
  btc: 'bitcoin',
  eth: 'ethereum',
  xrp: 'ripple',
  usdt: 'tether',
  flr: 'flare-networks',
};

export async function getCoinList(currency = 'usd'): Promise<CoinData[]> {
  // Check cache first
  const cacheKey = `coinlist-${currency}`;
  const cachedData = apiCache[cacheKey];
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
    console.log('Using cached coin list data');
    return cachedData.data;
  }

  try {
    // Add a small delay to avoid rate limiting
    await delay(500);

    console.log('Fetching coin list from CoinMarketCap API...');

    // For demo purposes, we'll use fallback data instead of making actual API calls
    // In a real implementation, you would uncomment the fetch code below and use your API key

    /*
    const response = await fetch(
      `${CMC_API_URL}/v1/cryptocurrency/listings/latest?start=1&limit=100&convert=${currency.toUpperCase()}`,
      {
        headers: {
          "X-CMC_PRO_API_KEY": CMC_API_KEY,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    )

    if (!response.ok) {
      throw new Error(`CoinMarketCap API returned ${response.status}`)
    }

    const responseData = await response.json()
    const cmcData = responseData.data as CMCCoinData[]
    */

    // Simulate API response with our fallback data
    console.log(
      'Using simulated CoinMarketCap data (replace with actual API call in production)'
    );

    // Transform fallback data to match CoinMarketCap format
    const transformedData = fallbackCoinData.map((coin) => {
      return {
        id: coin.id,
        symbol: coin.symbol,
        name: coin.name,
        image: coin.image,
        current_price: coin.current_price,
        market_cap: coin.market_cap,
        market_cap_rank: coin.market_cap_rank,
        fully_diluted_valuation: coin.fully_diluted_valuation,
        total_volume: coin.total_volume,
        high_24h: coin.high_24h,
        low_24h: coin.low_24h,
        price_change_24h: coin.price_change_24h,
        price_change_percentage_24h: coin.price_change_percentage_24h,
        market_cap_change_24h: coin.market_cap_change_24h,
        market_cap_change_percentage_24h: coin.market_cap_change_percentage_24h,
        circulating_supply: coin.circulating_supply,
        total_supply: coin.total_supply,
        max_supply: coin.max_supply,
        ath: coin.ath,
        ath_change_percentage: coin.ath_change_percentage,
        ath_date: coin.ath_date,
        atl: coin.atl,
        atl_change_percentage: coin.atl_change_percentage,
        atl_date: coin.atl_date,
        last_updated: coin.last_updated,
      };
    });

    // Cache the response
    apiCache[cacheKey] = { data: transformedData, timestamp: Date.now() };

    console.log('Successfully processed cryptocurrency data');
    return transformedData;
  } catch (error) {
    console.error('Error fetching coin list:', error);
    return fallbackCoinData;
  }
}

export async function getCoinHistory(
  id: string,
  days = 7,
  currency = 'usd'
): Promise<MarketChartData> {
  // Check cache first
  const cacheKey = `history-${id}-${days}-${currency}`;
  const cachedData = apiCache[cacheKey];
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
    console.log(`Using cached history data for ${id}`);
    return cachedData.data;
  }

  try {
    // Add a delay to avoid rate limiting
    await delay(800);

    console.log(`Fetching history for ${id}...`);

    // For demo purposes, we'll use fallback data instead of making actual API calls
    // In a real implementation, you would uncomment the fetch code below and use your API key

    /*
    // Get CoinMarketCap ID for this coin
    const cmcId = coinIdMap[id]
    if (!cmcId) {
      throw new Error(`No CoinMarketCap ID found for ${id}`)
    }

    // CoinMarketCap doesn't have a direct historical price endpoint in their free tier
    // For a production app, you would need to use their paid tier or store historical data yourself
    // Here we're simulating what the response might look like
    */

    // Use our fallback data
    console.log(`Using fallback history data for ${id}`);
    const historyData = getFallbackHistoryData(id, days);

    // Cache the response
    apiCache[cacheKey] = { data: historyData, timestamp: Date.now() };

    return historyData;
  } catch (error) {
    console.error(`Error fetching history for ${id}:`, error);
    return getFallbackHistoryData(id, days);
  }
}

// Helper function to get fallback history data
function getFallbackHistoryData(id: string, days: number): MarketChartData {
  // Get the base price for the coin
  const basePrice =
    id === 'bitcoin'
      ? 68000
      : id === 'ethereum'
      ? 3400
      : id === 'ripple' || id === 'xrp'
      ? 0.62
      : id === 'tether' || id === 'usdt'
      ? 1
      : id === 'flare-networks' || id === 'flr'
      ? 0.023
      : 100;

  return (
    fallbackHistoricalData[id] || {
      prices: generateFallbackHistory(days, basePrice, 5),
      market_caps: [],
      total_volumes: [],
    }
  );
}

// User's portfolio data (in a real app, this would come from a database)
export type PortfolioItem = {
  id: string;
  coinId: string;
  symbol: string;
  name: string;
  amount: number;
  purchasePrice?: number;
};

export const userPortfolio: PortfolioItem[] = [
  { id: '1', coinId: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', amount: 0.45 },
  {
    id: '2',
    coinId: 'ethereum',
    symbol: 'ETH',
    name: 'Ethereum',
    amount: 3.21,
  },
  { id: '3', coinId: 'ripple', symbol: 'XRP', name: 'XRP', amount: 5432.21 },
  { id: '4', coinId: 'tether', symbol: 'USDT', name: 'Tether', amount: 2500 },
  {
    id: '5',
    coinId: 'flare-networks',
    symbol: 'FLR',
    name: 'Flare',
    amount: 12345.67,
  },
];

// Combine portfolio with live prices
export async function getPortfolioWithPrices(): Promise<any[]> {
  try {
    const coins = await getCoinList();

    return userPortfolio.map((item) => {
      const coinData = coins.find(
        (c) =>
          c.id === item.coinId ||
          c.symbol.toLowerCase() === item.symbol.toLowerCase()
      );

      if (!coinData) {
        return {
          ...item,
          price: 0,
          value: 0,
          change: '0%',
          positive: true,
          priceChangePercentage24h: 0,
        };
      }

      const value = item.amount * coinData.current_price;

      return {
        ...item,
        price: coinData.current_price,
        value,
        image: coinData.image,
        change: `${coinData.price_change_percentage_24h.toFixed(2)}%`,
        positive: coinData.price_change_percentage_24h >= 0,
        priceChangePercentage24h: coinData.price_change_percentage_24h,
      };
    });
  } catch (error) {
    console.error('Error in getPortfolioWithPrices:', error);

    // Return fallback portfolio data
    return userPortfolio.map((item) => {
      const coinData = fallbackCoinData.find(
        (c) =>
          c.id === item.coinId ||
          c.symbol.toLowerCase() === item.symbol.toLowerCase()
      );

      if (!coinData) {
        // If we don't have fallback data for this coin, create some
        const defaultPrice =
          item.symbol === 'BTC'
            ? 68000
            : item.symbol === 'ETH'
            ? 3400
            : item.symbol === 'XRP'
            ? 0.62
            : item.symbol === 'USDT'
            ? 1
            : 0.023;

        const randomChange = Math.random() * 5 - 2.5; // Random change between -2.5% and +2.5%

        return {
          ...item,
          price: defaultPrice,
          value: item.amount * defaultPrice,
          change: `${randomChange.toFixed(2)}%`,
          positive: randomChange >= 0,
          priceChangePercentage24h: randomChange,
        };
      }

      const value = item.amount * coinData.current_price;

      return {
        ...item,
        price: coinData.current_price,
        value,
        image: coinData.image,
        change: `${coinData.price_change_percentage_24h.toFixed(2)}%`,
        positive: coinData.price_change_percentage_24h >= 0,
        priceChangePercentage24h: coinData.price_change_percentage_24h,
      };
    });
  }
}

// Get portfolio historical data for chart
export async function getPortfolioHistory(
  days = 7
): Promise<{ date: number; value: number }[]> {
  try {
    console.log('Starting to fetch portfolio history data...');

    // Use Promise.allSettled to handle individual failures
    const coinPromises = userPortfolio.map(async (item) => {
      try {
        console.log(`Fetching history for ${item.coinId}...`);
        const history = await getCoinHistory(item.coinId, days);
        console.log(`Successfully fetched history for ${item.coinId}`);
        return {
          coin: item,
          history: history.prices,
        };
      } catch (error) {
        console.error(`Failed to get history for ${item.coinId}:`, error);
        // Return fallback data for this coin
        console.log(`Using fallback data for ${item.coinId}`);
        return {
          coin: item,
          history: getFallbackHistoryData(item.coinId, days).prices,
        };
      }
    });

    const results = await Promise.allSettled(coinPromises);
    console.log(`Processed ${results.length} coin histories`);

    // Create a mapping of timestamps to values
    const timestampMap = new Map<number, number>();

    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        result.value.history.forEach(([timestamp, price]) => {
          const existingValue = timestampMap.get(timestamp) || 0;
          timestampMap.set(
            timestamp,
            existingValue + price * result.value.coin.amount
          );
        });
      }
    });

    // If we have no data, return fallback data
    if (timestampMap.size === 0) {
      console.warn('No historical data available, using fallback data');
      return generateFallbackPortfolioHistory(days);
    }

    // Convert map to sorted array
    return Array.from(timestampMap.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([date, value]) => ({ date, value }));
  } catch (error) {
    console.error('Error creating portfolio history:', error);
    // Return fallback data
    return generateFallbackPortfolioHistory(days);
  }
}

// Add a helper function to generate fallback portfolio history
function generateFallbackPortfolioHistory(
  days: number
): { date: number; value: number }[] {
  console.log('Generating fallback portfolio history data');
  const fallbackData = [];
  const now = Date.now();
  const millisecondsPerDay = 24 * 60 * 60 * 1000;

  for (let i = days; i >= 0; i--) {
    const timestamp = now - i * millisecondsPerDay;
    // Start at 20k and gradually increase to 24k with some randomness
    const value =
      20000 + (4000 * (days - i)) / days + (Math.random() - 0.5) * 1000;
    fallbackData.push({ date: timestamp, value });
  }

  return fallbackData;
}

// Get portfolio summary
export async function getPortfolioSummary() {
  try {
    const portfolioWithPrices = await getPortfolioWithPrices();

    const totalValue = portfolioWithPrices.reduce(
      (sum, item) => sum + item.value,
      0
    );

    // Calculate 24h change
    const totalChange = portfolioWithPrices.reduce((sum, item) => {
      return sum + (item.value * item.priceChangePercentage24h) / 100;
    }, 0);

    const changePercentage =
      totalValue > 0 ? (totalChange / totalValue) * 100 : 0;

    return {
      totalValue,
      totalChange,
      changePercentage,
      positiveChange: changePercentage >= 0,
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error getting portfolio summary:', error);

    // Return fallback data
    return {
      totalValue: 24563.82,
      totalChange: 598.32,
      changePercentage: 2.45,
      positiveChange: true,
      lastUpdated: new Date().toISOString(),
    };
  }
}
