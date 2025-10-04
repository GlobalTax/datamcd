
import React, { useState } from 'react';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { FileUploadCard } from './historical/FileUploadCard';
import { CopyPasteCard } from './historical/CopyPasteCard';
import { DetailedCopyPasteCard } from './historical/DetailedCopyPasteCard';
import { SingleYearCopyPasteCard } from './historical/SingleYearCopyPasteCard';
import { ManualEntryCard } from './historical/ManualEntryCard';
import { DataReviewSection } from './historical/DataReviewSection';
import { ImportConfirmationSection } from './historical/ImportConfirmationSection';
import { createEmptyYearlyData } from './historical/utils';
import { useHistoricalPL } from '@/hooks/useHistoricalPL';
import type { YearlyData, ImportStep, ImportMethod } from '@/types/domains/financial';

interface HistoricalDataImporterProps {
  restaurantId: string;
  onClose: () => void;
}

export const HistoricalDataImporter: React.FC<HistoricalDataImporterProps> = ({
  restaurantId,
  onClose
}) => {
  const [step, setStep] = useState<ImportStep>('upload');
  const [method, setMethod] = useState<ImportMethod>('file');
  const [yearlyDataList, setYearlyDataList] = useState<YearlyData[]>([]);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleDataParsed = (data: YearlyData[], importMethod: ImportMethod) => {
    logger.info('Data processed for import', { 
      component: 'HistoricalDataImporter',
      action: 'handleDataParsed',
      dataCount: data.length,
      importMethod
    });
    
    // Si ya tenemos datos, combinar con los nuevos (evitar duplicados por año)
    const existingYears = yearlyDataList.map(item => item.year);
    const newData = data.filter(item => !existingYears.includes(item.year));
    
    if (newData.length === 0) {
      toast.error(`Los datos del año ${data[0]?.year} ya están cargados`);
      return;
    }
    
    const combinedData = [...yearlyDataList, ...newData].sort((a, b) => b.year - a.year);
    setYearlyDataList(combinedData);
    setMethod(importMethod);
    setStep('review');
    
    const methodLabel = importMethod === 'detailed' ? 'detallados' : 'estándar';
    toast.success(`${newData.length} años de datos ${methodLabel} añadidos. Total: ${combinedData.length} años`);
  };

  const handleManualEntry = () => {
    const emptyData = createEmptyYearlyData(new Date().getFullYear());
    setYearlyDataList([emptyData]);
    setMethod('manual');
    setStep('review');
  };

  const handleUpdateYearlyData = (index: number, field: keyof YearlyData, value: number | string) => {
    setYearlyDataList(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: typeof value === 'string' ? parseFloat(value) || 0 : value } : item
    ));
  };

  const handleAddYear = () => {
    const currentYear = new Date().getFullYear();
    const existingYears = yearlyDataList.map(data => data.year);
    let newYear = currentYear;
    
    // Encontrar el próximo año disponible
    while (existingYears.includes(newYear)) {
      newYear++;
    }
    
    const newYearData = createEmptyYearlyData(newYear);
    setYearlyDataList(prev => [...prev, newYearData]);
  };

  const handleRemoveYear = (index: number) => {
    setYearlyDataList(prev => prev.filter((_, i) => i !== index));
  };

  const { importData } = useHistoricalPL(restaurantId);

  const handleImportData = async () => {
    setImporting(true);
    setStep('import');
    setProgress(0);
    
    try {
      // Progreso inicial
      for (let i = 0; i <= 50; i += 10) {
        setProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Importar datos reales
      await importData(yearlyDataList);
      
      // Progreso final
      for (let i = 60; i <= 100; i += 10) {
        setProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      toast.success(`${yearlyDataList.length} años importados correctamente`);
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Error al importar los datos');
      setImporting(false);
      setStep('review');
    }
  };

  const handleBack = () => {
    if (step === 'review') {
      setStep('upload');
      setYearlyDataList([]);
    } else if (step === 'import') {
      setStep('review');
      setImporting(false);
      setProgress(0);
    }
  };

  if (step === 'upload') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">Importar Datos Históricos P&L</h2>
          <p className="text-gray-600">
            Selecciona el método para cargar los datos históricos del restaurante {restaurantId}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-5 gap-6">
          <SingleYearCopyPasteCard onDataParsed={(data) => handleDataParsed(data, 'detailed')} />
          <DetailedCopyPasteCard onDataParsed={(data) => handleDataParsed(data, 'detailed')} />
          <FileUploadCard onDataParsed={(data) => handleDataParsed(data, 'file')} />
          <CopyPasteCard onDataParsed={(data) => handleDataParsed(data, 'csv')} />
          <ManualEntryCard onManualEntry={handleManualEntry} />
        </div>

        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded">
          <h3 className="font-medium text-green-800 mb-2">💡 Recomendación - Nuevo Método</h3>
          <p className="text-sm text-green-700">
            Usa la opción <strong>"Carga por Año Individual"</strong> para procesar tus datos año por año. 
            Es el método más confiable y te permite construir tu base de datos histórica progresivamente.
          </p>
        </div>

        {yearlyDataList.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
            <h3 className="font-medium text-blue-800 mb-2">📊 Datos Cargados</h3>
            <p className="text-sm text-blue-700">
              Tienes {yearlyDataList.length} años cargados: {yearlyDataList.map(d => d.year).join(', ')}
            </p>
            <div className="mt-2 flex gap-2">
              <button 
                onClick={() => setStep('review')}
                className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
              >
                Revisar Datos
              </button>
              <button 
                onClick={() => setYearlyDataList([])}
                className="text-sm bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700"
              >
                Limpiar Todo
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (step === 'review') {
    return (
      <DataReviewSection 
        yearlyDataList={yearlyDataList}
        importMethod={method}
        onUpdateYearlyData={handleUpdateYearlyData}
        onAddYear={handleAddYear}
        onRemoveYear={handleRemoveYear}
        onBack={handleBack}
        onContinue={() => setStep('import')}
      />
    );
  }

  if (step === 'import') {
    return (
      <ImportConfirmationSection
        yearlyDataList={yearlyDataList}
        importing={importing}
        progress={progress}
        onBack={handleBack}
        onImport={handleImportData}
      />
    );
  }

  return null;
};
