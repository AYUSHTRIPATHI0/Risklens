import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { HeatmapData } from "@/lib/mock-data";

interface RiskHeatmapProps {
  data: HeatmapData[];
}

const getRiskColorClass = (score: number): string => {
  if (score > 75) return "bg-destructive/60 hover:bg-destructive/80 text-destructive-foreground";
  if (score > 60) return "bg-orange-600/60 hover:bg-orange-600/80 text-orange-100";
  if (score > 40) return "bg-yellow-500/60 hover:bg-yellow-500/80 text-yellow-900";
  return "bg-accent/60 hover:bg-accent/80 text-accent-foreground";
};

const getChange = (history: {score: number}[], days: number): number => {
    if (history.length < days + 1) return 0;
    const current = history[history.length - 1].score;
    const past = history[history.length - 1 - days].score;
    return current - past;
}

export function RiskHeatmap({ data }: RiskHeatmapProps) {
  const timeframes = [1, 7, 30, 90];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Risk Heatmap</CardTitle>
        <CardDescription>
          Score changes across companies over the last 90 days.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead className="text-right">Current Score</TableHead>
                {timeframes.map((t) => (
                  <TableHead key={t} className="text-right">{t}D Change</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => {
                const currentScore = item.history[item.history.length - 1].score;
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-muted-foreground">{item.sector}</div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge className={cn("font-bold text-base", getRiskColorClass(currentScore))}>
                        {currentScore}
                      </Badge>
                    </TableCell>
                    {timeframes.map((t) => {
                        const change = getChange(item.history, t);
                        return (
                            <TableCell key={t} className="text-right font-medium">
                                <span className={cn({"text-destructive": change > 0, "text-accent": change < 0})}>
                                    {change > 0 && '+'}{change}
                                </span>
                            </TableCell>
                        )
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
