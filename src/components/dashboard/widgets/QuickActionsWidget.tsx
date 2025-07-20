
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Calculator, 
  Calendar, 
  BarChart3, 
  Users, 
  Receipt, 
  AlertTriangle,
  Database,
  HardHat
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface QuickActionsWidgetProps {
  userRole?: string;
}

export const QuickActionsWidget: React.FC<QuickActionsWidgetProps> = ({ userRole }) => {
  const navigate = useNavigate();

  const baseActions = [
    {
      title: 'Análisis Financiero',
      description: 'Ver métricas y KPIs',
      icon: BarChart3,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      action: () => navigate('/analysis')
    },
    {
      title: 'Valoración',
      description: 'Calcular valor de mercado',
      icon: Calculator,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      action: () => navigate('/valuation')
    },
    {
      title: 'Presupuestos',
      description: 'Gestionar presupuestos anuales',
      icon: Calendar,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      action: () => navigate('/annual-budget')
    },
    {
      title: 'Empleados',
      description: 'Gestión de personal',
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      action: () => navigate('/employees')
    },
    {
      title: 'Panel Laboral',
      description: 'Control de horarios y turnos',
      icon: HardHat,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
      action: () => navigate('/labor-dashboard')
    },
    {
      title: 'Datos Históricos',
      description: 'Consultar histórico P&L',
      icon: Database,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      action: () => navigate('/historical-data')
    }
  ];

  // Acciones adicionales para administradores
  const adminActions = [
    {
      title: 'Incidencias',
      description: 'Gestionar reportes',
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      action: () => navigate('/incidents')
    },
    {
      title: 'Biloop',
      description: 'Integración contable',
      icon: Receipt,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      action: () => navigate('/biloop')
    }
  ];

  const actions = userRole === 'asesor' || userRole === 'admin' || userRole === 'superadmin' 
    ? [...baseActions, ...adminActions] 
    : baseActions;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Acciones Rápidas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="ghost"
              className={`h-auto p-4 flex flex-col items-start gap-2 ${action.bgColor} hover:${action.bgColor} border border-gray-200 hover:border-gray-300`}
              onClick={action.action}
            >
              <action.icon className={`w-5 h-5 ${action.color}`} />
              <div className="text-left">
                <div className="font-medium text-sm text-gray-900">
                  {action.title}
                </div>
                <div className="text-xs text-gray-600">
                  {action.description}
                </div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
