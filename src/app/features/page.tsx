
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/icons/logo";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, BarChart, Newspaper, SlidersHorizontal, AlertTriangle, Cpu, Gauge } from "lucide-react";

interface FeatureCardProps {
    icon: React.ElementType;
    title: string;
    description: string;
    api: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, description, api }) => (
    <Card className="hover:border-accent/80 hover:shadow-lg hover:shadow-accent/10 transition-all duration-200">
        <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
            <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
                <Icon className="h-6 w-6 text-accent" />
            </div>
            <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground mb-4">{description}</p>
            <div className="flex items-center gap-2 text-sm">
                <Cpu className="h-4 w-4 text-primary" />
                <span className="font-semibold">API Used:</span>
                <span className="text-muted-foreground">{api}</span>
            </div>
        </CardContent>
    </Card>
);

export default function FeaturesPage() {
    const router = useRouter();

    const features: FeatureCardProps[] = [
        {
            icon: Gauge,
            title: "Dynamic Risk Index & Heatmap",
            description: "Displays a real-time risk index (0–100) and a color-coded heatmap showing risk score changes across companies. The risk score is calculated based on stock price volatility.",
            api: "Alpha Vantage - TIME_SERIES_DAILY",
        },
        {
            icon: BarChart,
            title: "Driver Breakdown",
            description: "A radial chart that breaks down the risk index into its core drivers: market volatility, macroeconomic conditions, and news sentiment.",
            api: "Alpha Vantage (Time Series & Federal Funds Rate) & News API",
        },
        {
            icon: AlertTriangle,
            title: "Smart Alerts",
            description: "An intelligent alert system that highlights significant score changes (>8 points) and identifies the primary trigger (e.g., Volatility).",
            api: "Alpha Vantage - TIME_SERIES_DAILY (Client-side Calculation)",
        },
        {
            icon: Newspaper,
            title: "Narrative Evidence Cards",
            description: "Evidence cards displaying the latest headlines from financial news sources, providing qualitative context for risk fluctuations.",
            api: "News API - /v2/everything",
        },
        {
            icon: SlidersHorizontal,
            title: "Scenario Explorer",
            description: "Lets users apply hypothetical macroeconomic shocks (e.g., interest rate changes) to see how the risk index might react across different companies on a separate results page.",
            api: "Client-side Simulation (uses Alpha Vantage data as a baseline)",
        },
    ];

    return (
        <div className="flex min-h-screen w-full flex-col bg-background font-body">
            <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur md:px-6">
                <div className="flex items-center gap-2">
                    <Logo />
                    <h1 className="text-lg md:text-xl font-semibold text-foreground">RiskLens - Application Features</h1>
                </div>
                <div className="ml-auto">
                    <Button variant="outline" onClick={() => router.push('/')}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Dashboard
                    </Button>
                </div>
            </header>
            <main className="flex-1 p-4 md:p-6 lg:p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold tracking-tight">How RiskLens Works</h2>
                        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                            RiskLens leverages real-time data from multiple financial APIs to provide a comprehensive and dynamic view of market risk. Here’s a breakdown of each component.
                        </p>
                    </div>
                    <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                        {features.map((feature) => (
                            <FeatureCard key={feature.title} {...feature} />
                        ))}
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
