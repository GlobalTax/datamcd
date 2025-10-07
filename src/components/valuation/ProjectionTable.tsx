import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ValuationInputs, YearlyData } from '@/types/valuation';
import { formatNumber, formatPercentage } from '@/utils/valuationUtils';
import { TableStyles } from './TableStyleEditor';

interface ProjectionTableProps {
  inputs: ValuationInputs;
  yearlyData: YearlyData[];
  onYearlyDataChange: (yearIndex: number, field: keyof YearlyData, value: number) => void;
  tableStyles?: TableStyles;
}

const ProjectionTable = ({ inputs, yearlyData, onYearlyDataChange, tableStyles }: ProjectionTableProps) => {
  const yearsCount = Math.ceil(inputs.remainingYears);

  if (yearsCount === 0) return null;

  // Función para generar las fechas de cada período
  const generatePeriodDates = (yearIndex: number) => {
    const baseYear = 2025;
    const startYear = baseYear + yearIndex;
    const endYear = startYear + 1;
    
    const startDate = `16-jun-${startYear.toString().slice(-2)}`;
    const endDate = `15-jun-${endYear.toString().slice(-2)}`;
    
    return `${startDate} / ${endDate}`;
  };

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

  // Función para manejar cambios en inputs con formato
  const handleInputChange = (yearIndex: number, field: keyof YearlyData, value: string) => {
    // Remover puntos y convertir a número
    const numericValue = parseFloat(value.replace(/\./g, '')) || 0;
    onYearlyDataChange(yearIndex, field, numericValue);
  };

  // Función para manejar cambios en porcentajes con soporte para comas
  const handlePercentageChange = (yearIndex: number, field: 'pacPercentage' | 'rentPercentage', value: string) => {
    // Reemplazar coma por punto para parseFloat
    const normalizedValue = value.replace(',', '.');
    const numericValue = parseFloat(normalizedValue) || 0;
    onYearlyDataChange(yearIndex, field as keyof YearlyData, numericValue);
  };

  // Función para formatear el valor del porcentaje para mostrar
  const formatPercentageValue = (value: number): string => {
    if (value === 0) return '';
    return value.toString().replace('.', ',');
  };

  // Apply custom styles to table elements
  const getTableStyle = () => ({
    fontFamily: tableStyles?.fontFamily || 'Inter, system-ui, sans-serif',
    fontSize: tableStyles?.fontSize || '14px',
    color: tableStyles?.cellTextColor || '#374151'
  });

  const getHeaderStyle = () => ({
    backgroundColor: tableStyles?.headerBg || '#1f2937',
    color: tableStyles?.headerTextColor || '#ffffff',
    borderColor: tableStyles?.borderColor || '#d1d5db'
  });

  const getCellStyle = () => ({
    backgroundColor: tableStyles?.cellBg || '#ffffff',
    color: tableStyles?.cellTextColor || '#374151',
    borderColor: tableStyles?.borderColor || '#d1d5db'
  });

  const getEditableCellStyle = () => ({
    backgroundColor: tableStyles?.editableCellBg || '#dbeafe',
    borderColor: tableStyles?.borderColor || '#d1d5db'
  });

  return (
    <Card className="bg-white border border-gray-200" style={getTableStyle()}>
      <CardHeader className="bg-white">
        <CardTitle className="text-gray-900" style={{ fontFamily: tableStyles?.fontFamily }}>
          Proyección Manual por Años ({inputs.remainingYears.toFixed(4)} años exactos)
        </CardTitle>
        <p className="text-sm text-gray-600 mt-2" style={{ fontFamily: tableStyles?.fontFamily }}>
          Introduce manualmente las ventas y MISCELL para cada año. MISCELL del primer año crecerá automáticamente con inflación del {inputs.inflationRate}% para los años siguientes.
        </p>
      </CardHeader>
      <CardContent className="bg-white">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse" style={getTableStyle()}>
            <thead>
              <tr>
                <th className="border p-2 text-left font-bold" style={getHeaderStyle()}>
                  Concepto
                </th>
                {Array.from({ length: yearsCount }, (_, i) => (
                  <React.Fragment key={i}>
                    <th className="border p-2 text-center font-bold" style={getHeaderStyle()}>
                      <div>{2025 + i}</div>
                      <div className="text-xs font-normal mt-1">
                        {generatePeriodDates(i)}
                      </div>
                      {i === yearsCount - 1 && inputs.remainingYears % 1 !== 0 && (
                        <div className="text-xs opacity-75 mt-1">
                          ({((inputs.remainingYears % 1) * 12).toFixed(1)} meses)
                        </div>
                      )}
                    </th>
                    <th className="border p-2 text-center font-bold w-20" style={getCellStyle()}>
                      %
                    </th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody style={getTableStyle()}>
              {/* SALES row - Manual input for ALL years */}
              <tr>
                <td className="border p-2 font-semibold" style={getHeaderStyle()}>
                  SALES (€)
                </td>
                {Array.from({ length: yearsCount }, (_, i) => {
                  const salesValue = yearlyData[i]?.sales || 0;
                  
                  return (
                    <React.Fragment key={`sales-${i}`}>
                      <td className="border p-1" style={getEditableCellStyle()}>
                        <Input
                          type="text"
                          value={salesValue > 0 ? formatNumber(salesValue) : ''}
                          onChange={(e) => handleInputChange(i, 'sales', e.target.value)}
                          placeholder="0"
                          className="w-full text-right text-sm border-0 p-1 placeholder:text-gray-400"
                          style={{ 
                            backgroundColor: 'transparent',
                            fontFamily: tableStyles?.fontFamily,
                            fontSize: tableStyles?.fontSize
                          }}
                        />
                      </td>
                      <td className="border p-2 text-right text-xs" style={getCellStyle()}>
                        {salesValue > 0 ? formatPercentage(100) : <span className="text-gray-300">100%</span>}
                      </td>
                    </React.Fragment>
                  );
                })}
              </tr>
              
              {/* P.A.C. row - Manual percentage, calculated amount */}
              <tr>
                <td className="border p-2 font-semibold" style={getHeaderStyle()}>
                  P.A.C. (€)
                </td>
                {Array.from({ length: yearsCount }, (_, i) => {
                  const salesValue = yearlyData[i]?.sales || 0;
                  const pacPercentage = yearlyData[i]?.pacPercentage || 0;
                  const pacAmount = salesValue * pacPercentage / 100;
                  
                  return (
                    <React.Fragment key={`pac-${i}`}>
                      <td className="border p-2 text-right" style={getCellStyle()}>
                        {pacAmount > 0 ? formatNumber(pacAmount) + ' €' : <span className="text-gray-300">0 €</span>}
                      </td>
                      <td className="border p-1" style={getEditableCellStyle()}>
                        <Input
                          type="text"
                          value={formatPercentageValue(pacPercentage)}
                          onChange={(e) => handlePercentageChange(i, 'pacPercentage', e.target.value)}
                          placeholder="0"
                          className="w-full text-right text-sm border-0 p-1 placeholder:text-gray-400"
                          style={{ 
                            backgroundColor: 'transparent',
                            fontFamily: tableStyles?.fontFamily,
                            fontSize: tableStyles?.fontSize
                          }}
                        />
                      </td>
                    </React.Fragment>
                  );
                })}
              </tr>
              
              {/* RENT row - Manual percentage, calculated amount */}
              <tr>
                <td className="border p-2 bg-gray-800 text-white font-semibold font-manrope" style={getHeaderStyle()}>
                  RENT (€)
                </td>
                {Array.from({ length: yearsCount }, (_, i) => {
                  const salesValue = yearlyData[i]?.sales || 0;
                  const rentPercentage = yearlyData[i]?.rentPercentage || 0;
                  const rentAmount = salesValue * rentPercentage / 100;
                  
                  return (
                    <React.Fragment key={`rent-${i}`}>
                      <td className="border p-2 text-right" style={getCellStyle()}>
                        {rentAmount > 0 ? formatNumber(rentAmount) + ' €' : <span className="text-gray-300">0 €</span>}
                      </td>
                      <td className="border p-1" style={getEditableCellStyle()}>
                        <Input
                          type="text"
                          value={formatPercentageValue(rentPercentage)}
                          onChange={(e) => handlePercentageChange(i, 'rentPercentage', e.target.value)}
                          placeholder="0"
                          className="w-full text-right text-sm border-0 p-1 placeholder:text-gray-400"
                          style={{ 
                            backgroundColor: 'transparent',
                            fontFamily: tableStyles?.fontFamily,
                            fontSize: tableStyles?.fontSize
                          }}
                        />
                      </td>
                    </React.Fragment>
                  );
                })}
              </tr>
              
              {/* SERVICE FEES row - Uses provided value or 5% default */}
              <tr>
                <td className="border p-2 bg-gray-800 text-white font-semibold font-manrope" style={getHeaderStyle()}>
                  SERVICE FEES (€)
                </td>
                {Array.from({ length: yearsCount }, (_, i) => {
                  const salesValue = yearlyData[i]?.sales || 0;
                  const serviceFees = (yearlyData[i]?.serviceFees && yearlyData[i]!.serviceFees > 0)
                    ? yearlyData[i]!.serviceFees
                    : salesValue * 0.05;
                  
                  return (
                    <React.Fragment key={`serviceFees-${i}`}>
                      <td className="border p-2 text-right" style={getCellStyle()}>
                        {serviceFees > 0 ? formatNumber(serviceFees) + ' €' : <span className="text-gray-300">0 €</span>}
                      </td>
                      <td className="border p-2 text-right text-xs" style={getCellStyle()}>
                        {salesValue > 0 ? formatPercentage((serviceFees / salesValue) * 100) : <span className="text-gray-300">0%</span>}
                      </td>
                    </React.Fragment>
                  );
                })}
              </tr>
              
              {/* DEPRECIATION row - Manual input in euros */}
              <tr>
                <td className="border p-2 bg-gray-800 text-white font-semibold font-manrope" style={getHeaderStyle()}>
                  DEPRECIATION (€)
                </td>
                {Array.from({ length: yearsCount }, (_, i) => {
                  const salesValue = yearlyData[i]?.sales || 0;
                  const depreciation = yearlyData[i]?.depreciation || 0;
                  
                  return (
                    <React.Fragment key={`depreciation-${i}`}>
                      <td className="border p-1" style={getEditableCellStyle()}>
                        <Input
                          type="text"
                          value={depreciation > 0 ? formatNumber(depreciation) : ''}
                          onChange={(e) => handleInputChange(i, 'depreciation', e.target.value)}
                          placeholder="0"
                          className="w-full text-right text-sm border-0 p-1 placeholder:text-gray-400"
                          style={{ 
                            backgroundColor: 'transparent',
                            fontFamily: tableStyles?.fontFamily,
                            fontSize: tableStyles?.fontSize
                          }}
                        />
                      </td>
                      <td className="border p-2 text-right text-xs" style={getCellStyle()}>
                        {depreciation > 0 && salesValue > 0 ? 
                          formatPercentage((depreciation / salesValue) * 100) : 
                          <span className="text-gray-300">0%</span>
                        }
                      </td>
                    </React.Fragment>
                  );
                })}
              </tr>
              
              {/* INTEREST row - Manual input in euros */}
              <tr>
                <td className="border p-2 bg-gray-800 text-white font-semibold font-manrope" style={getHeaderStyle()}>
                  INTEREST (€)
                </td>
                {Array.from({ length: yearsCount }, (_, i) => {
                  const salesValue = yearlyData[i]?.sales || 0;
                  const interest = yearlyData[i]?.interest || 0;
                  
                  return (
                    <React.Fragment key={`interest-${i}`}>
                      <td className="border p-1" style={getEditableCellStyle()}>
                        <Input
                          type="text"
                          value={interest > 0 ? formatNumber(interest) : ''}
                          onChange={(e) => handleInputChange(i, 'interest', e.target.value)}
                          placeholder="0"
                          className="w-full text-right text-sm border-0 p-1 placeholder:text-gray-400"
                          style={{ 
                            backgroundColor: 'transparent',
                            fontFamily: tableStyles?.fontFamily,
                            fontSize: tableStyles?.fontSize
                          }}
                        />
                      </td>
                      <td className="border p-2 text-right text-xs" style={getCellStyle()}>
                        {interest > 0 && salesValue > 0 ? 
                          formatPercentage((interest / salesValue) * 100) : 
                          <span className="text-gray-300">0%</span>
                        }
                      </td>
                    </React.Fragment>
                  );
                })}
              </tr>
              
              {/* RENT INDEX row - Manual input in euros */}
              <tr>
                <td className="border p-2 bg-gray-800 text-white font-semibold font-manrope" style={getHeaderStyle()}>
                  RENT INDEX (€)
                </td>
                {Array.from({ length: yearsCount }, (_, i) => {
                  const salesValue = yearlyData[i]?.sales || 0;
                  const rentIndex = yearlyData[i]?.rentIndex || 0;
                  
                  return (
                    <React.Fragment key={`rentIndex-${i}`}>
                      <td className="border p-1" style={getEditableCellStyle()}>
                        <Input
                          type="text"
                          value={rentIndex > 0 ? formatNumber(rentIndex) : ''}
                          onChange={(e) => handleInputChange(i, 'rentIndex', e.target.value)}
                          placeholder="0"
                          className="w-full text-right text-sm border-0 p-1 placeholder:text-gray-400"
                          style={{ 
                            backgroundColor: 'transparent',
                            fontFamily: tableStyles?.fontFamily,
                            fontSize: tableStyles?.fontSize
                          }}
                        />
                      </td>
                      <td className="border p-2 text-right text-xs" style={getCellStyle()}>
                        {rentIndex > 0 && salesValue > 0 ? 
                          formatPercentage((rentIndex / salesValue) * 100) : 
                          <span className="text-gray-300">0%</span>
                        }
                      </td>
                    </React.Fragment>
                  );
                })}
              </tr>
              
              {/* MISCELL row - Manual input for first year, auto-calculated with inflation for rest */}
              <tr>
                <td className="border p-2 bg-gray-800 text-white font-semibold font-manrope" style={getHeaderStyle()}>
                  MISCELL (€)
                </td>
                {Array.from({ length: yearsCount }, (_, i) => {
                  const salesValue = yearlyData[i]?.sales || 0;
                  const miscell = calculateMiscellForYear(i);
                  const isFirstYear = i === 0;
                  
                  return (
                    <React.Fragment key={`miscell-${i}`}>
                      <td className={`border p-1 ${isFirstYear ? 'bg-blue-50' : 'bg-gray-50'}`}>
                        {isFirstYear ? (
                          <Input
                            type="text"
                            value={yearlyData[0]?.miscell > 0 ? formatNumber(yearlyData[0].miscell) : ''}
                            onChange={(e) => handleInputChange(i, 'miscell', e.target.value)}
                            placeholder="0"
                            className="w-full text-right text-sm border-0 p-1 placeholder:text-gray-400"
                            style={{ 
                              backgroundColor: 'transparent',
                              fontFamily: tableStyles?.fontFamily,
                              fontSize: tableStyles?.fontSize
                            }}
                          />
                        ) : (
                          <div className="w-full text-right text-sm p-1 font-manrope text-gray-700">
                            {miscell > 0 ? formatNumber(miscell) + ' €' : <span className="text-gray-400">0 €</span>}
                          </div>
                        )}
                      </td>
                      <td className="border p-2 text-right text-xs" style={getCellStyle()}>
                        {miscell > 0 && salesValue > 0 ? 
                          formatPercentage((miscell / salesValue) * 100) : 
                          <span className="text-gray-300">0%</span>
                        }
                      </td>
                    </React.Fragment>
                  );
                })}
              </tr>
              
              {/* TOTAL NON-CONTROLLABLES row - Calculated */}
              <tr>
                <td className="border p-2 bg-gray-800 text-white font-semibold font-manrope" style={getHeaderStyle()}>
                  TOTAL NON-CONTROLLABLES
                </td>
                {Array.from({ length: yearsCount }, (_, i) => {
                  const salesValue = yearlyData[i]?.sales || 0;
                  const rentPercentage = yearlyData[i]?.rentPercentage || 0;
                  const rentAmount = salesValue * rentPercentage / 100;
                  const serviceFees = (yearlyData[i]?.serviceFees && yearlyData[i]!.serviceFees > 0)
                    ? yearlyData[i]!.serviceFees
                    : salesValue * 0.05;
                  const depreciation = yearlyData[i]?.depreciation || 0;
                  const interest = yearlyData[i]?.interest || 0;
                  const rentIndex = yearlyData[i]?.rentIndex || 0;
                  const miscell = calculateMiscellForYear(i);
                  const totalNonControllables = rentAmount + serviceFees + depreciation + interest + rentIndex + miscell;
                  
                  return (
                    <React.Fragment key={`totalNonControllables-${i}`}>
                      <td className="border p-2 text-right font-bold" style={getCellStyle()}>
                        {totalNonControllables > 0 ? formatNumber(totalNonControllables) + ' €' : <span className="text-gray-300">0 €</span>}
                      </td>
                      <td className="border p-2 text-right text-xs" style={getCellStyle()}>
                        {totalNonControllables > 0 && salesValue > 0 ? 
                          formatPercentage((totalNonControllables / salesValue) * 100) : 
                          <span className="text-gray-300">0%</span>
                        }
                      </td>
                    </React.Fragment>
                  );
                })}
              </tr>
              
              {/* S.O.I. row - Calculated */}
              <tr>
                <td className="border p-2 font-semibold bg-gray-800 text-white font-manrope" style={getHeaderStyle()}>
                  S.O.I.
                </td>
                {Array.from({ length: yearsCount }, (_, i) => {
                  const salesValue = yearlyData[i]?.sales || 0;
                  const pacPercentage = yearlyData[i]?.pacPercentage || 0;
                  const pacAmount = salesValue * pacPercentage / 100;
                  const rentPercentage = yearlyData[i]?.rentPercentage || 0;
                  const rentAmount = salesValue * rentPercentage / 100;
                  const serviceFees = (yearlyData[i]?.serviceFees && yearlyData[i]!.serviceFees > 0)
                    ? yearlyData[i]!.serviceFees
                    : salesValue * 0.05;
                  const depreciation = yearlyData[i]?.depreciation || 0;
                  const interest = yearlyData[i]?.interest || 0;
                  const rentIndex = yearlyData[i]?.rentIndex || 0;
                  const miscell = calculateMiscellForYear(i);
                  const totalNonControllables = rentAmount + serviceFees + depreciation + interest + rentIndex + miscell;
                  const soi = pacAmount - totalNonControllables;
                  
                  return (
                    <React.Fragment key={`soi-${i}`}>
                      <td className="border p-2 text-right font-bold" style={getCellStyle()}>
                        {salesValue > 0 ? formatNumber(soi) + ' €' : <span className="text-gray-300">0 €</span>}
                      </td>
                      <td className="border p-2 text-right text-xs" style={getCellStyle()}>
                        {salesValue > 0 ? 
                          formatPercentage((soi / salesValue) * 100) : 
                          <span className="text-gray-300">0%</span>
                        }
                      </td>
                    </React.Fragment>
                  );
                })}
              </tr>
              
              {/* LOAN PAYMENT row - Manual input in euros */}
              <tr>
                <td className="border p-2 bg-gray-800 text-white font-semibold font-manrope" style={getHeaderStyle()}>
                  LOAN PAYMENT (€)
                </td>
                {Array.from({ length: yearsCount }, (_, i) => {
                  const salesValue = yearlyData[i]?.sales || 0;
                  const loanPayment = yearlyData[i]?.loanPayment || 0;
                  
                  return (
                    <React.Fragment key={`loanPayment-${i}`}>
                      <td className="border p-1" style={getEditableCellStyle()}>
                        <Input
                          type="text"
                          value={loanPayment > 0 ? formatNumber(loanPayment) : ''}
                          onChange={(e) => handleInputChange(i, 'loanPayment', e.target.value)}
                          placeholder="0"
                          className="w-full text-right text-sm border-0 p-1 placeholder:text-gray-400"
                          style={{ 
                            backgroundColor: 'transparent',
                            fontFamily: tableStyles?.fontFamily,
                            fontSize: tableStyles?.fontSize
                          }}
                        />
                      </td>
                      <td className="border p-2 text-right text-xs" style={getCellStyle()}>
                        {loanPayment > 0 && salesValue > 0 ? 
                          formatPercentage((loanPayment / salesValue) * 100) : 
                          <span className="text-gray-300">0%</span>
                        }
                      </td>
                    </React.Fragment>
                  );
                })}
              </tr>
              
              {/* REMODELACION / REINVERSION row - Manual input in euros */}
              <tr>
                <td className="border p-2 bg-gray-800 text-white font-semibold font-manrope" style={getHeaderStyle()}>
                  REMODELACION / REINVERSION (€)
                </td>
                {Array.from({ length: yearsCount }, (_, i) => {
                  const salesValue = yearlyData[i]?.sales || 0;
                  const reinversion = yearlyData[i]?.reinversion || 0;
                  
                  return (
                    <React.Fragment key={`reinversion-${i}`}>
                      <td className="border p-1" style={getEditableCellStyle()}>
                        <Input
                          type="text"
                          value={reinversion > 0 ? formatNumber(reinversion) : ''}
                          onChange={(e) => handleInputChange(i, 'reinversion', e.target.value)}
                          placeholder="0"
                          className="w-full text-right text-sm border-0 p-1 placeholder:text-gray-400"
                          style={{ 
                            backgroundColor: 'transparent',
                            fontFamily: tableStyles?.fontFamily,
                            fontSize: tableStyles?.fontSize
                          }}
                        />
                      </td>
                      <td className="border p-2 text-right text-xs" style={getCellStyle()}>
                        {reinversion > 0 && salesValue > 0 ? 
                          formatPercentage((reinversion / salesValue) * 100) : 
                          <span className="text-gray-300">0%</span>
                        }
                      </td>
                    </React.Fragment>
                  );
                })}
              </tr>
              
              {/* CASHFLOW row - Calculated */}
              <tr className="bg-white font-bold">
                <td className="border border-gray-300 p-2 bg-gray-800 text-white font-bold font-manrope" style={getHeaderStyle()}>
                  CASHFLOW
                </td>
                {Array.from({ length: yearsCount }, (_, i) => {
                  const salesValue = yearlyData[i]?.sales || 0;
                  const pacPercentage = yearlyData[i]?.pacPercentage || 0;
                  const pacAmount = salesValue * pacPercentage / 100;
                  const rentPercentage = yearlyData[i]?.rentPercentage || 0;
                  const rentAmount = salesValue * rentPercentage / 100;
                  const serviceFees = (yearlyData[i]?.serviceFees && yearlyData[i]!.serviceFees > 0)
                    ? yearlyData[i]!.serviceFees
                    : salesValue * 0.05;
                  const rentIndex = yearlyData[i]?.rentIndex || 0;
                  const miscell = calculateMiscellForYear(i);
                  const loanPayment = yearlyData[i]?.loanPayment || 0;
                  const cashflow = pacAmount - rentAmount - serviceFees - rentIndex - miscell - loanPayment;
                  
                  return (
                    <React.Fragment key={`cashflow-${i}`}>
                      <td className="border border-gray-300 p-2 text-right font-bold" style={getCellStyle()}>
                        {salesValue > 0 ? formatNumber(cashflow) + ' €' : <span className="text-gray-300">0 €</span>}
                      </td>
                      <td className="border border-gray-300 p-2 text-right text-xs" style={getCellStyle()}>
                        {salesValue > 0 ? 
                          formatPercentage((cashflow / salesValue) * 100) : 
                          <span className="text-gray-300">0%</span>
                        }
                      </td>
                    </React.Fragment>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectionTable;
