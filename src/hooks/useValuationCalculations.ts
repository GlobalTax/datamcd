
import { useMemo } from 'react';
import { ValuationInputs, YearlyData, ProjectionData } from '@/types/valuation';

export const useValuationCalculations = (
  inputs: ValuationInputs,
  yearlyData: YearlyData[]
) => {
  // Función para calcular MISCELL con crecimiento por inflación
  const calculateMiscellForYear = (yearIndex: number): number => {
    if (yearIndex === 0) {
      return yearlyData[0]?.miscell || 0;
    }
    
    const firstYearMiscell = yearlyData[0]?.miscell || 0;
    if (firstYearMiscell === 0) return 0;
    
    const inflationRate = inputs.inflationRate / 100;
    return firstYearMiscell * Math.pow(1 + inflationRate, yearIndex);
  };

  // Calcular proyecciones con la nueva fórmula de cashflow
  const projections = useMemo((): ProjectionData[] => {
    if (yearlyData.length === 0 || inputs.remainingYears === 0) {
      console.log('No yearly data or remaining years');
      return [];
    }
    
    console.log('Calculating projections with:', { yearlyData, inputs });
    
    const projections: ProjectionData[] = [];
    let currentTime = 0;
    
    for (let i = 0; i < yearlyData.length; i++) {
      const yearData = yearlyData[i];
      const timeToNextYear = Math.min(1, inputs.remainingYears - currentTime);
      
      if (timeToNextYear <= 0) break;
      
      // Usar las ventas manuales introducidas
      const salesValue = yearData.sales || 0;
      
      // Solo calcular si hay ventas para este año
      if (salesValue === 0) {
        currentTime += timeToNextYear;
        continue;
      }
      
      // Calcular montos basados en las nuevas fórmulas:
      const pacAmount = salesValue * (yearData.pacPercentage || 0) / 100;
      const rentAmount = salesValue * (yearData.rentPercentage || 0) / 100;
      const serviceFees = (yearData.serviceFees && yearData.serviceFees > 0)
        ? yearData.serviceFees
        : salesValue * 0.05;
      const miscellAmount = calculateMiscellForYear(i);
      
      // CASHFLOW = PAC - RENT - SERVICE FEES - RENT INDEX - MISCELL - LOAN PAYMENT
      const cashflow = pacAmount - rentAmount - serviceFees - yearData.rentIndex - miscellAmount - yearData.loanPayment;
      
      // CASH AFTER REINV = CASHFLOW - REINVERSION
      const cashAfterReinv = cashflow - yearData.reinversion;
      
      // CF LIBRE = CASH AFTER REINV + DEPRECIATION
      const cfLibre = cashAfterReinv + yearData.depreciation;
      
      let cfValue = cfLibre;
      if (timeToNextYear < 1) {
        cfValue = cfLibre * timeToNextYear;
      }
      
      const discountTime = currentTime + timeToNextYear;
      const presentValue = cfValue / Math.pow(1 + inputs.discountRate / 100, discountTime);
      
      console.log(`Year ${i+1} projection:`, {
        salesValue,
        pacAmount,
        rentAmount,
        serviceFees,
        miscellAmount,
        cashflow,
        cfLibre,
        cfValue,
        presentValue
      });
      
      projections.push({
        year: parseFloat((currentTime + timeToNextYear).toFixed(4)),
        cfValue,
        presentValue,
        timeToNextYear,
        yearData
      });
      
      currentTime += timeToNextYear;
    }
    
    console.log('Final projections:', projections);
    return projections;
  }, [yearlyData, inputs.remainingYears, inputs.inflationRate, inputs.discountRate]);

  const totalPrice = useMemo(() => {
    const total = projections.reduce((sum, p) => sum + p.presentValue, 0);
    console.log('Total price calculated:', total);
    return total;
  }, [projections]);

  return {
    projections,
    totalPrice,
    calculateMiscellForYear
  };
};
