"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  generatePlainEnglishInsights,
  type GeneratePlainEnglishInsightsInput,
} from "@/ai/flows/generate-plain-english-insights";

interface PlainEnglishInsightsProps {
  riskData: {
    riskScoreChange: number;
    volatilityImpact: number;
    macroeconomicImpact: number;
    sentimentImpact: number;
    liquidityImpact: number;
  };
}

export function PlainEnglishInsights({ riskData }: PlainEnglishInsightsProps) {
  const [insights, setInsights] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setInsights("");
    try {
      const result = await generatePlainEnglishInsights(
        riskData as GeneratePlainEnglishInsightsInput
      );
      setInsights(result.insights);
    } catch (e) {
      setError("Failed to generate insights. Please try again.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-accent" />
          Plain-English Insights
        </CardTitle>
        <CardDescription>
          AI-generated summary of what's driving the risk.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {insights && (
          <div className="prose prose-invert prose-sm max-w-none rounded-md border bg-muted/30 p-4 text-foreground">
            <p>{insights}</p>
          </div>
        )}

        <Button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full transition-all duration-200 hover:shadow-lg hover:shadow-accent/20"
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          {loading ? "Generating..." : "Generate Insights"}
        </Button>
      </CardContent>
    </Card>
  );
}
