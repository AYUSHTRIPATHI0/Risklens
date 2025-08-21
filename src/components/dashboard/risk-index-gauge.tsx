"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface RiskIndexGaugeProps {
  value: number;
}

export function RiskIndexGauge({ value }: RiskIndexGaugeProps) {
  const [prevValue, setPrevValue] = React.useState(value);
  const [trend, setTrend] = React.useState<"up" | "down" | "neutral">("neutral");

  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (value > prevValue) {
        setTrend("up");
      } else if (value < prevValue) {
        setTrend("down");
      } else {
        setTrend("neutral");
      }
      setPrevValue(value);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [value, prevValue]);

  const getRiskColor = (score: number) => {
    if (score >= 70) return "text-destructive";
    if (score >= 40) return "text-orange-400";
    return "text-accent";
  };
  
  const getRiskBgColor = (score: number) => {
    if (score >= 70) return "hsl(var(--destructive))";
    if (score >= 40) return "hsl(48 96% 53%)";
    return "hsl(var(--accent))";
  };

  const TrendIcon =
    trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;

  return (
    <div className="relative flex flex-col items-center justify-center gap-4">
      <div
        className="relative h-48 w-48"
        style={
          {
            "--value": value,
            "--risk-color": getRiskBgColor(value),
          } as React.CSSProperties
        }
      >
        <svg
          className="h-full w-full -rotate-90"
          viewBox="0 0 120 120"
        >
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth="12"
            strokeDasharray="254.469"
            strokeDashoffset="0"
          />
          <circle
            className="transition-all duration-1000 ease-out"
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="var(--risk-color)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray="254.469"
            strokeDashoffset={254.469 - (254.469 * value) / 100}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn("text-5xl font-bold tracking-tighter", getRiskColor(value))}>
                {value}
            </span>
            <p className="text-sm text-muted-foreground font-medium">OVERALL RISK INDEX</p>
        </div>
      </div>
      <div className="flex items-center gap-2 text-muted-foreground">
        <TrendIcon className={cn("h-5 w-5", { "text-destructive": trend === 'up', "text-accent": trend === 'down' })} />
        <p className="text-sm font-medium">
          {trend === 'up' && 'Risk is trending up'}
          {trend === 'down' && 'Risk is trending down'}
          {trend === 'neutral' && 'Risk is stable'}
        </p>
      </div>
    </div>
  );
}
