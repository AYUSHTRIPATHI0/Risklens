/**
 * @fileOverview A service to fetch financial data for the RiskLens dashboard.
 * This service now fetches real-time stock data from Alpha Vantage.
 */

import type { AppData, HeatmapData } from '@/lib/mock-data';
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


/**
 * Fetches time series data for a given stock symbol from Alpha Vantage.
 * @param symbol The stock symbol.
 * @returns A promise that resolves to the processed HeatmapData for the stock.
 */
async function getStockHistory(symbol: string, name: string, sector: string): Promise<HeatmapData> {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
  if (!apiKey || apiKey === "YOUR_API_KEY") {
    console.warn("Alpha Vantage API key not found. Using mock data for history.");
    // Return mock-like structure if API key is missing
    return { id: symbol.toLowerCase(), name, sector, history: initialData.heatmapData.find(d => d.id === name.split(' ')[0].toLowerCase())?.history || [] };
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
      return { id: symbol.toLowerCase(), name, sector, history: [] };
    }

    const timeSeries = data['Time Series (Daily)'];
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 90; i++) {
        dates.push(format(subDays(today, i), 'yyyy-MM-dd'));
    }

    const prices = dates.map(date => parseFloat(timeSeries[date]?.['4. close'])).filter(p => !isNaN(p));
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
    };

  } catch (error) {
    console.error(`Error processing data for ${symbol}:`, error);
    return { id: symbol.toLowerCase(), name, sector, history: [] };
  }
}

/**
 * Fetches the financial data for the dashboard.
 * @returns A promise that resolves to the AppData.
 */
export async function getFinancialData(): Promise<AppData> {
  console.log("Fetching financial data...");

  const heatmapDataPromises = STOCKS_TO_TRACK.map(stock => getStockHistory(stock.symbol, stock.name, stock.sector));
  const heatmapData = await Promise.all(heatmapDataPromises);
  
  // Filter out any stocks that failed to fetch history
  const validHeatmapData = heatmapData.filter(d => d.history.length > 0);
  
  // For now, we return mock data for other sections as Alpha Vantage doesn't directly provide this.
  // In a real app, you might have other APIs or calculations for these.
  return {
      heatmapData: validHeatmapData,
      driverBreakdown: initialData.driverBreakdown,
      smartAlerts: initialData.smartAlerts,
      narrativeCards: initialData.narrativeCards,
  };
}
