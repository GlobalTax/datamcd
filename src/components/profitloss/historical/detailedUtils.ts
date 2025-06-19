
import { YearlyData, DetailedYearlyData } from './types';
import { toast } from 'sonner';

// Mapeo de conceptos del P&L detallado a campos del sistema
const conceptMapping: { [key: string]: keyof DetailedYearlyData } = {
  'ventas netas': 'ventas_netas',
  'valor de la produccion': 'valor_produccion',
  'comida': 'comida',
  'comida empleados': 'comida_empleados',
  'desperdicios': 'desperdicios',
  'papel': 'papel',
  'mano de obra': 'mano_obra',
  'mano de obra de gerencia': 'mano_obra_gerencia',
  'seguridad social': 'seguridad_social',
  'gastos viajes': 'gastos_viajes',
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
  'ventas no producto': 'ventas_no_producto',
  'costo no producto': 'costo_no_producto',
  'draw salary': 'draw_salary',
  'gastos generales': 'gastos_generales',
  'cuota del prestamo (interes + principal)': 'cuota_prestamo',
  'cuota del prestamo': 'cuota_prestamo',
  'inversiones con fondos propios': 'inversiones_fondos_propios'
};

const parseNumber = (value: string): number => {
  if (!value || value.trim() === '') return 0;
  
  // Remover espacios, puntos de miles y reemplazar coma decimal por punto
  const cleanValue = value
    .replace(/\s/g, '')
    .replace(/\./g, '')
    .replace(',', '.')
    .replace(/[^\d.-]/g, '');
  
  const parsed = parseFloat(cleanValue);
  return isNaN(parsed) ? 0 : parsed;
};

const extractYearsFromHeader = (headerLine: string): number[] => {
  console.log('=== EXTRACTING YEARS FROM HEADER ===');
  console.log('Header line:', headerLine);
  
  const years: number[] = [];
  // Buscar patrones como "Ejerc. 2023", "2023", etc.
  const yearMatches = headerLine.match(/(\d{4})/g);
  
  console.log('Year matches found:', yearMatches);
  
  if (yearMatches) {
    yearMatches.forEach(yearStr => {
      const year = parseInt(yearStr);
      if (year >= 2000 && year <= 2050) {
        years.push(year);
      }
    });
  }
  
  const sortedYears = years.sort((a, b) => b - a); // Orden descendente (más reciente primero)
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
      throw new Error('No se encontraron años válidos en el encabezado');
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
      if (parts.length < 2) continue;

      const concept = normalizeConceptName(parts[0]);
      const mappedField = conceptMapping[concept];

      console.log(`Processing line ${i}: "${concept}" -> ${mappedField}`);
      console.log(`Parts count: ${parts.length}, First few parts:`, parts.slice(0, 5));

      if (mappedField) {
        // Los años aparecen en columnas: 1, 3, 5, 7, 9 (valores)
        // Los porcentajes están en: 2, 4, 6, 8, 10
        let yearIndex = 0;
        for (let colIndex = 1; colIndex < parts.length && yearIndex < years.length; colIndex += 2) {
          const year = years[yearIndex];
          const value = parseNumber(parts[colIndex]);
          
          console.log(`  Year ${year} (col ${colIndex}): ${parts[colIndex]} -> ${value}`);
          
          if (yearlyDataMap[year] && mappedField !== 'year') {
            (yearlyDataMap[year] as any)[mappedField] = value;
          }
          yearIndex++;
        }
      } else {
        console.log(`Unmapped concept: "${concept}"`);
      }
    }

    // Convertir a formato YearlyData estándar
    const result: YearlyData[] = years.map(year => {
      const detailed = yearlyDataMap[year];
      return convertDetailedToStandard(detailed);
    });

    console.log('Final parsed data:', result.length, 'years');
    console.log('Sample data:', result[0]);
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
    other_revenue: 0, // No hay equivalente directo
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
