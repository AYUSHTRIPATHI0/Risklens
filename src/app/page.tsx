"use client";

import * as React from "react";
import { type AppData } from "@/lib/mock-data";
import { getFinancialData } from "@/services/financial-data";
import { Logo } from "@/components/icons/logo";
import { RiskIndexGauge } from "@/components/dashboard/risk-index-gauge";
import { PlainEnglishInsights } from "@/components/dashboard/plain-english-insights";
import { RiskHeatmap } from "@/components/dashboard/risk-heatmap";
import { DriverBreakdown } from "@/components/dashboard/driver-breakdown";
import { SmartAlerts } from "@/components/dashboard/smart-alerts";
import { ScenarioExplorer } from "@/components/dashboard/scenario-explorer";
import { NarrativeCards } from "@/components/dashboard/narrative-cards";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <div className="lg:col-span-3 space-y-6">
        <Card className="h-[400px]">
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-48 w-48 rounded-full mx-auto" />
          </CardContent>
        </Card>
        <Card className="h-[300px]">
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-6 space-y-6">
        <Card>
          <CardContent className="p-4 md:p-6">
            <Skeleton className="h-48 w-48 rounded-full mx-auto" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
             <Skeleton className="h-6 w-1/3" />
             <Skeleton className="h-4 w-2/3" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-10 w-full" />
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
      <div className="lg:col-span-3 space-y-6">
        <Card className="h-[350px]">
           <CardHeader>
             <Skeleton className="h-6 w-1/2" />
             <Skeleton className="h-4 w-3/4" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </CardContent>
        </Card>
        <Card className="h-[400px]">
          <CardHeader>
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
          </CardHeader>
           <CardContent className="space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


export default function Home() {
  const [appData, setAppData] = React.useState<AppData | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const data = await getFinancialData();
        setAppData(data);
      } catch (error) {
        console.error("Failed to fetch financial data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const averageRisk = React.useMemo(() => {
    if (!appData) return 0;
    const todayScores = appData.heatmapData.map(
      (d) => d.history[d.history.length - 1].score
    );
    return Math.round(
      todayScores.reduce((acc, score) => acc + score, 0) / todayScores.length
    );
  }, [appData]);

  const riskScoreChange = React.useMemo(() => {
    if (!appData) return 0;
    if (appData.heatmapData.some(d => d.history.length < 2)) return 0;
    const yesterdayScores = appData.heatmapData.map(
        (d) => d.history[d.history.length - 2].score
      );
    const yesterdayAverage = Math.round(
      yesterdayScores.reduce((acc, score) => acc + score, 0) / yesterdayScores.length
    );
    return averageRisk - yesterdayAverage;
  }, [appData, averageRisk]);
  

  const plainEnglishInsightsData = React.useMemo(() => {
    const defaultData = {
        riskScoreChange: 0,
        volatilityImpact: 0,
        macroeconomicImpact: 0,
        sentimentImpact: 0,
        liquidityImpact: 0,
    };

    if (!appData) {
        return defaultData;
    }

    const driverImpacts = appData.driverBreakdown.reduce((acc, curr) => {
        const key = (curr.name.toLowerCase() + "Impact") as keyof typeof defaultData;
        acc[key] = curr.value;
        return acc;
    }, {} as any);

    return {
        riskScoreChange: riskScoreChange,
        ...driverImpacts,
    };
  }, [appData, riskScoreChange]);

  return (
    <div className="flex min-h-screen w-full flex-col bg-background font-body">
      <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur md:px-6">
        <div className="flex items-center gap-2">
          <Logo />
          <h1 className="text-xl font-semibold text-foreground">RiskLens</h1>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6">
        {loading || !appData ? (
          <DashboardSkeleton />
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Left Column */}
            <div className="lg:col-span-3 space-y-6">
              <DriverBreakdown data={appData.driverBreakdown} />
              <SmartAlerts alerts={appData.smartAlerts} />
            </div>

            {/* Middle Column */}
            <div className="lg:col-span-6 space-y-6">
              <Card>
                <CardContent className="p-4 md:p-6">
                  <RiskIndexGauge value={averageRisk} />
                </CardContent>
              </Card>
              <PlainEnglishInsights
                riskData={plainEnglishInsightsData}
              />
              <RiskHeatmap data={appData.heatmapData} />
            </div>

            {/* Right Column */}
            <div className="lg:col-span-3 space-y-6">
              <ScenarioExplorer onApplyShocks={() => {}} />
              <NarrativeCards cards={appData.narrativeCards} />
            </div>
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
