"use client";

import * as React from "react";
import { useRouter } from 'next/navigation'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal } from "lucide-react";
import { AppData } from "@/lib/mock-data";

interface ScenarioExplorerProps {
  appData: AppData;
}

export function ScenarioExplorer({ appData }: ScenarioExplorerProps) {
  const router = useRouter();
  const [shocks, setShocks] = React.useState({
    interestRate: 0,
    fx: 0,
    commodityPrice: 0,
  });

  const handleSliderChange = (name: keyof typeof shocks, value: number[]) => {
    setShocks((prev) => ({ ...prev, [name]: value[0] }));
  };
  
  const handleApplyShocks = () => {
    const params = new URLSearchParams();
    params.set("interestRate", shocks.interestRate.toString());
    params.set("fx", shocks.fx.toString());
    params.set("commodityPrice", shocks.commodityPrice.toString());
    
    // Pass the whole dataset to the results page to be re-calculated
    // In a real app, you might just pass IDs and re-fetch, but this is fine for this demo.
    try {
      params.set("appData", JSON.stringify(appData));
    } catch(e) {
      console.error("Could not stringify app data", e);
      // handle error, maybe show a toast
      return;
    }
    
    router.push(`/scenario-results?${params.toString()}`);
  }

  const scenarios = [
    {
      name: "interestRate",
      label: "Interest Rate Shock",
      min: -5,
      max: 5,
      step: 0.25,
      unit: "%",
    },
    { name: "fx", label: "FX Shock", min: -10, max: 10, step: 0.5, unit: "%" },
    {
      name: "commodityPrice",
      label: "Commodity Price Shock",
      min: -20,
      max: 20,
      step: 1,
      unit: "%",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5 text-accent" />
          Scenario Explorer
        </CardTitle>
        <CardDescription>Apply macro-level shocks.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {scenarios.map((scenario) => (
          <div key={scenario.name} className="space-y-3">
            <div className="flex justify-between items-center">
              <Label htmlFor={scenario.name}>{scenario.label}</Label>
              <span className="text-sm font-bold text-accent">
                {shocks[scenario.name as keyof typeof shocks] >= 0 && "+"}
                {shocks[scenario.name as keyof typeof shocks]}
                {scenario.unit}
              </span>
            </div>
            <Slider
              id={scenario.name}
              min={scenario.min}
              max={scenario.max}
              step={scenario.step}
              value={[shocks[scenario.name as keyof typeof shocks]]}
              onValueChange={(val) =>
                handleSliderChange(scenario.name as keyof typeof shocks, val)
              }
            />
          </div>
        ))}
        <Button
          className="w-full transition-all duration-200 hover:shadow-lg hover:shadow-accent/20"
          onClick={handleApplyShocks}
        >
          Apply Shocks
        </Button>
      </CardContent>
    </Card>
  );
}
