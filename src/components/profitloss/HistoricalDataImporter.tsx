import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Upload, FileSpreadsheet, Download, Save, Plus, Trash2, File } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useProfitLossData } from '@/hooks/useProfitLossData';
import { ProfitLossFormData } from '@/types/profitLoss';
import { toast } from 'sonner';

interface YearlyData {
  year: number;
  net_sales: number;
  other_revenue: number;
  food_cost: number;
  food_employees: number;
  waste: number;
  paper_cost: number;
  crew_labor: number;
  management_labor: number;
  social_security: number;
  travel_expenses: number;
  advertising: number;
  promotion: number;
  external_services: number;
  uniforms: number;
  operation_supplies: number;
  maintenance: number;
  utilities: number;
  office_expenses: number;
  cash_differences: number;
  other_controllable: number;
  pac: number;
  rent: number;
  additional_rent: number;
  royalty: number;
  office_legal: number;
  insurance: number;
  taxes_licenses: number;
  depreciation: number;
  interest: number;
  other_non_controllable: number;
  non_product_sales: number;
  non_product_cost: number;
  draw_salary: number;
  general_expenses: number;
  loan_payment: number;
  investment_own_funds: number;
}

interface HistoricalDataImporterProps {
  restaurantId: string;
  onClose: () => void;
}

