// === DOMINIO: ASESORES ===
// Tipos relacionados con asesores, reportes y comunicaciones

export interface AdvisorAlert {
  id: string;
  advisor_id: string;
  restaurant_id?: string;
  franchisee_id?: string;
  alert_type: string;
  title: string;
  description?: string;
  conditions: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdvisorAlertInstance {
  id: string;
  alert_id: string;
  restaurant_id?: string;
  franchisee_id?: string;
  message: string;
  severity?: string;
  data?: any;
  is_acknowledged: boolean;
  acknowledged_by?: string;
  acknowledged_at?: string;
  created_at: string;
}

export interface AdvisorTask {
  id: string;
  advisor_id: string;
  franchisee_id: string;
  restaurant_id?: string;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  due_date?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AdvisorCommunication {
  id: string;
  advisor_id: string;
  franchisee_id: string;
  message_type: string;
  subject?: string;
  content: string;
  priority?: string;
  is_read: boolean;
  read_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AdvisorReportTemplate {
  id: string;
  advisor_id: string;
  template_name: string;
  report_type: string;
  description?: string;
  configuration: any;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdvisorReport {
  id: string;
  advisor_id: string;
  template_id?: string;
  report_name: string;
  report_data: any;
  parameters?: any;
  generated_at: string;
  expires_at?: string;
}

// KPIs y métricas
export interface KPIData {
  id: string;
  name: string;
  value: number;
  previousValue: number;
  change: number;
  changePercentage: number;
  trend: 'up' | 'down' | 'stable';
  period: string;
}

export interface RecentActivity {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  restaurant_id?: string;
  franchisee_id?: string;
  metadata?: any;
}

// Tipos de reportes
export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: 'financial' | 'operational' | 'performance' | 'compliance';
  configuration: ReportConfiguration;
  is_public: boolean;
  created_by: string;
  created_at: string;
}

export interface ReportConfiguration {
  dataSource: string[];
  filters: Record<string, any>;
  groupBy: string[];
  metrics: string[];
  charts: ChartConfiguration[];
  exportFormats: string[];
}

export interface ChartConfiguration {
  type: 'line' | 'bar' | 'pie' | 'area' | 'scatter';
  title: string;
  xAxis: string;
  yAxis: string;
  series: string[];
  options?: Record<string, any>;
}

export interface GeneratedReport {
  id: string;
  template_id: string;
  name: string;
  data: any;
  charts: any[];
  summary: ReportSummary;
  generated_at: string;
  expires_at?: string;
  parameters: Record<string, any>;
}

export interface ReportSummary {
  totalRecords: number;
  keyMetrics: Record<string, number>;
  insights: string[];
  recommendations: string[];
}

// Reglas de alertas
export interface AlertRule {
  id: string;
  name: string;
  description: string;
  condition: AlertCondition;
  actions: AlertAction[];
  is_active: boolean;
  frequency: 'real-time' | 'hourly' | 'daily' | 'weekly';
  last_triggered?: string;
}

export interface AlertCondition {
  metric: string;
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte' | 'between';
  value: number | number[];
  timeframe: string;
  filters?: Record<string, any>;
}

export interface AlertAction {
  type: 'email' | 'sms' | 'push' | 'task' | 'escalation';
  recipients: string[];
  template?: string;
  delay?: number;
  conditions?: Record<string, any>;
}

export interface AlertInstance {
  id: string;
  rule_id: string;
  restaurant_id?: string;
  franchisee_id?: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  data: any;
  is_acknowledged: boolean;
  acknowledged_by?: string;
  acknowledged_at?: string;
  created_at: string;
}

// Props para componentes
export interface AdvancedDashboardProps {
  advisorId: string;
  dateRange?: {
    from: string;
    to: string;
  };
}

export interface AdvancedReportsProps {
  advisorId: string;
  onReportGenerated?: (report: GeneratedReport) => void;
}

export interface NotificationCenterProps {
  advisorId: string;
  onAlertAcknowledged?: (alertId: string) => void;
  onTaskCompleted?: (taskId: string) => void;
}

// Gestión de comunicaciones
export interface CommunicationThread {
  id: string;
  advisor_id: string;
  franchisee_id: string;
  subject: string;
  messages: CommunicationMessage[];
  status: 'open' | 'closed' | 'pending';
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
}

export interface CommunicationMessage {
  id: string;
  thread_id: string;
  sender_id: string;
  sender_type: 'advisor' | 'franchisee';
  content: string;
  attachments?: string[];
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

// Configuración de notificaciones
export interface NotificationPreferences {
  advisor_id: string;
  email_alerts: boolean;
  push_notifications: boolean;
  sms_alerts: boolean;
  frequency_settings: {
    immediate: string[];
    daily_digest: string[];
    weekly_summary: string[];
  };
  quiet_hours: {
    enabled: boolean;
    start_time: string;
    end_time: string;
    timezone: string;
  };
}