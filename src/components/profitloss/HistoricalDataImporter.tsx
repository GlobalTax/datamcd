
import React, { useState } from 'react';
import { toast } from 'sonner';
import { FileUploadCard } from './historical/FileUploadCard';
import { CopyPasteCard } from './historical/CopyPasteCard';
import { ManualEntryCard } from './historical/ManualEntryCard';
import { DataReviewSection } from './historical/DataReviewSection';
import { ImportConfirmationSection } from './historical/ImportConfirmationSection';
import { YearlyData, ImportStep, ImportMethod } from './historical/types';
import { createEmptyYearlyData } from './historical/utils';

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
    console.log('Datos procesados:', data);
    setYearlyDataList(data);
    setMethod(importMethod);
    setStep('review');
    toast.success(`${data.length} años de datos procesados correctamente`);
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

  const handleImportData = async () => {
    setImporting(true);
    setStep('import');
    
    try {
      // Simular progreso de importación
      for (let i = 0; i <= 100; i += 10) {
        setProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      toast.success(`${yearlyDataList.length} años importados correctamente`);
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <FileUploadCard onDataParsed={(data) => handleDataParsed(data, 'file')} />
          <CopyPasteCard onDataParsed={(data) => handleDataParsed(data, 'csv')} />
          <ManualEntryCard onManualEntry={handleManualEntry} />
        </div>
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
