import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Activity,
  Newspaper,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SmartAlert } from "@/lib/mock-data";

interface SmartAlertsProps {
  alerts: SmartAlert[];
}

const triggerIcons = {
  Volatility: Activity,
  Sentiment: Newspaper,
  Macroeconomic: Globe,
};

export function SmartAlerts({ alerts }: SmartAlertsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-accent" />
          Smart Alerts
        </CardTitle>
        <CardDescription>
          Significant risk score changes &gt;8 points.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {alerts.map((alert) => {
            const isUp = alert.change > 0;
            const TriggerIcon = triggerIcons[alert.trigger];
            return (
              <div key={alert.id} className="flex items-start gap-4">
                <div className="mt-1">
                  {isUp ? (
                    <TrendingUp className="h-5 w-5 text-destructive" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-accent" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{alert.company}</p>
                  <p
                    className={cn(
                      "text-sm font-bold",
                      isUp ? "text-destructive" : "text-accent"
                    )}
                  >
                    {isUp ? "+" : ""}
                    {alert.change} pts
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <TriggerIcon className="h-3 w-3" />
                    <span>{alert.trigger} Trigger</span>
                    <span>&middot;</span>
                    <span>{alert.timestamp}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
