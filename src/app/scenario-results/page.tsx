"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { type AppData, type HeatmapData } from "@/lib/mock-data";
import { Logo } from "@/components/icons/logo";
import { RiskIndexGauge } from "@/components/dashboard/risk-index-gauge";
import { RiskHeatmap } from "@/components/dashboard/risk-heatmap";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

function ResultsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <div className="lg:col-span-3" />
      <div className="lg:col-span-6 space-y-6">
        <Card>
          <CardContent className="p-4 md:p-6">
            <Skeleton className="h-48 w-48 rounded-full mx-auto" />
          </CardContent>
        </Card>
        <Card className="h-[400px]">
          <CardHeader>
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-3" />
    </div>
  )
}

function applyShocks(data: AppData, shocks: Record<string, number>): AppData {
  const { interestRate = 0, fx = 0, commodityPrice = 0 } = shocks;

  const interestRateMultiplier = 1 + (interestRate / 100);
  const fxMultiplier = 1 + (fx / 100);
  const commodityMultiplier = 1 + (commodityPrice / 100);

  const sectorMultipliers: Record<string, number> = {
    Technology: 1,
    Industrials: commodityMultiplier,
    Financials: interestRateMultiplier,
    Energy: commodityMultiplier,
    Healthcare: 1,
    'Consumer Staples': fxMultiplier,
  };

  const newHeatmapData: HeatmapData[] = data.heatmapData.map(company => {
    const sectorMultiplier = sectorMultipliers[company.sector] || 1;
    const newHistory = company.history.map(day => {
      const newScore = Math.min(100, Math.max(0, day.score * sectorMultiplier));
      return { ...day, score: Math.round(newScore) };
    });
    return { ...company, history: newHistory };
  });

  return { ...data, heatmapData: newHeatmapData };
}

export default function ScenarioResultsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [shockedData, setShockedData] = React.useState<AppData | null>(null);

  const interestRate = parseFloat(searchParams.get("interestRate") || '0');
  const fx = parseFloat(searchParams.get("fx") || '0');
  const commodityPrice = parseFloat(searchParams.get("commodityPrice") || '0');
  const appDataString = searchParams.get("appData");

  React.useEffect(() => {
    if (appDataString) {
      try {
        const originalData = JSON.parse(appDataString);
        const shocks = { interestRate, fx, commodityPrice };
        const newAppData = applyShocks(originalData, shocks);
        setShockedData(newAppData);
      } catch (error) {
        console.error("Failed to parse appData or apply shocks", error);
        // Handle error, maybe redirect back or show an error message
      }
    }
  }, [appDataString, interestRate, fx, commodityPrice]);

  const averageRisk = React.useMemo(() => {
    if (!shockedData) return 0;
    const todayScores = shockedData.heatmapData.map(
      (d) => d.history[d.history.length - 1].score
    );
    return Math.round(
      todayScores.reduce((acc, score) => acc + score, 0) / todayScores.length
    );
  }, [shockedData]);
  
  const formattedShocks = [
    {label: "Interest Rate", value: interestRate, unit: "%"},
    {label: "FX", value: fx, unit: "%"},
    {label: "Commodity Price", value: commodityPrice, unit: "%"}
  ].filter(s => s.value !== 0);

  return (
    <div className="flex min-h-screen w-full flex-col bg-background font-body">
      <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur md:px-6">
        <div className="flex items-center gap-2">
          <Logo />
          <h1 className="text-xl font-semibold text-foreground">RiskLens - Scenario Results</h1>
        </div>
        <div className="ml-auto">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6">
        {!shockedData ? (
          <ResultsSkeleton />
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="lg:col-span-3">
               <Card>
                    <CardHeader>
                        <CardTitle>Applied Shocks</CardTitle>
                        <CardDescription>The hypothetical scenario you created.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {formattedShocks.length > 0 ? formattedShocks.map(shock => (
                             <div key={shock.label} className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">{shock.label}</span>
                                <span className="font-bold text-accent">
                                    {shock.value > 0 ? "+" : ""}{shock.value}{shock.unit}
                                </span>
                            </div>
                        )) : <p className="text-sm text-muted-foreground">No shocks applied.</p>}
                    </CardContent>
                </Card>
            </div>

            <div className="lg:col-span-6 space-y-6">
              <Card>
                <CardContent className="p-4 md:p-6">
                  <RiskIndexGauge value={averageRisk} />
                </CardContent>
              </Card>
              <RiskHeatmap data={shockedData.heatmapData} />
            </div>
            
            <div className="lg:col-span-3" />
          </div>
        )}
      </main>
       <footer className="px-4 md:px-6 py-4">
        <Separator />
        <p className="text-center text-sm text-muted-foreground pt-4">RiskLens &copy; {new Date().getFullYear()}. For demonstration purposes only.</p>
      </footer>
    </div>
  );
}