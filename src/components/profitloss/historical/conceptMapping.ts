
import { DetailedYearlyData } from './types';

// Mapeo completo de conceptos del P&L detallado a campos del sistema
export const conceptMapping: { [key: string]: keyof DetailedYearlyData } = {
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
  's.o.i.': 'varios_no_controlables',
  'soi': 'varios_no_controlables',
  'draw salary': 'draw_salary',
  'gastos generales': 'gastos_generales',
  'cuota del prestamo (interes + principal)': 'cuota_prestamo',
  'cuota del prestamo': 'cuota_prestamo',
  'gastos de intereses': 'intereses',
  'inversiones con fondos propios': 'inversiones_fondos_propios'
};

export const normalizeConceptName = (concept: string): string => {
  return concept
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s\(\)\.\,]/g, '');
};

export const isHeaderOrTotalLine = (concept: string): boolean => {
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
