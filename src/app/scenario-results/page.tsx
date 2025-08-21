import React, { Suspense } from 'react';
import ScenarioResultsClient from './scenario-results-client';

export default function ScenarioResultsPage() {
  return (
    <Suspense fallback={<div>Loading scenario results...</div>}>
      <ScenarioResultsClient />
    </Suspense>
  );
}