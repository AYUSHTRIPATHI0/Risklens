"use client";

import * as React from "react";
import { initialData, type AppData } from "@/lib/mock-data";
import { Logo } from "@/components/icons/logo";
import { RiskIndexGauge } from "@/components/dashboard/risk-index-gauge";
import { PlainEnglishInsights } from "@/components/dashboard/plain-english-insights";
import { RiskHeatmap } from "@/components/dashboard/risk-heatmap";
import { DriverBreakdown } from "@/components/dashboard/driver-breakdown";
import { SmartAlerts } from "@/components/dashboard/smart-alerts";
import { ScenarioExplorer } from "@/components/dashboard/scenario-explorer";
import { NarrativeCards } from "@/components/dashboard/narrative-cards";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function Home() {
  const [appData, setAppData] = React.useState<AppData | null>(null);

  React.useEffect(() => {
    setAppData(initialData);
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
    const yesterdayScores = appData.heatmapData.map(
        (d) => d.history[d.history.length - 2].score
      );
    const yesterdayAverage = Math.round(
      yesterdayScores.reduce((acc, score) => acc + score, 0) / yesterdayScores.length
    );
    return averageRisk - yesterdayAverage;
  }, [appData, averageRisk]);
  
  if (!appData) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background font-body">
      <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur md:px-6">
        <div className="flex items-center gap-2">
          <Logo />
          <h1 className="text-xl font-semibold text-foreground">RiskLens</h1>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6">
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
              riskData={{
                riskScoreChange,
                ...appData.driverBreakdown.reduce((acc, curr) => ({...acc, [curr.name.toLowerCase() + "Impact"]: curr.value}), {})
              }}
            />
            <RiskHeatmap data={appData.heatmapData} />
          </div>

          {/* Right Column */}
          <div className="lg:col-span-3 space-y-6">
            <ScenarioExplorer onApplyShocks={() => {}} />
            <NarrativeCards cards={appData.narrativeCards} />
          </div>
        </div>
      </main>
      <footer className="px-4 md:px-6 py-4">
        <Separator />
        <p className="text-center text-sm text-muted-foreground pt-4">RiskLens &copy; {new Date().getFullYear()}. For demonstration purposes only.</p>
      </footer>
    </div>
  );
}
