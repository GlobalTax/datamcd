
import React from 'react';
import { StandardLayout } from '@/components/layout/StandardLayout';
import { AnalysisSpecificDashboard } from '@/components/analysis/AnalysisSpecificDashboard';

const AnalysisPage = () => {
  return (
    <StandardLayout
      title="Análisis"
      description="Análisis financiero y de rendimiento"
    >
      <AnalysisSpecificDashboard />
    </StandardLayout>
  );
};

export default AnalysisPage;
