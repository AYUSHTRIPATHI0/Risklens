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
  factor: "Liquidity" | "Market" | "Geopolitical" | "Policy";
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
  smartAlerts: [
    { id: "alert1", company: "Gamma Financials", change: 12, trigger: "Volatility", timestamp: "2m ago" },
    { id: "alert2", company: "Alpha Corp", change: -9, trigger: "Sentiment", timestamp: "1h ago" },
    { id: "alert3", company: "Delta Energy", change: 8, trigger: "Macroeconomic", timestamp: "3h ago" },
  ],
  narrativeCards: [
    { id: "narr1", headline: "RBI policy news hints at upcoming liquidity challenges.", factor: "Liquidity", sentiment: -0.65 },
    { id: "narr2", headline: "Positive earnings forecast boosts market confidence.", factor: "Market", sentiment: 0.82 },
    { id: "narr3", headline: "Global supply chain disruptions create policy uncertainty.", factor: "Policy", sentiment: -0.40 },
    { id: "narr4", headline: "New trade agreement expected to stabilize international markets.", factor: "Geopolitical", sentiment: 0.75 },
  ]
};
