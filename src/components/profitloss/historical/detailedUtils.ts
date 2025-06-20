
import { YearlyData, DetailedYearlyData } from './types';
import { toast } from 'sonner';

// Mapeo completo de conceptos del P&L detallado a campos del sistema
const conceptMapping: { [key: string]: keyof DetailedYearlyData } = {
  // Ingresos
  'ventas netas': 'ventas_netas',
  'valor de la produccion': 'valor_produccion',
  'valor de la producción': 'valor_produccion',
  
  // Costos de Comida
  'comida': 'comida',
  'comida empleados': 'comida_empleados',
  'desperdicios': 'desperdicios',
  'papel': 'papel',
  
  // Mano de Obra
  'mano de obra': 'mano_obra',
  'mano de obra de gerencia': 'mano_obra_gerencia',
  'seguridad social': 'seguridad_social',
  'gastos viajes': 'gastos_viajes',
  
  // Gastos Controlables
  'publicidad': 'publicidad',
  'promoción': 'promocion',
  'promocion': 'promocion',
  'servicios exteriores': 'servicios_exteriores',
  'uniformes': 'uniformes',
  'suministros operación': 'suministros_operacion',
  'suministros operacion': 'suministros_operacion',
  'reparación y mantenimiento': 'reparacion_mantenimiento',
  'reparacion y mantenimiento': 'reparacion_mantenimiento',
  'luz, agua, teléfono': 'luz_agua_telefono',
  'luz, agua, telefono': 'luz_agua_telefono',
  'gastos oficina': 'gastos_oficina',
  'diferencias caja': 'diferencias_caja',
  'varios controlables': 'varios_controlables',
  
  // Gastos No Controlables
  'p.a.c.': 'pac',
  'pac': 'pac',
  'renta': 'renta',
  'renta adicional': 'renta_adicional',
  'royalty': 'royalty',
  'oficina / legal': 'oficina_legal',
  'oficina legal': 'oficina_legal',
  'seguros': 'seguros',
  'tasas y licencias': 'tasas_licencias',
  'depreciaciones / amortizaciones': 'depreciaciones_amortizaciones',
  'depreciaciones amortizaciones': 'depreciaciones_amortizaciones',
  'interéses': 'intereses',
  'intereses': 'intereses',
  'pérdidas venta equipos': 'perdidas_venta_equipos',
  'perdidas venta equipos': 'perdidas_venta_equipos',
  'varios': 'varios_no_controlables',
  
  // Otros conceptos
  'ventas no producto': 'ventas_no_producto',
  'costo no producto': 'costo_no_producto',
  's.o.i.': 'varios_no_controlables', // Mapear a varios no controlables por ahora
  'soi': 'varios_no_controlables',
  'draw salary': 'draw_salary',
  'gastos generales': 'gastos_generales',
  'cuota del prestamo (interes + principal)': 'cuota_prestamo',
  'cuota del prestamo': 'cuota_prestamo',
  'gastos de intereses': 'intereses',
  'inversiones con fondos propios': 'inversiones_fondos_propios'
};

const parseNumber = (value: string): number => {
  if (!value || value.trim() === '') return 0;
  
  // Remover espacios y limpiar el valor
  let cleanValue = value.trim();
  
  // Si tiene formato europeo (ejemplo: 3.273.161,04)
  if (cleanValue.includes(',') && cleanValue.split(',').length === 2) {
    // Separar parte entera y decimal
    const parts = cleanValue.split(',');
    const integerPart = parts[0].replace(/\./g, ''); // Remover puntos de miles
    const decimalPart = parts[1];
    cleanValue = integerPart + '.' + decimalPart;
  } else {
    // Solo remover puntos si no hay coma (números enteros con miles)
    cleanValue = cleanValue.replace(/\./g, '');
  }
  
  // Remover caracteres no numéricos excepto punto decimal y signo negativo
  cleanValue = cleanValue.replace(/[^\d.-]/g, '');
  
  const parsed = parseFloat(cleanValue);
  return isNaN(parsed) ? 0 : parsed;
};

