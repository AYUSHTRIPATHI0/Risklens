/**
 * @fileOverview A service to fetch financial data for the RiskLens dashboard.
 * This service now fetches real-time stock data from Alpha Vantage.
 */

import type { AppData, HeatmapData, DriverBreakdownData } from '@/lib/mock-data';
import { initialData } from '@/lib/mock-data';
import { subDays, format } from 'date-fns';

const STOCKS_TO_TRACK = [
  { symbol: 'AAPL', name: 'Alpha Corp', sector: 'Technology' },
  { symbol: 'BA', name: 'Beta Industries', sector: 'Industrials' },
  { symbol: 'GS', name: 'Gamma Financials', sector: 'Financials' },
  { symbol: 'XOM', name: 'Delta Energy', sector: 'Energy' },
  { symbol: 'UNH', name: 'Epsilon Health', sector: 'Healthcare' },
  { symbol: 'PG', name: 'Zeta Consumer', sector: 'Consumer Staples' },
];

/**
 * Normalizes a stock price to a risk score between 0 and 100.
 * This is a simplified example. A real risk score would involve much more complex calculations.
 * @param price The stock price.
 * @param minPrice The minimum price in the recent history.
 * @param maxPrice The maximum price in the recent history.
 * @returns A risk score from 0 to 100.
 */
function calculateRiskScore(price: number, minPrice: number, maxPrice: number): number {
    if (maxPrice === minPrice) return 50; // Neutral score if price hasn't changed
    // Inversely correlate risk with price (higher price -> lower risk score)
    const normalized = 1 - ((price - minPrice) / (maxPrice - minPrice));
    return Math.round(normalized * 100);
}

interface StockHistory extends HeatmapData {
    volumes: number[],
    dailyChanges: number[],
}

/**
 * Fetches time series data for a given stock symbol from Alpha Vantage.
 * @param symbol The stock symbol.
 * @returns A promise that resolves to the processed HeatmapData for the stock.
 */
async function getStockHistory(symbol: string, name: string, sector: string): Promise<StockHistory | null> {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
  if (!apiKey || apiKey === "YOUR_API_KEY") {
    console.warn("Alpha Vantage API key not found. Using mock data for history.");
    const mockHistory = initialData.heatmapData.find(d => d.id === name.split(' ')[0].toLowerCase())?.history || [];
    return { id: symbol.toLowerCase(), name, sector, history: mockHistory, volumes: [], dailyChanges: [] };
  }
  
  const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${apiKey}&outputsize=full`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch data for ${symbol}: ${response.statusText}`);
    }
    const data = await response.json();

    if (data['Error Message'] || !data['Time Series (Daily)']) {
      console.error(`API error for ${symbol}:`, data['Error Message'] || 'Invalid data format');
      // Adding a small delay to avoid hitting API limits in case of rapid retries
      await new Promise(resolve => setTimeout(resolve, 1000));
      return null;
    }

    const timeSeries = data['Time Series (Daily)'];
    const dates: string[] = [];
    const today = new Date();
    for (let i = 0; i < 90; i++) {
        dates.push(format(subDays(today, i), 'yyyy-MM-dd'));
    }

    const prices: number[] = [];
    const volumes: number[] = [];
    const dailyChanges: number[] = [];
    let lastPrice: number | null = null;
    
    for (const date of dates) {
        const entry = timeSeries[date];
        if (entry) {
            const closePrice = parseFloat(entry['4. close']);
            const volume = parseFloat(entry['5. volume']);

            if(!isNaN(closePrice)) prices.push(closePrice);
            if(!isNaN(volume)) volumes.push(volume);

            if (lastPrice !== null) {
                dailyChanges.push(((closePrice - lastPrice) / lastPrice) * 100);
            }
            lastPrice = closePrice;
        }
    }

    if (prices.length === 0) return null;

    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    const history = dates.map(date => {
        const entry = timeSeries[date];
        if (entry) {
            const closePrice = parseFloat(entry['4. close']);
            return {
                date: date,
                score: calculateRiskScore(closePrice, minPrice, maxPrice)
            };
        }
        return null;
    }).filter((item): item is { date: string; score: number } => item !== null);
    
    return {
        id: symbol.toLowerCase(),
        name: name,
        sector: sector,
        history: history.reverse(), // Ensure chronological order
        volumes,
        dailyChanges,
    };

  } catch (error) {
    console.error(`Error processing data for ${symbol}:`, error);
    return null;
  }
}

/**
 * Fetches the financial data for the dashboard.
 * @returns A promise that resolves to the AppData.
 */
export async function getFinancialData(): Promise<AppData> {
  console.log("Fetching financial data...");

  const stockHistoryPromises = STOCKS_TO_TRACK.map(stock => getStockHistory(stock.symbol, stock.name, stock.sector));
  const stockHistories = (await Promise.all(stockHistoryPromises)).filter((d): d is StockHistory => d !== null);

  // Filter out any stocks that failed to fetch history
  const validHeatmapData = stockHistories.filter(d => d.history.length > 0);
  
  // Calculate aggregate driver breakdown data
  const allDailyChanges = stockHistories.flatMap(s => s.dailyChanges);
  const meanChange = allDailyChanges.reduce((a, b) => a + b, 0) / allDailyChanges.length;
  const volatility = Math.sqrt(allDailyChanges.reduce((sq, n) => sq + Math.pow(n - meanChange, 2), 0) / (allDailyChanges.length -1));
  
  const allVolumes = stockHistories.flatMap(s => s.volumes);
  const averageVolume = allVolumes.reduce((a, b) => a + b, 0) / allVolumes.length;
  // Simple liquidity score, higher volume means higher score
  const liquidity = Math.log(averageVolume); 

  const rawDrivers = {
      volatility: volatility,
      liquidity: liquidity,
      macroeconomic: 1.5, // Static value for now
      sentiment: 1.2, // Static value for now
  }

  const totalDriverValue = Object.values(rawDrivers).reduce((a, b) => a + b, 0);

  const driverBreakdown: DriverBreakdownData[] = [
      { name: "Volatility", value: Math.round((rawDrivers.volatility / totalDriverValue) * 100), fill: "hsl(var(--chart-1))" },
      { name: "Liquidity", value: Math.round((rawDrivers.liquidity / totalDriverValue) * 100), fill: "hsl(var(--chart-4))" },
      { name: "Macroeconomic", value: Math.round((rawDrivers.macroeconomic / totalDriverValue) * 100), fill: "hsl(var(--chart-2))" },
      { name: "Sentiment", value: Math.round((rawDrivers.sentiment / totalDriverValue) * 100), fill: "hsl(var(--chart-3))" },
  ];

  return {
      heatmapData: validHeatmapData,
      driverBreakdown: driverBreakdown,
      smartAlerts: initialData.smartAlerts,
      narrativeCards: initialData.narrativeCards,
  };
}
