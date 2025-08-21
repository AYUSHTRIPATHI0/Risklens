/**
 * @fileOverview A service to fetch financial data for the RiskLens dashboard.
 * This service now fetches real-time stock data from Alpha Vantage.
 */

import type { AppData, HeatmapData, DriverBreakdownData, SmartAlert, NarrativeCard } from '@/lib/mock-data';
import { initialData } from '@/lib/mock-data';
import { subDays, format, parseISO } from 'date-fns';

const STOCKS_TO_TRACK = [
  { symbol: 'AAPL', name: 'Alpha Corp', sector: 'Technology' },
  { symbol: 'BA', name: 'Beta Industries', sector: 'Industrials' },
  { symbol: 'GS', name: 'Gamma Financials', sector: 'Financials' },
  { symbol: 'XOM', name: 'Delta Energy', sector: 'Energy' },
  { symbol: 'UNH', name: 'Epsilon Health', sector: 'Healthcare' },
  { symbol: 'PG', name: 'Zeta Consumer', sector: 'Consumer Staples' },
];

const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const NEWS_API_KEY = process.env.NEWS_API_KEY;

// Debounce subsequent calls to avoid hitting API rate limits
let lastApiCallTime = 0;
const API_CALL_DEBOUNCE_MS = 15000; // 15 seconds for 5 calls/min limit

async function debouncedFetch(url: string) {
    const now = Date.now();
    const timeSinceLastCall = now - lastApiCallTime;

    if (timeSinceLastCall < API_CALL_DEBOUNCE_MS) {
        const waitTime = API_CALL_DEBOUNCE_MS - timeSinceLastCall;
        console.log(`Debouncing API call, waiting ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    lastApiCallTime = Date.now();
    return fetch(url);
}


function calculateRiskScore(price: number, minPrice: number, maxPrice: number): number {
    if (maxPrice === minPrice) return 50;
    const normalized = 1 - ((price - minPrice) / (maxPrice - minPrice));
    return Math.round(normalized * 100);
}

interface StockHistory extends HeatmapData {
    volumes: number[],
    dailyChanges: number[],
}

async function getStockHistory(symbol: string, name: string, sector: string): Promise<StockHistory | null> {
  if (!ALPHA_VANTAGE_API_KEY || ALPHA_VANTAGE_API_KEY === "YOUR_API_KEY") {
    console.warn("Alpha Vantage API key not found. Using mock data for history.");
    const mockHistory = initialData.heatmapData.find(d => d.id === name.split(' ')[0].toLowerCase())?.history || [];
    return { id: symbol.toLowerCase(), name, sector, history: mockHistory, volumes: [], dailyChanges: [] };
  }
  
  const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}&outputsize=compact`;
  
  try {
    const response = await debouncedFetch(url);
    if (!response.ok) throw new Error(`Failed to fetch data for ${symbol}: ${response.statusText}`);
    const data = await response.json();

    if (data['Error Message'] || !data['Time Series (Daily)']) {
      console.error(`API error for ${symbol}:`, data['Note'] || data['Error Message'] || 'Invalid data format');
      return null;
    }

    const timeSeries = data['Time Series (Daily)'];
    const dates: string[] = Object.keys(timeSeries).slice(0, 90);

    const prices: number[] = [];
    const volumes: number[] = [];
    const dailyChanges: number[] = [];
    let lastPrice: number | null = null;
    
    for (const date of dates.sort((a,b) => new Date(a).getTime() - new Date(b).getTime()) ) {
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
        const closePrice = parseFloat(entry['4. close']);
        return {
            date: date,
            score: calculateRiskScore(closePrice, minPrice, maxPrice)
        };
    }).filter((item): item is { date: string; score: number } => item !== null);
    
    return {
        id: symbol.toLowerCase(),
        name: name,
        sector: sector,
        history: history.sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime()),
        volumes,
        dailyChanges,
    };

  } catch (error) {
    console.error(`Error processing data for ${symbol}:`, error);
    return null;
  }
}

