
import React from 'react';
import { StandardLayout } from '@/components/layout/StandardLayout';
import { AnalysisDashboard } from '@/components/analysis/AnalysisDashboard';

const HistoricalDataPage = () => {
  return (
    <StandardLayout
      title="Datos Históricos"
      description="Gestión y análisis de datos históricos financieros"
    >
      <AnalysisDashboard />
    </StandardLayout>
  );
};

export default HistoricalDataPage;
