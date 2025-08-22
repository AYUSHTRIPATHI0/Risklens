'use server';

import {
  generatePlainEnglishInsights,
  GeneratePlainEnglishInsightsInput,
  GeneratePlainEnglishInsightsOutput,
} from '@/ai/flows/generate-plain-english-insights';

/**
 * Server Action to generate plain-English insights by calling the Genkit flow.
 * @param input - The input data for generating insights.
 * @returns The generated insights.
 */
export async function generatePlainEnglishInsightsAction(
  input: GeneratePlainEnglishInsightsInput
): Promise<GeneratePlainEnglishInsightsOutput> {
  // Call the server-side Genkit flow function
  const result = await generatePlainEnglishInsights(input);
  return result;
}