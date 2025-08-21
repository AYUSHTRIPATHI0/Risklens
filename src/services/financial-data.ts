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

const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;

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
  if (!API_KEY || API_KEY === "YOUR_API_KEY") {
    console.warn("Alpha Vantage API key not found. Using mock data for history.");
    const mockHistory = initialData.heatmapData.find(d => d.id === name.split(' ')[0].toLowerCase())?.history || [];
    return { id: symbol.toLowerCase(), name, sector, history: mockHistory, volumes: [], dailyChanges: [] };
  }
  
  const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${API_KEY}&outputsize=compact`;
  
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

async function getNewsSentiment(): Promise<{narrativeCards: NarrativeCard[], sentimentScore: number}> {
    if (!API_KEY || API_KEY === "YOUR_API_KEY") {
        return { narrativeCards: [], sentimentScore: 1.2 }; // fallback
    }

    const tickers = STOCKS_TO_TRACK.map(s => s.symbol).join(',');
    const url = `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=${tickers}&apikey=${API_KEY}&limit=10`;

    try {
        const response = await debouncedFetch(url);
        const data = await response.json();

        if (data['Error Message'] || !data.feed) {
             console.error(`API error for news sentiment:`, data['Note'] || data['Error Message'] || 'Invalid data format');
             return { narrativeCards: [], sentimentScore: 1.2 };
        }

        const feed = data.feed as any[];
        let totalScore = 0;

        const topicToFactor: Record<string, NarrativeCard['factor']> = {
            "ipo": "Market",
            "mergers_and_acquisitions": "Market",
            "financial_markets": "Market",
            "economy_fiscal": "Policy",
            "economy_monetary": "Policy",
            "economy_macro": "Economic",
            "energy_transportation": "Geopolitical",
            "finance": "Finance",
            "life_sciences": "Technology",
            "manufacturing": "Technology",
            "real_estate": "Market",
            "retail_wholesale": "Market",
            "technology": "Technology",
        }

        const narrativeCards: NarrativeCard[] = feed.map((item, index) => {
            const tickerSentiment = item.ticker_sentiment.find((t: any) => STOCKS_TO_TRACK.some(s => s.symbol === t.ticker));
            const sentimentScore = parseFloat(tickerSentiment?.relevance_score) * parseFloat(tickerSentiment?.sentiment_score) || 0;
            totalScore += sentimentScore;
            
            const mainTopic = item.topics[0]?.topic || "Market";
            const factor = topicToFactor[mainTopic.toLowerCase()] || "Market";

            return {
                id: `narr${index}`,
                headline: item.title,
                sentiment: sentimentScore,
                factor: factor
            };
        });

        const sentimentScore = feed.length > 0 ? Math.abs(totalScore) * 5 : 1.2;

        return { narrativeCards, sentimentScore };

    } catch (error) {
        console.error("Error fetching news sentiment:", error);
        return { narrativeCards: [], sentimentScore: 1.2 };
    }
}


async function getMacroEconomicIndicator(): Promise<number> {
    if (!API_KEY || API_KEY === "YOUR_API_KEY") {
        return 1.5; // fallback
    }

    const url = `https://www.alphavantage.co/query?function=FEDERAL_FUNDS_RATE&apikey=${API_KEY}`;
    
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
    getNewsSentiment(),
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

