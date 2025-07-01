
import React from 'react';
import AnnualBudgetGrid from '@/components/budget/AnnualBudgetGrid';

export default function AnnualBudgetPage() {
  return (
    <div className="container mx-auto p-6">
      <AnnualBudgetGrid year={2024} restaurantId="default" />
    </div>
  );
}
