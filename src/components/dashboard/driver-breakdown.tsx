
"use client";

import * as React from "react";
import { Pie, PieChart, Cell } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import type { DriverBreakdownData } from "@/lib/mock-data";

interface DriverBreakdownProps {
  data: DriverBreakdownData[];
}

const chartConfig = {
  value: {
    label: "Value",
  },
  Volatility: {
    label: "Volatility",
  },
  Macroeconomic: {
    label: "Macroeconomic",
  },
  Sentiment: {
    label: "Sentiment",
  },
  Liquidity: {
    label: "Liquidity",
  },
};

export function DriverBreakdown({ data }: DriverBreakdownProps) {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle>Driver Breakdown</CardTitle>
        <CardDescription>
          Impact of each factor on the risk index.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px] sm:max-h-[300px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              strokeWidth={5}
            >
              {data.map((entry) => (
                <Cell key={`cell-${entry.name}`} fill={entry.fill} />
              ))}
            </Pie>
            <ChartLegend
              content={<ChartLegendContent nameKey="name" />}
              className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
