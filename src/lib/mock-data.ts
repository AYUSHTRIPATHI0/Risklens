export interface HeatmapData {
  id: string;
  name: string;
  sector: string;
  history: { date: string; score: number }[];
}

export interface DriverBreakdownData {
  name: "Volatility" | "Macroeconomic" | "Sentiment" | "Liquidity";
  value: number;
  fill: string;
}

export interface SmartAlert {
  id: string;
  company: string;
  change: number;
  trigger: "Volatility" | "Macroeconomic" | "Sentiment";
  timestamp: string;
}

export interface NarrativeCard {
  id: string;
  headline: string;
  sentiment: number;
  factor: "Liquidity" | "Market" | "Geopolitical" | "Policy" | "Technology" | "Finance" | "Economic";
}

export interface AppData {
  heatmapData: HeatmapData[];
  driverBreakdown: DriverBreakdownData[];
  smartAlerts: SmartAlert[];
  narrativeCards: NarrativeCard[];
}

function generateHistory(baseScore: number): { date: string; score: number }[] {
    const history: { date: string; score: number }[] = [];
    let currentScore = baseScore;
    for (let i = 89; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const change = (Math.random() - 0.5) * 5;
        currentScore = Math.max(0, Math.min(100, currentScore + change));
        history.push({ date: date.toISOString().split('T')[0], score: Math.round(currentScore) });
    }
    return history;
}

// This is now only used as a fallback if the API fails for a specific stock.
export const initialData: AppData = {
  heatmapData: [
    { id: "alpha", name: "Alpha Corp", sector: "Technology", history: generateHistory(68) },
    { id: "beta", name: "Beta Industries", sector: "Industrials", history: generateHistory(42) },
    { id: "gamma", name: "Gamma Financials", sector: "Financials", history: generateHistory(81) },
    { id: "delta", name: "Delta Energy", sector: "Energy", history: generateHistory(55) },
    { id: "epsilon", name: "Epsilon Health", sector: "Healthcare", history: generateHistory(25) },
    { id: "zeta", name: "Zeta Consumer", sector: "Consumer Staples", history: generateHistory(33) },
  ],
  driverBreakdown: [
    { name: "Volatility", value: 40, fill: "hsl(var(--chart-1))" },
    { name: "Macroeconomic", value: 25, fill: "hsl(var(--chart-2))" },
    { name: "Sentiment", value: 20, fill: "hsl(var(--chart-3))" },
    { name: "Liquidity", value: 15, fill: "hsl(var(--chart-4))" },
  ],
  smartAlerts: [],
  narrativeCards: []
};

