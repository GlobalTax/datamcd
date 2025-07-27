import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, Users, AlertTriangle, Moon, Calendar, TrendingUp } from 'lucide-react';

interface OrquestEmployee {
  id: string;
  nif?: string;
  nombre?: string;
  apellidos?: string;
  dia_trabajado?: number;
  asistencia_trabajo?: number;
  horas_netas_mensuales?: number;
  turnos_cierre?: number;
  horas_nocturnas_tipo2?: number;
  horas_nocturnas_tipo3?: number;
  horas_vacaciones?: number;
  horas_formacion_externa?: number;
  horas_ausencia_justificada?: number;
  horas_sancion?: number;
  horas_compensacion_festivos?: number;
  horas_festivo_no_trabajado?: number;
  horas_ausencia_injustificada?: number;
  horas_ausencia_parcial?: number;
  horas_baja_it?: number;
  horas_baja_accidente?: number;
  dias_vacaciones?: number;
  dias_formacion_externa?: number;
  dias_ausencia_justificada?: number;
  dias_sancion?: number;
  dias_compensacion_festivos?: number;
  dias_festivo_no_trabajado?: number;
  dias_ausencia_injustificada?: number;
  dias_ausencia_parcial?: number;
  dias_baja_it?: number;
  dias_baja_accidente?: number;
  dias_otra_incidencia?: number;
  fecha_inicio_contrato?: string;
  dias_cedido?: number;
  estado?: string;
  puesto?: string;
  departamento?: string;
}

interface OrquestMetricsPanelProps {
  employees: OrquestEmployee[];
  loading?: boolean;
}

