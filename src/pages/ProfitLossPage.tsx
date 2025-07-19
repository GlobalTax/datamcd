
import React from 'react';
import { useParams } from 'react-router-dom';
import { StandardLayout } from '@/components/layout/StandardLayout';
import { FinancialStatementTabs } from '@/components/profitloss/FinancialStatementTabs';

const ProfitLossPage = () => {
  const { siteNumber } = useParams();
  
  if (!siteNumber) {
    return (
      <StandardLayout
        title="Estados Financieros"
        description="Análisis completo de rentabilidad"
      >
        <div className="flex items-center justify-center h-64">
          <p className="text-red-600">No se especificó el número de restaurante</p>
        </div>
      </StandardLayout>
    );
  }

  return (
    <StandardLayout
      title="Estados Financieros"
      description={`Análisis completo - Restaurante #${siteNumber}`}
    >
      <FinancialStatementTabs restaurantId={siteNumber} />
    </StandardLayout>
  );
};

export default ProfitLossPage;
