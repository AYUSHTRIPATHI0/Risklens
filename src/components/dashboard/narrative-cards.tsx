
import * as React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NarrativeCard } from "@/lib/mock-data";
import { ScrollArea } from "@/components/ui/scroll-area";

interface NarrativeCardsProps {
  cards: NarrativeCard[];
}

const factorColors: Record<NarrativeCard['factor'], string> = {
    Liquidity: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    Market: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    Geopolitical: "bg-teal-500/20 text-teal-300 border-teal-500/30",
    Policy: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    Technology: "bg-sky-500/20 text-sky-300 border-sky-500/30",
    Finance: "bg-rose-500/20 text-rose-300 border-rose-500/30",
    Economic: "bg-green-500/20 text-green-300 border-green-500/30"
}

export function NarrativeCards({ cards }: NarrativeCardsProps) {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5 text-accent" />
          Narrative Evidence
        </CardTitle>
        <CardDescription>
          Qualitative factors influencing risk.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <ScrollArea className="h-[300px]">
          {cards && cards.length > 0 ? (
            <div className="space-y-4 pr-4">
              {cards.map((card, index) => (
                <React.Fragment key={card.id}>
                  <div className="space-y-2">
                    <div className="flex justify-between items-start gap-2">
                        <p className="font-medium leading-snug text-sm">{card.headline}</p>
                    </div>
                    <Badge variant="outline" className={cn("text-xs capitalize", factorColors[card.factor])}>{card.factor.replace(/_/g, " ")}</Badge>
                  </div>
                  {index < cards.length - 1 && <Separator className="my-4" />}
                </React.Fragment>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground text-sm text-center">No recent news or narrative evidence available.</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