export const OrquestMetricsPanel: React.FC<OrquestMetricsPanelProps> = ({ employees, loading }) => {
  // Calcular métricas agregadas
  const totalEmployees = employees.length;
  const totalHorasNetas = employees.reduce((sum, emp) => sum + (emp.horas_netas_mensuales || 0), 0);
  const totalHorasNocturnas = employees.reduce((sum, emp) => 
    sum + (emp.horas_nocturnas_tipo2 || 0) + (emp.horas_nocturnas_tipo3 || 0), 0);
  const totalTurnosCierre = employees.reduce((sum, emp) => sum + (emp.turnos_cierre || 0), 0);
  
  // Métricas de ausencias
  const totalAusencias = employees.reduce((sum, emp) => 
    sum + (emp.dias_ausencia_justificada || 0) + (emp.dias_ausencia_injustificada || 0) + 
    (emp.dias_baja_it || 0) + (emp.dias_baja_accidente || 0), 0);
  
  const totalDiasTrabajados = employees.reduce((sum, emp) => sum + (emp.dia_trabajado || 0), 0);
  const totalAsistencia = employees.reduce((sum, emp) => sum + (emp.asistencia_trabajo || 0), 0);
  
  const tasaAsistencia = totalDiasTrabajados > 0 ? (totalAsistencia / totalDiasTrabajados) * 100 : 0;
  const tasaAusentismo = totalDiasTrabajados > 0 ? (totalAusencias / totalDiasTrabajados) * 100 : 0;
  
  // Empleados con más ausencias
  const empleadosConAusencias = employees
    .map(emp => ({
      ...emp,
      totalAusencias: (emp.dias_ausencia_justificada || 0) + (emp.dias_ausencia_injustificada || 0) + 
                      (emp.dias_baja_it || 0) + (emp.dias_baja_accidente || 0)
    }))
    .filter(emp => emp.totalAusencias > 0)
    .sort((a, b) => b.totalAusencias - a.totalAusencias)
    .slice(0, 5);

  // Empleados con más horas nocturnas
  const empleadosHorasNocturnas = employees
    .map(emp => ({
      ...emp,
      totalNocturnas: (emp.horas_nocturnas_tipo2 || 0) + (emp.horas_nocturnas_tipo3 || 0)
    }))
    .filter(emp => emp.totalNocturnas > 0)
    .sort((a, b) => b.totalNocturnas - a.totalNocturnas)
    .slice(0, 5);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (totalEmployees === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground">No hay datos de Orquest</h3>
            <p className="text-sm text-muted-foreground">
              Sincroniza los empleados de Orquest para ver las métricas detalladas
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPIs principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Empleados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEmployees}</div>
            <p className="text-xs text-muted-foreground">
              {totalHorasNetas.toFixed(1)} horas netas totales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Asistencia</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasaAsistencia.toFixed(1)}%</div>
            <Progress value={tasaAsistencia} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Horas Nocturnas</CardTitle>
            <Moon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHorasNocturnas.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              {totalTurnosCierre} turnos de cierre
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Ausentismo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasaAusentismo.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {totalAusencias} días de ausencia total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Análisis detallado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Empleados con más ausencias */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Empleados con Más Ausencias
            </CardTitle>
            <CardDescription>
              Top 5 empleados con mayor número de días de ausencia
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {empleadosConAusencias.length > 0 ? (
                  empleadosConAusencias.map((emp, index) => (
                    <div key={emp.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex-1">
                        <p className="font-medium">
                          {emp.nombre} {emp.apellidos}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {emp.puesto} - {emp.departamento}
                        </p>
                        <div className="flex gap-2 mt-1">
                          {emp.dias_ausencia_injustificada > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {emp.dias_ausencia_injustificada} injustificada
                            </Badge>
                          )}
                          {emp.dias_baja_it > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {emp.dias_baja_it} IT
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-destructive">
                          {emp.totalAusencias}
                        </p>
                        <p className="text-xs text-muted-foreground">días</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    No hay ausencias registradas
                  </p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Empleados con más horas nocturnas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Moon className="h-5 w-5" />
              Empleados con Más Horas Nocturnas
            </CardTitle>
            <CardDescription>
              Top 5 empleados con mayor número de horas nocturnas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {empleadosHorasNocturnas.length > 0 ? (
                  empleadosHorasNocturnas.map((emp, index) => (
                    <div key={emp.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex-1">
                        <p className="font-medium">
                          {emp.nombre} {emp.apellidos}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {emp.puesto} - {emp.departamento}
                        </p>
                        <div className="flex gap-2 mt-1">
                          {emp.horas_nocturnas_tipo2 > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {emp.horas_nocturnas_tipo2}h Tipo 2
                            </Badge>
                          )}
                          {emp.horas_nocturnas_tipo3 > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {emp.horas_nocturnas_tipo3}h Tipo 3
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary">
                          {emp.totalNocturnas.toFixed(1)}
                        </p>
                        <p className="text-xs text-muted-foreground">horas</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    No hay horas nocturnas registradas
                  </p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Resumen de conceptos laborales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Resumen de Conceptos Laborales
          </CardTitle>
          <CardDescription>
            Distribución de horas y días por diferentes conceptos laborales
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground">AUSENCIAS</h4>
              <Separator />
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Vacaciones:</span>
                  <span>{employees.reduce((sum, emp) => sum + (emp.dias_vacaciones || 0), 0)} días</span>
                </div>
                <div className="flex justify-between">
                  <span>Formación:</span>
                  <span>{employees.reduce((sum, emp) => sum + (emp.dias_formacion_externa || 0), 0)} días</span>
                </div>
                <div className="flex justify-between">
                  <span>Baja IT:</span>
                  <span>{employees.reduce((sum, emp) => sum + (emp.dias_baja_it || 0), 0)} días</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground">HORAS ESPECIALES</h4>
              <Separator />
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Festivos:</span>
                  <span>{employees.reduce((sum, emp) => sum + (emp.horas_compensacion_festivos || 0), 0).toFixed(1)}h</span>
                </div>
                <div className="flex justify-between">
                  <span>Nocturnas T2:</span>
                  <span>{employees.reduce((sum, emp) => sum + (emp.horas_nocturnas_tipo2 || 0), 0).toFixed(1)}h</span>
                </div>
                <div className="flex justify-between">
                  <span>Nocturnas T3:</span>
                  <span>{employees.reduce((sum, emp) => sum + (emp.horas_nocturnas_tipo3 || 0), 0).toFixed(1)}h</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground">INCIDENCIAS</h4>
              <Separator />
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Sanciones:</span>
                  <span>{employees.reduce((sum, emp) => sum + (emp.dias_sancion || 0), 0)} días</span>
                </div>
                <div className="flex justify-between">
                  <span>Injustificadas:</span>
                  <span>{employees.reduce((sum, emp) => sum + (emp.dias_ausencia_injustificada || 0), 0)} días</span>
                </div>
                <div className="flex justify-between">
                  <span>Otras:</span>
                  <span>{employees.reduce((sum, emp) => sum + (emp.dias_otra_incidencia || 0), 0)} días</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground">OPERACIÓN</h4>
              <Separator />
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Turnos cierre:</span>
                  <span>{totalTurnosCierre}</span>
                </div>
                <div className="flex justify-between">
                  <span>Días cedidos:</span>
                  <span>{employees.reduce((sum, emp) => sum + (emp.dias_cedido || 0), 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Horas netas:</span>
                  <span>{totalHorasNetas.toFixed(1)}h</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};