const extractYearsFromHeader = (headerLine: string): number[] => {
  console.log('=== EXTRACTING YEARS FROM HEADER ===');
  console.log('Header line:', headerLine);
  
  const years: number[] = [];
  
  // Buscar específicamente "Ejerc. YYYY" o similar
  const exerciseMatches = headerLine.match(/ejerc\.?\s*(\d{4})/gi);
  
  console.log('Exercise matches found:', exerciseMatches);
  
  if (exerciseMatches) {
    exerciseMatches.forEach(match => {
      const yearMatch = match.match(/(\d{4})/);
      if (yearMatch) {
        const year = parseInt(yearMatch[1]);
        if (year >= 2000 && year <= 2050 && !years.includes(year)) {
          years.push(year);
        }
      }
    });
  }
  
  // Si no encuentra con "Ejerc.", buscar años directamente
  if (years.length === 0) {
    const directYearMatches = headerLine.match(/\b(20\d{2})\b/g);
    if (directYearMatches) {
      directYearMatches.forEach(yearStr => {
        const year = parseInt(yearStr);
        if (!years.includes(year)) {
          years.push(year);
        }
      });
    }
  }
  
  const sortedYears = years.sort((a, b) => b - a);
  console.log('Final sorted years:', sortedYears);
  return sortedYears;
};

const normalizeConceptName = (concept: string): string => {
  return concept
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s\(\)\.\,]/g, '');
};

const isHeaderOrTotalLine = (concept: string): boolean => {
  const normalizedConcept = normalizeConceptName(concept);
  const skipPatterns = [
    'total coste comida y papel',
    'resultado bruto de explotacion',
    'resultado bruto de explotación',
    'total gastos controlables',
    'total gastos no controlables',
    'neto no producto',
    'resultado neto',
    'cash flow',
    'cash flow del socio'
  ];
  
  return skipPatterns.some(pattern => normalizedConcept.includes(pattern));
};