async function getNewsData(): Promise<{narrativeCards: NarrativeCard[], sentimentScore: number}> {
    if (!NEWS_API_KEY || NEWS_API_KEY === "YOUR_NEWS_API_KEY") {
        console.warn("News API key not found. Skipping news fetch.");
        return { narrativeCards: [], sentimentScore: 1.2 };
    }

    const keywords = STOCKS_TO_TRACK.map(s => s.name.split(' ')[0]).join(' OR ');
    const url = `https://newsapi.org/v2/everything?q=finance AND (${keywords})&sortBy=relevancy&language=en&apiKey=${NEWS_API_KEY}&pageSize=10`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch news data: ${response.statusText}`);
        }
        const data = await response.json();

        if (data.status !== 'ok') {
            throw new Error(`News API error: ${data.message}`);
        }

        const factorKeywords: Record<string, NarrativeCard['factor']> = {
            'interest rate': 'Policy',
            'fed': 'Policy',
            'government': 'Geopolitical',
            'war': 'Geopolitical',
            'cyber': 'Technology',
            'stock': 'Market',
            'market': 'Market',
            'shares': 'Finance',
            'profit': 'Finance',
            'loss': 'Finance',
            'economy': 'Economic',
        }

        const narrativeCards: NarrativeCard[] = data.articles.map((article: any, index: number) => {
            let factor: NarrativeCard['factor'] = 'Market'; // Default
            const headlineLower = article.title.toLowerCase();
            for(const keyword in factorKeywords) {
                if (headlineLower.includes(keyword)) {
                    factor = factorKeywords[keyword];
                    break;
                }
            }
            
            return {
                id: `narr-${index}`,
                headline: article.title,
                sentiment: 0, // NewsAPI does not provide sentiment
                factor: factor,
            };
        });

        // Placeholder for sentiment calculation
        const sentimentScore = 1.2;

        return { narrativeCards, sentimentScore };

    } catch (error) {
        console.error("Error fetching news from News API:", error);
        return { narrativeCards: [], sentimentScore: 1.2 };
    }
}


async function getMacroEconomicIndicator(): Promise<number> {
    if (!ALPHA_VANTAGE_API_KEY || ALPHA_VANTAGE_API_KEY === "YOUR_API_KEY") {
        return 1.5; // fallback
    }

    const url = `https://www.alphavantage.co/query?function=FEDERAL_FUNDS_RATE&apikey=${ALPHA_VANTAGE_API_KEY}`;
    
    try {
        const response = await debouncedFetch(url);
        const data = await response.json();
        
        if (data['Error Message'] || !data.data) {
             console.error(`API error for macro indicator:`, data['Note'] || data['Error Message'] || 'Invalid data format');
             return 1.5;
        }

        const latestRate = parseFloat(data.data[0].value);
        return isNaN(latestRate) ? 1.5 : latestRate;
    } catch (error) {
        console.error("Error fetching macro indicator:", error);
        return 1.5;
    }
}

export async function getFinancialData(): Promise<AppData> {
  console.log("Fetching real-time financial data...");

  const [stockHistoriesResult, newsResult, macroResult] = await Promise.all([
    Promise.all(STOCKS_TO_TRACK.map(stock => getStockHistory(stock.symbol, stock.name, stock.sector))),
    getNewsData(),
    getMacroEconomicIndicator(),
  ]);

  const stockHistories = stockHistoriesResult.filter((d): d is StockHistory => d !== null);
  const validHeatmapData = stockHistories.filter(d => d.history.length > 0);

  // Generate Smart Alerts
  const smartAlerts: SmartAlert[] = [];
  validHeatmapData.forEach(company => {
    if (company.history.length > 1) {
        const todayScore = company.history[company.history.length - 1].score;
        const yesterdayScore = company.history[company.history.length - 2].score;
        const change = todayScore - yesterdayScore;
        if (Math.abs(change) > 8) { // Alert threshold
            smartAlerts.push({
                id: `alert-${company.id}`,
                company: company.name,
                change: change,
                trigger: "Volatility", // Simplified trigger
                timestamp: "Just now"
            });
        }
    }
  });


  // Calculate aggregate driver breakdown data
  const allDailyChanges = stockHistories.flatMap(s => s.dailyChanges);
  const meanChange = allDailyChanges.length > 0 ? allDailyChanges.reduce((a, b) => a + b, 0) / allDailyChanges.length : 0;
  const volatility = allDailyChanges.length > 1 ? Math.sqrt(allDailyChanges.reduce((sq, n) => sq + Math.pow(n - meanChange, 2), 0) / (allDailyChanges.length -1)) : 0;
  
  const allVolumes = stockHistories.flatMap(s => s.volumes);
  const averageVolume = allVolumes.length > 0 ? allVolumes.reduce((a, b) => a + b, 0) / allVolumes.length : 0;
  const liquidity = averageVolume > 0 ? Math.log(averageVolume) : 0; 

  const rawDrivers = {
      volatility: volatility,
      liquidity: liquidity,
      macroeconomic: macroResult,
      sentiment: newsResult.sentimentScore,
  };

  const totalDriverValue = Object.values(rawDrivers).reduce((a, b) => a + b, 0);

  const driverBreakdown: DriverBreakdownData[] = totalDriverValue > 0 ? [
      { name: "Volatility", value: Math.round((rawDrivers.volatility / totalDriverValue) * 100), fill: "hsl(var(--chart-1))" },
      { name: "Liquidity", value: Math.round((rawDrivers.liquidity / totalDriverValue) * 100), fill: "hsl(var(--chart-4))" },
      { name: "Macroeconomic", value: Math.round((rawDrivers.macroeconomic / totalDriverValue) * 100), fill: "hsl(var(--chart-2))" },
      { name: "Sentiment", value: Math.round((rawDrivers.sentiment / totalDriverValue) * 100), fill: "hsl(var(--chart-3))" },
  ] : initialData.driverBreakdown;

  return {
      heatmapData: validHeatmapData.length > 0 ? validHeatmapData : initialData.heatmapData,
      driverBreakdown,
      smartAlerts,
      narrativeCards: newsResult.narrativeCards,
  };
}
