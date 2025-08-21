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
  if (!cards || cards.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-accent" />
            Narrative Evidence
          </CardTitle>
          <CardDescription>
            Qualitative factors influencing risk.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">No recent news or narrative evidence available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5 text-accent" />
          Narrative Evidence
        </CardTitle>
        <CardDescription>
          Qualitative factors influencing risk.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {cards.map((card, index) => (
            <React.Fragment key={card.id}>
              <div className="space-y-2">
                <div className="flex justify-between items-start gap-2">
                    <p className="font-medium leading-snug">{card.headline}</p>
                </div>
                <Badge variant="outline" className={cn("text-xs capitalize", factorColors[card.factor])}>{card.factor.replace(/_/g, " ")}</Badge>
              </div>
              {index < cards.length - 1 && <Separator className="my-4" />}
            </React.Fragment>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