export const parseDetailedDataFromText = (text: string): YearlyData[] => {
  console.log('=== PARSE DETAILED DATA DEBUG ===');
  console.log('Input text length:', text.length);
  
  try {
    const lines = text.trim().split('\n').filter(line => line.trim());
    console.log('Number of lines:', lines.length);
    
    if (lines.length < 2) {
      throw new Error('Los datos deben tener al menos una línea de encabezado y una línea de datos');
    }

    // Extraer años del encabezado
    const headerLine = lines[0];
    const years = extractYearsFromHeader(headerLine);
    
    console.log('Detected years:', years);
    
    if (years.length === 0) {
      throw new Error('No se encontraron años válidos en el encabezado. Asegúrate de que el encabezado contenga años como "Ejerc. 2023"');
    }

    // Inicializar datos para cada año
    const yearlyDataMap: { [year: number]: DetailedYearlyData } = {};
    years.forEach(year => {
      yearlyDataMap[year] = {
        year,
        ventas_netas: 0,
        valor_produccion: 0,
        comida: 0,
        comida_empleados: 0,
        desperdicios: 0,
        papel: 0,
        mano_obra: 0,
        mano_obra_gerencia: 0,
        seguridad_social: 0,
        gastos_viajes: 0,
        publicidad: 0,
        promocion: 0,
        servicios_exteriores: 0,
        uniformes: 0,
        suministros_operacion: 0,
        reparacion_mantenimiento: 0,
        luz_agua_telefono: 0,
        gastos_oficina: 0,
        diferencias_caja: 0,
        varios_controlables: 0,
        pac: 0,
        renta: 0,
        renta_adicional: 0,
        royalty: 0,
        oficina_legal: 0,
        seguros: 0,
        tasas_licencias: 0,
        depreciaciones_amortizaciones: 0,
        intereses: 0,
        perdidas_venta_equipos: 0,
        varios_no_controlables: 0,
        ventas_no_producto: 0,
        costo_no_producto: 0,
        draw_salary: 0,
        gastos_generales: 0,
        cuota_prestamo: 0,
        inversiones_fondos_propios: 0
      };
    });

    // Procesar cada línea de datos
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const parts = line.split('\t');
      if (parts.length < 2) continue; // Al menos concepto + 1 valor

      const concept = normalizeConceptName(parts[0]);
      
      // Saltar líneas de totales y encabezados
      if (isHeaderOrTotalLine(concept)) {
        console.log(`Skipping header/total line: "${concept}"`);
        continue;
      }
      
      const mappedField = conceptMapping[concept];

      console.log(`Line ${i}: "${concept}" -> ${mappedField || 'UNMAPPED'}`);
      console.log(`Parts: [${parts.slice(0, Math.min(parts.length, 6)).join(', ')}...]`);

      if (mappedField) {
        // Procesar valores para cada año
        let yearIndex = 0;
        for (let colIndex = 1; colIndex < parts.length && yearIndex < years.length; colIndex++) {
          const year = years[yearIndex];
          const rawValue = parts[colIndex];
          
          // Saltar si parece ser un porcentaje o está vacío
          if (!rawValue || rawValue.trim() === '' || rawValue.includes('%')) {
            yearIndex++;
            continue;
          }
          
          const value = parseNumber(rawValue);
          
          console.log(`  Year ${year}: "${rawValue}" -> ${value}`);
          
          if (yearlyDataMap[year] && mappedField !== 'year') {
            (yearlyDataMap[year] as any)[mappedField] = value;
          }
          yearIndex++;
        }
      } else {
        console.log(`Concept not mapped: "${concept}"`);
      }
    }

    // Convertir a formato YearlyData estándar
    const result: YearlyData[] = years.map(year => {
      const detailed = yearlyDataMap[year];
      return convertDetailedToStandard(detailed);
    });

    console.log('Final parsed data:', result.length, 'years');
    if (result.length > 0) {
      console.log('Sample data for year', result[0].year, ':', {
        net_sales: result[0].net_sales,
        food_cost: result[0].food_cost,
        paper_cost: result[0].paper_cost
      });
    }
    return result;

  } catch (error) {
    console.error('Error parsing detailed data:', error);
    throw new Error('Error al procesar los datos: ' + (error instanceof Error ? error.message : 'Error desconocido'));
  }
};

const convertDetailedToStandard = (detailed: DetailedYearlyData): YearlyData => {
  return {
    year: detailed.year,
    net_sales: detailed.ventas_netas,
    other_revenue: detailed.valor_produccion - detailed.ventas_netas, // Diferencia entre valor producción y ventas netas
    food_cost: detailed.comida,
    food_employees: detailed.comida_empleados,
    waste: detailed.desperdicios,
    paper_cost: detailed.papel,
    crew_labor: detailed.mano_obra,
    management_labor: detailed.mano_obra_gerencia,
    social_security: detailed.seguridad_social,
    travel_expenses: detailed.gastos_viajes,
    advertising: detailed.publicidad,
    promotion: detailed.promocion,
    external_services: detailed.servicios_exteriores,
    uniforms: detailed.uniformes,
    operation_supplies: detailed.suministros_operacion,
    maintenance: detailed.reparacion_mantenimiento,
    utilities: detailed.luz_agua_telefono,
    office_expenses: detailed.gastos_oficina,
    cash_differences: detailed.diferencias_caja,
    other_controllable: detailed.varios_controlables,
    pac: detailed.pac,
    rent: detailed.renta,
    additional_rent: detailed.renta_adicional,
    royalty: detailed.royalty,
    office_legal: detailed.oficina_legal,
    insurance: detailed.seguros,
    taxes_licenses: detailed.tasas_licencias,
    depreciation: detailed.depreciaciones_amortizaciones,
    interest: detailed.intereses,
    other_non_controllable: detailed.varios_no_controlables,
    non_product_sales: detailed.ventas_no_producto,
    non_product_cost: detailed.costo_no_producto,
    draw_salary: detailed.draw_salary,
    general_expenses: detailed.gastos_generales,
    loan_payment: detailed.cuota_prestamo,
    investment_own_funds: detailed.inversiones_fondos_propios
  };
};
