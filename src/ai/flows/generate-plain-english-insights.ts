'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating plain-English insights summarizing the factors influencing risk score changes.
 *
 * - generatePlainEnglishInsights - A function that generates plain-English insights.
 * - GeneratePlainEnglishInsightsInput - The input type for the generatePlainEnglishInsights function.
 * - GeneratePlainEnglishInsightsOutput - The return type for the generatePlainEnglishInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePlainEnglishInsightsInputSchema = z.object({
  riskScoreChange: z
    .number()
    .describe('The change in risk score, a number between -100 and 100.'),
  volatilityImpact: z
    .number()
    .describe(
      'The impact of volatility on the risk score, expressed as a percentage.'
    ),
  macroeconomicImpact: z
    .number()
    .describe(
      'The impact of macroeconomic factors on the risk score, expressed as a percentage.'
    ),
  sentimentImpact: z
    .number()
    .describe(
      'The impact of sentiment from financial news on the risk score, expressed as a percentage.'
    ),
  liquidityImpact: z
    .number()
    .describe(
      'The impact of liquidity on the risk score, expressed as a percentage.'
    ),
});
export type GeneratePlainEnglishInsightsInput = z.infer<
  typeof GeneratePlainEnglishInsightsInputSchema
>;

const GeneratePlainEnglishInsightsOutputSchema = z.object({
  insights: z
    .string()
    .describe(
      'A plain-English summary of the factors influencing the risk score change.'
    ),
});
export type GeneratePlainEnglishInsightsOutput = z.infer<
  typeof GeneratePlainEnglishInsightsOutputSchema
>;

export async function generatePlainEnglishInsights(
  input: GeneratePlainEnglishInsightsInput
): Promise<GeneratePlainEnglishInsightsOutput> {
  return generatePlainEnglishInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePlainEnglishInsightsPrompt',
  input: {schema: GeneratePlainEnglishInsightsInputSchema},
  output: {schema: GeneratePlainEnglishInsightsOutputSchema},
  prompt: `You are an expert financial analyst. Summarize the factors that are influencing risk score changes in a clear and concise plain-English narrative.

Risk Score Change: {{riskScoreChange}}
Volatility Impact: {{volatilityImpact}}%
Macroeconomic Impact: {{macroeconomicImpact}}%
Sentiment Impact: {{sentimentImpact}}%
Liquidity Impact: {{liquidityImpact}}%

Insights:`,
});

const generatePlainEnglishInsightsFlow = ai.defineFlow(
  {
    name: 'generatePlainEnglishInsightsFlow',
    inputSchema: GeneratePlainEnglishInsightsInputSchema,
    outputSchema: GeneratePlainEnglishInsightsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
