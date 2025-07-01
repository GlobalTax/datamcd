
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, Upload, Info } from 'lucide-react';
import { YearlyData, ImportMethod } from './types';
import { showSuccess, showError } from '@/utils/notifications';
import { conceptMapping, normalizeConceptName, isHeaderOrTotalLine } from './conceptMapping';
import { parseNumber } from './numberParser';
import { convertDetailedToStandard, createEmptyDetailedYearlyData } from './dataConverter';

interface SingleYearCopyPasteCardProps {
  onDataParsed: (data: YearlyData[], method: ImportMethod) => void;
}

export const SingleYearCopyPasteCard: React.FC<SingleYearCopyPasteCardProps> = ({ onDataParsed }) => {
  const [csvData, setCsvData] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const parseSingleYearData = () => {
    console.log('=== SINGLE YEAR PARSER DEBUG ===');
    console.log('Selected year:', selectedYear);
    console.log('CSV data length:', csvData.length);
    
    try {
      const lines = csvData.trim().split('\n').filter(line => line.trim());
      console.log('Number of lines:', lines.length);
      
      if (lines.length === 0) {
        throw new Error('No hay datos para procesar');
      }

      // Inicializar datos detallados para el año seleccionado
      const detailedData = createEmptyDetailedYearlyData(selectedYear);

      // Procesar cada línea
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Dividir por tabulaciones o espacios múltiples
        const parts = line.split(/\t+|\s{2,}/).filter(part => part.trim());
        if (parts.length < 2) continue;

        const rawConcept = parts[0].trim();
        const concept = normalizeConceptName(rawConcept);
        
        // Saltar líneas de totales y encabezados
        if (isHeaderOrTotalLine(concept)) {
          console.log(`Skipping header/total line: "${rawConcept}"`);
          continue;
        }
        
        const mappedField = conceptMapping[concept];
        
        console.log(`Line ${i}: "${rawConcept}" -> "${concept}" -> ${mappedField || 'UNMAPPED'}`);

        if (mappedField) {
          // Buscar el valor en las siguientes columnas (saltar porcentajes)
          let value = 0;
          for (let j = 1; j < parts.length; j++) {
            const rawValue = parts[j];
            if (!rawValue || rawValue.trim() === '' || rawValue.includes('%')) {
              continue;
            }
            
            value = parseNumber(rawValue);
            console.log(`  Value found: "${rawValue}" -> ${value}`);
            break;
          }
          
          if (mappedField !== 'year') {
            (detailedData as any)[mappedField] = value;
          }
        } else {
          console.log(`Concept not mapped: "${rawConcept}" -> "${concept}"`);
        }
      }

      // Convertir a formato estándar
      const standardData = convertDetailedToStandard(detailedData);
      
      console.log('Final parsed data for year', selectedYear, ':', {
        net_sales: standardData.net_sales,
        food_cost: standardData.food_cost,
        paper_cost: standardData.paper_cost,
        crew_labor: standardData.crew_labor
      });

      onDataParsed([standardData], 'detailed');
      showSuccess(`Datos del año ${selectedYear} procesados correctamente`);
      
    } catch (error) {
      console.error('Error parsing single year data:', error);
      showError('Error al procesar los datos: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  };

  return (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow border-green-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-green-600" />
          Carga por Año Individual
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-2 p-3 bg-green-50 rounded">
          <Info className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-green-700">
            <p className="font-medium">Método más confiable</p>
            <p>Procesa los datos de un año específico. Ideal para carga progresiva año por año.</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="year">Año de los datos</Label>
          <Input
            id="year"
            type="number"
            min="2000"
            max="2030"
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value) || new Date().getFullYear())}
            className="w-32"
          />
        </div>
        
        <Textarea
          value={csvData}
          onChange={(e) => setCsvData(e.target.value)}
          placeholder="Pega aquí los datos del P&L (una columna con conceptos y otra con valores)..."
          className="min-h-[150px] font-mono text-xs"
        />

        <div className="text-xs text-gray-500">
          <p><strong>Formato esperado:</strong></p>
          <div className="mt-1 p-2 bg-gray-50 rounded font-mono text-xs">
            Ventas Netas&nbsp;&nbsp;&nbsp;&nbsp;3.273.161,04<br/>
            Comida&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;834.777,71<br/>
            Papel&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;90.849,94
          </div>
        </div>

        <Button 
          onClick={parseSingleYearData}
          disabled={!csvData.trim()}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          <Upload className="w-4 h-4 mr-2" />
          Procesar Año {selectedYear}
        </Button>
      </CardContent>
    </Card>
  );
};
