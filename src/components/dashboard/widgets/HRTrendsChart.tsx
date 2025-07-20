
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface HRTrendsData {
  month: string;
  empleados: number;
  costoLaboral: number;
  horasTrabajadas: number;
  rotacion: number;
}

interface HRTrendsChartProps {
  data: HRTrendsData[];
  loading?: boolean;
}

export const HRTrendsChart: React.FC<HRTrendsChartProps> = ({ data, loading = false }) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Tendencias RRHH
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 animate-pulse bg-gray-200 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Tendencia de empleados y costos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Evolución de Plantilla
          </CardTitle>
          <CardDescription>
            Número de empleados y costo laboral mensual
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'empleados' ? value : `€${Number(value).toLocaleString()}`,
                  name === 'empleados' ? 'Empleados' : 'Costo Laboral'
                ]}
              />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="empleados" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="empleados"
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="costoLaboral" 
                stroke="#10b981" 
                strokeWidth={2}
                name="costoLaboral"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Horas trabajadas */}
      <Card>
        <CardHeader>
          <CardTitle>Horas Trabajadas</CardTitle>
          <CardDescription>
            Total de horas mensuales y tasa de rotación
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'horasTrabajadas' ? `${Number(value).toLocaleString()}h` : `${value}%`,
                  name === 'horasTrabajadas' ? 'Horas Trabajadas' : 'Rotación'
                ]}
              />
              <Bar 
                yAxisId="left"
                dataKey="horasTrabajadas" 
                fill="#8b5cf6" 
                name="horasTrabajadas"
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="rotacion" 
                stroke="#f59e0b" 
                strokeWidth={2}
                name="rotacion"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