export const HistoricalDataImporter: React.FC<HistoricalDataImporterProps> = ({
  restaurantId,
  onClose
}) => {
  const { createProfitLossData } = useProfitLossData();
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState<'upload' | 'review' | 'import'>('upload');
  const [importMethod, setImportMethod] = useState<'manual' | 'csv' | 'file'>('manual');
  
  const [yearlyDataList, setYearlyDataList] = useState<YearlyData[]>([
    {
      year: new Date().getFullYear() - 1,
      net_sales: 0,
      other_revenue: 0,
      food_cost: 0,
      food_employees: 0,
      waste: 0,
      paper_cost: 0,
      crew_labor: 0,
      management_labor: 0,
      social_security: 0,
      travel_expenses: 0,
      advertising: 0,
      promotion: 0,
      external_services: 0,
      uniforms: 0,
      operation_supplies: 0,
      maintenance: 0,
      utilities: 0,
      office_expenses: 0,
      cash_differences: 0,
      other_controllable: 0,
      pac: 0,
      rent: 0,
      additional_rent: 0,
      royalty: 0,
      office_legal: 0,
      insurance: 0,
      taxes_licenses: 0,
      depreciation: 0,
      interest: 0,
      other_non_controllable: 0,
      non_product_sales: 0,
      non_product_cost: 0,
      draw_salary: 0,
      general_expenses: 0,
      loan_payment: 0,
      investment_own_funds: 0
    }
  ]);

  const [csvData, setCsvData] = useState('');

  const addNewYear = () => {
    const newYear = {
      year: new Date().getFullYear() - yearlyDataList.length,
      net_sales: 0,
      other_revenue: 0,
      food_cost: 0,
      food_employees: 0,
      waste: 0,
      paper_cost: 0,
      crew_labor: 0,
      management_labor: 0,
      social_security: 0,
      travel_expenses: 0,
      advertising: 0,
      promotion: 0,
      external_services: 0,
      uniforms: 0,
      operation_supplies: 0,
      maintenance: 0,
      utilities: 0,
      office_expenses: 0,
      cash_differences: 0,
      other_controllable: 0,
      pac: 0,
      rent: 0,
      additional_rent: 0,
      royalty: 0,
      office_legal: 0,
      insurance: 0,
      taxes_licenses: 0,
      depreciation: 0,
      interest: 0,
      other_non_controllable: 0,
      non_product_sales: 0,
      non_product_cost: 0,
      draw_salary: 0,
      general_expenses: 0,
      loan_payment: 0,
      investment_own_funds: 0
    };
    setYearlyDataList([...yearlyDataList, newYear]);
  };

  const removeYear = (index: number) => {
    if (yearlyDataList.length > 1) {
      const newList = yearlyDataList.filter((_, i) => i !== index);
      setYearlyDataList(newList);
    }
  };

  const updateYearlyData = (index: number, field: keyof YearlyData, value: number | string) => {
    const newList = [...yearlyDataList];
    newList[index] = {
      ...newList[index],
      [field]: typeof value === 'string' ? parseFloat(value) || 0 : value
    };
    setYearlyDataList(newList);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      
      // Detectar el separador automáticamente
      let separator = '\t';
      if (text.includes(',') && !text.includes('\t')) {
        separator = ',';
      } else if (text.includes(';')) {
        separator = ';';
      }

      try {
        parseDataFromText(text, separator);
        setImportMethod('file');
        toast.success(`Archivo cargado correctamente. Detectado separador: "${separator}"`);
      } catch (error) {
        console.error('Error reading file:', error);
        toast.error('Error al leer el archivo. Verifica el formato.');
      }
    };

    if (file.type.includes('text') || file.name.endsWith('.csv') || file.name.endsWith('.txt')) {
      reader.readAsText(file);
    } else {
      toast.error('Por favor, sube un archivo .csv, .txt o copia los datos directamente.');
    }
  };

  const parseDataFromText = (text: string, separator: string = '\t') => {
    try {
      const lines = text.trim().split('\n');
      const data: YearlyData[] = [];

      // Saltar la primera línea si parece ser headers
      const startIndex = lines[0]?.toLowerCase().includes('año') || lines[0]?.toLowerCase().includes('year') ? 1 : 0;

      for (let i = startIndex; i < lines.length; i++) {
        const values = lines[i].split(separator);
        if (values.length >= 2) {
          const yearData: YearlyData = {
            year: parseInt(values[0]?.replace(/[^\d]/g, '')) || new Date().getFullYear(),
            net_sales: parseFloat(values[1]?.replace(/[^\d.-]/g, '')) || 0,
            other_revenue: parseFloat(values[2]?.replace(/[^\d.-]/g, '')) || 0,
            food_cost: parseFloat(values[3]?.replace(/[^\d.-]/g, '')) || 0,
            food_employees: parseFloat(values[4]?.replace(/[^\d.-]/g, '')) || 0,
            waste: parseFloat(values[5]?.replace(/[^\d.-]/g, '')) || 0,
            paper_cost: parseFloat(values[6]?.replace(/[^\d.-]/g, '')) || 0,
            crew_labor: parseFloat(values[7]?.replace(/[^\d.-]/g, '')) || 0,
            management_labor: parseFloat(values[8]?.replace(/[^\d.-]/g, '')) || 0,
            social_security: parseFloat(values[9]?.replace(/[^\d.-]/g, '')) || 0,
            travel_expenses: parseFloat(values[10]?.replace(/[^\d.-]/g, '')) || 0,
            advertising: parseFloat(values[11]?.replace(/[^\d.-]/g, '')) || 0,
            promotion: parseFloat(values[12]?.replace(/[^\d.-]/g, '')) || 0,
            external_services: parseFloat(values[13]?.replace(/[^\d.-]/g, '')) || 0,
            uniforms: parseFloat(values[14]?.replace(/[^\d.-]/g, '')) || 0,
            operation_supplies: parseFloat(values[15]?.replace(/[^\d.-]/g, '')) || 0,
            maintenance: parseFloat(values[16]?.replace(/[^\d.-]/g, '')) || 0,
            utilities: parseFloat(values[17]?.replace(/[^\d.-]/g, '')) || 0,
            office_expenses: parseFloat(values[18]?.replace(/[^\d.-]/g, '')) || 0,
            cash_differences: parseFloat(values[19]?.replace(/[^\d.-]/g, '')) || 0,
            other_controllable: parseFloat(values[20]?.replace(/[^\d.-]/g, '')) || 0,
            pac: parseFloat(values[21]?.replace(/[^\d.-]/g, '')) || 0,
            rent: parseFloat(values[22]?.replace(/[^\d.-]/g, '')) || 0,
            additional_rent: parseFloat(values[23]?.replace(/[^\d.-]/g, '')) || 0,
            royalty: parseFloat(values[24]?.replace(/[^\d.-]/g, '')) || 0,
            office_legal: parseFloat(values[25]?.replace(/[^\d.-]/g, '')) || 0,
            insurance: parseFloat(values[26]?.replace(/[^\d.-]/g, '')) || 0,
            taxes_licenses: parseFloat(values[27]?.replace(/[^\d.-]/g, '')) || 0,
            depreciation: parseFloat(values[28]?.replace(/[^\d.-]/g, '')) || 0,
            interest: parseFloat(values[29]?.replace(/[^\d.-]/g, '')) || 0,
            other_non_controllable: parseFloat(values[30]?.replace(/[^\d.-]/g, '')) || 0,
            non_product_sales: parseFloat(values[31]?.replace(/[^\d.-]/g, '')) || 0,
            non_product_cost: parseFloat(values[32]?.replace(/[^\d.-]/g, '')) || 0,
            draw_salary: parseFloat(values[33]?.replace(/[^\d.-]/g, '')) || 0,
            general_expenses: parseFloat(values[34]?.replace(/[^\d.-]/g, '')) || 0,
            loan_payment: parseFloat(values[35]?.replace(/[^\d.-]/g, '')) || 0,
            investment_own_funds: parseFloat(values[36]?.replace(/[^\d.-]/g, '')) || 0
          };
          data.push(yearData);
        }
      }

      if (data.length > 0) {
        setYearlyDataList(data);
        setCurrentStep('review');
        toast.success(`Se cargaron ${data.length} años de datos`);
      } else {
        toast.error('No se pudieron procesar los datos. Verifica el formato.');
      }
    } catch (error) {
      console.error('Error parsing data:', error);
      toast.error('Error al procesar los datos');
    }
  };

  const parseCSVData = () => {
    parseDataFromText(csvData);
  };

  const convertToMonthlyData = (yearData: YearlyData): ProfitLossFormData[] => {
    const monthlyDataList: ProfitLossFormData[] = [];
    
    for (let month = 1; month <= 12; month++) {
      const monthlyData: ProfitLossFormData = {
        restaurant_id: restaurantId,
        year: yearData.year,
        month: month,
        net_sales: yearData.net_sales / 12,
        other_revenue: yearData.other_revenue / 12,
        food_cost: (yearData.food_cost + yearData.food_employees + yearData.waste) / 12,
        paper_cost: yearData.paper_cost / 12,
        management_labor: yearData.management_labor / 12,
        crew_labor: yearData.crew_labor / 12,
        benefits: yearData.social_security / 12,
        rent: yearData.rent / 12,
        utilities: yearData.utilities / 12,
        maintenance: yearData.maintenance / 12,
        advertising: (yearData.advertising + yearData.promotion) / 12,
        insurance: yearData.insurance / 12,
        supplies: yearData.operation_supplies / 12,
        other_expenses: (yearData.travel_expenses + yearData.external_services + 
                        yearData.uniforms + yearData.office_expenses + 
                        yearData.cash_differences + yearData.other_controllable + 
                        yearData.office_legal + yearData.taxes_licenses + 
                        yearData.other_non_controllable + yearData.general_expenses) / 12,
        franchise_fee: yearData.royalty / 12,
        advertising_fee: yearData.pac / 12,
        rent_percentage: yearData.additional_rent / 12,
        notes: `Datos históricos del año ${yearData.year} (mes ${month})`
      };
      monthlyDataList.push(monthlyData);
    }
    
    return monthlyDataList;
  };

  const importData = async () => {
    setImporting(true);
    setProgress(0);

    try {
      const totalMonths = yearlyDataList.length * 12;
      let processedMonths = 0;

      for (const yearData of yearlyDataList) {
        const monthlyData = convertToMonthlyData(yearData);
        
        for (const monthData of monthlyData) {
          await createProfitLossData.mutateAsync(monthData);
          processedMonths++;
          setProgress((processedMonths / totalMonths) * 100);
        }
      }

      toast.success(`Se importaron ${yearlyDataList.length} años de datos históricos exitosamente`);
      onClose();
    } catch (error) {
      console.error('Error importing data:', error);
      toast.error('Error al importar los datos');
    } finally {
      setImporting(false);
      setProgress(0);
    }
  };

  const downloadTemplate = () => {
    const headers = [
      'Año', 'Ventas_Netas', 'Otros_Ingresos', 'Costo_Comida', 'Comida_Empleados', 
      'Desperdicios', 'Papel', 'Mano_Obra', 'Gerencia', 'Seguridad_Social', 
      'Gastos_Viaje', 'Publicidad', 'Promoción', 'Servicios_Exteriores', 
      'Uniformes', 'Suministros', 'Mantenimiento', 'Servicios_Publicos', 
      'Gastos_Oficina', 'Diferencias_Caja', 'Otros_Controlables', 'PAC', 
      'Renta', 'Renta_Adicional', 'Royalty', 'Oficina_Legal', 'Seguros', 
      'Tasas_Licencias', 'Depreciaciones', 'Intereses', 'Otros_No_Controlables',
      'Ventas_No_Producto', 'Costo_No_Producto', 'Draw_Salary', 'Gastos_Generales',
      'Pago_Prestamo', 'Inversiones_Propias'
    ];

    const csvContent = headers.join('\t') + '\n';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plantilla_datos_historicos.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (currentStep === 'upload') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">Importar Datos Históricos P&L</h2>
          <p className="text-gray-600">
            Elige el método de importación que prefieras
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Subir archivo */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <File className="w-5 h-5" />
                Subir Archivo Excel/CSV
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Sube un archivo .csv, .txt o Excel guardado como CSV
              </p>
              
              <div className="space-y-3">
                <Input
                  type="file"
                  accept=".csv,.txt,.tsv"
                  onChange={handleFileUpload}
                  className="w-full"
                />
                
                <div className="text-xs text-gray-500">
                  <p><strong>Formatos soportados:</strong></p>
                  <ul className="list-disc list-inside mt-1">
                    <li>CSV con comas (,)</li>
                    <li>CSV con tabulaciones (TSV)</li>
                    <li>CSV con punto y coma (;)</li>
                    <li>Archivos de texto separados</li>
                  </ul>
                </div>
              </div>

              <Button 
                variant="outline" 
                onClick={downloadTemplate}
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                Descargar Plantilla
              </Button>
            </CardContent>
          </Card>

          {/* Copiar y pegar */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5" />
                Copiar desde Excel
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Copia datos directamente desde Excel y pégalos aquí
              </p>
              
              <Textarea
                value={csvData}
                onChange={(e) => setCsvData(e.target.value)}
                placeholder="Pega aquí los datos copiados desde Excel..."
                className="min-h-[120px] font-mono text-xs"
              />

              <div className="text-xs text-gray-500">
                <p><strong>Cómo copiar desde Excel:</strong></p>
                <ol className="list-decimal list-inside mt-1">
                  <li>Selecciona los datos en Excel</li>
                  <li>Ctrl+C para copiar</li>
                  <li>Pega aquí (Ctrl+V)</li>
                </ol>
              </div>

              <Button 
                onClick={parseCSVData}
                disabled={!csvData.trim()}
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                Procesar Datos
              </Button>
            </CardContent>
          </Card>

          {/* Carga manual */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Carga Manual
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Introduce los datos año por año usando formularios
              </p>
              
              <div className="py-8 text-center">
                <Plus className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-sm text-gray-500">
                  Formularios interactivos para cada año
                </p>
              </div>

              <Button 
                onClick={() => {
                  setImportMethod('manual');
                  setCurrentStep('review');
                }}
                className="w-full"
              >
                Comenzar Carga Manual
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">💡 Recomendaciones:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• <strong>Archivo Excel/CSV:</strong> El método más rápido si ya tienes los datos organizados</li>
            <li>• <strong>Copiar desde Excel:</strong> Perfecto para datos pequeños o verificaciones rápidas</li>
            <li>• <strong>Carga Manual:</strong> Ideal para pocos años o cuando necesitas más control</li>
          </ul>
        </div>
      </div>
    );
  }

  if (currentStep === 'review') {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">Revisar Datos Históricos</h2>
            <p className="text-gray-600">
              Verifica y ajusta los datos antes de importar ({importMethod === 'file' ? 'Archivo' : importMethod === 'csv' ? 'Excel Copiado' : 'Manual'})
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={addNewYear}>
              <Plus className="w-4 h-4 mr-2" />
              Agregar Año
            </Button>
          </div>
        </div>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {yearlyDataList.map((yearData, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Año {yearData.year}</CardTitle>
                  {yearlyDataList.length > 1 && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => removeYear(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label>Año</Label>
                    <Input
                      type="number"
                      value={yearData.year}
                      onChange={(e) => updateYearlyData(index, 'year', parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label>Ventas Netas (€)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={yearData.net_sales}
                      onChange={(e) => updateYearlyData(index, 'net_sales', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Costo Comida (€)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={yearData.food_cost}
                      onChange={(e) => updateYearlyData(index, 'food_cost', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Papel (€)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={yearData.paper_cost}
                      onChange={(e) => updateYearlyData(index, 'paper_cost', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Mano de Obra (€)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={yearData.crew_labor}
                      onChange={(e) => updateYearlyData(index, 'crew_labor', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Gerencia (€)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={yearData.management_labor}
                      onChange={(e) => updateYearlyData(index, 'management_labor', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Publicidad (€)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={yearData.advertising}
                      onChange={(e) => updateYearlyData(index, 'advertising', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Renta (€)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={yearData.rent}
                      onChange={(e) => updateYearlyData(index, 'rent', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-gray-50 rounded">
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Total Costo Comida:</span>
                      <span className="font-semibold">
                        €{(yearData.food_cost + yearData.food_employees + yearData.waste).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>% sobre Ventas:</span>
                      <span className="font-semibold">
                        {yearData.net_sales > 0 ? (((yearData.food_cost + yearData.food_employees + yearData.waste) / yearData.net_sales) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setCurrentStep('upload')}>
            Volver
          </Button>
          <Button 
            onClick={() => setCurrentStep('import')}
            disabled={yearlyDataList.length === 0}
          >
            Continuar a Importación
          </Button>
        </div>
      </div>
    );
  }

  if (currentStep === 'import') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">Confirmar Importación</h2>
          <p className="text-gray-600">
            Se van a importar {yearlyDataList.length} años de datos ({yearlyDataList.length * 12} registros mensuales)
          </p>
        </div>

        <div className="space-y-4">
          {yearlyDataList.map((yearData, index) => (
            <div key={index} className="flex items-center justify-between p-4 border rounded">
              <div>
                <div className="font-semibold">Año {yearData.year}</div>
                <div className="text-sm text-gray-600">
                  Ventas: €{yearData.net_sales.toLocaleString()} | 
                  Costos: €{(yearData.food_cost + yearData.paper_cost).toLocaleString()}
                </div>
              </div>
              <Badge variant="outline">12 meses</Badge>
            </div>
          ))}
        </div>

        {importing && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Importando datos...</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setCurrentStep('review')}>
            Volver a Revisar
          </Button>
          <Button 
            onClick={importData}
            disabled={importing}
          >
            <Save className="w-4 h-4 mr-2" />
            {importing ? 'Importando...' : 'Importar Datos'}
          </Button>
        </div>
      </div>
    );
  }

  return null;
};
