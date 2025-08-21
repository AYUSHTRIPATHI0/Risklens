/**
 * @fileOverview A service to fetch financial data for the RiskLens dashboard.
 * In a real application, this would fetch data from a live API endpoint.
 */

import { initialData, type AppData } from '@/lib/mock-data';

/**
 * Fetches the financial data for the dashboard.
 * This function simulates a network request.
 * @returns A promise that resolves to the AppData.
 */
export async function getFinancialData(): Promise<AppData> {
  // Simulate a network delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // In a real application, you would fetch this data from an API:
  // const response = await fetch('https://api.example.com/financial-data');
  // const data = await response.json();
  // return data;

  // For now, we return the mock data.
  return initialData;
}
