// === DOMINIO: PRESUPUESTOS ===
// Tipos relacionados con presupuestos anuales, datos reales y comparaciones

export interface BudgetData {
  id: string;
  category: string;
  subcategory?: string;
  isCategory: boolean;
  jan: number;
  feb: number;
  mar: number;
  apr: number;
  may: number;
  jun: number;
  jul: number;
  aug: number;
  sep: number;
  oct: number;
  nov: number;
  dec: number;
  total: number;
}

export interface ActualData {
  id: string;
  category: string;
  subcategory?: string;
  jan: number;
  feb: number;
  mar: number;
  apr: number;
  may: number;
  jun: number;
  jul: number;
  aug: number;
  sep: number;
  oct: number;
  nov: number;
  dec: number;
  total: number;
}

export interface ActualDataUpdateParams {
  restaurant_id: string;
  year: number;
  category: string;
  subcategory: string;
  [key: string]: any;
}

// Tipos para celdas editables
export interface EditingCell {
  rowId: string;
  field: string;
  isActual?: boolean;
}

// Tipos para el sistema de presupuestos
export interface Month {
  key: string;
  label: string;
}

export interface HeaderLabels {
  monthSubheaders: JSX.Element;
  totalSubheaders: JSX.Element;
}

// Props para componentes
export interface BudgetTableProps {
  data: BudgetData[];
  actualData?: ActualData[];
  onCellChange: (id: string, field: string, value: number) => void;
  onActualChange?: (id: string, field: string, value: number) => void;
  viewMode?: 'budget' | 'comparison' | 'actuals';
  showOnlySummary?: boolean;
}

export interface AnnualBudgetGridProps {
  restaurantId: string;
  year: number;
  onDataChange?: () => void;
}

export interface BudgetComparisonProps {
  restaurantId: string;
  year: number;
  budgetData: BudgetData[];
  actualData: ActualData[];
}

export interface BudgetGridHeaderProps {
  year: number;
  viewMode: 'budget' | 'comparison' | 'actuals';
  onViewModeChange: (mode: 'budget' | 'comparison' | 'actuals') => void;
}

export interface BudgetGridStatusProps {
  hasChanges: boolean;
  isLoading: boolean;
  onSave: () => Promise<void>;
  onExport: () => void;
}

export interface BudgetTableCellProps {
  value: number;
  isEditing: boolean;
  onChange: (value: number) => void;
  onEditStart: () => void;
  onEditEnd: () => void;
  isCategory?: boolean;
  compareValue?: number;
  showComparison?: boolean;
}

export interface BudgetTableHeaderProps {
  viewMode: 'budget' | 'comparison' | 'actuals';
  months: Month[];
}

export interface BudgetTableRowProps {
  item: BudgetData;
  actualItem?: ActualData;
  editingCell: EditingCell | null;
  viewMode: 'budget' | 'comparison' | 'actuals';
  onCellEdit: (field: string, isActual?: boolean) => void;
  onCellChange: (field: string, value: number, isActual?: boolean) => void;
  onCellBlur: () => void;
}

export interface BudgetChangesBannerProps {
  hasChanges: boolean;
  onSave: () => Promise<void>;
  onDiscard: () => void;
  isLoading: boolean;
}

// Hook return types
export interface BudgetDataHookReturn {
  rowData: BudgetData[];
  hasChanges: boolean;
  loading: boolean;
  error: string | null;
  handleCellChange: (id: string, field: string, value: number) => void;
  handleSave: () => Promise<void>;
  reloadData: () => void;
}

// Tipos de configuración
export interface BudgetCategory {
  id: string;
  name: string;
  subcategories: BudgetSubcategory[];
  order: number;
}

export interface BudgetSubcategory {
  id: string;
  name: string;
  category_id: string;
  order: number;
}

// Tipos de exportación
export interface BudgetExportOptions {
  format: 'excel' | 'csv' | 'pdf';
  includeActuals: boolean;
  includeComparison: boolean;
  includeSummary: boolean;
  period: {
    from: string;
    to: string;
  };
}