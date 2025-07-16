import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Building2, Database, TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { UnifiedWorker } from '@/hooks/useWorkersPanel';

interface WorkersStatsProps {
  workers: UnifiedWorker[];
  orquestCount: number;
  biloopCount: number;
  loading: boolean;
}

export const WorkersStats: React.FC<WorkersStatsProps> = ({
  workers,
  orquestCount,
  biloopCount,
  loading
}) => {
  const activeWorkers = workers.filter(w => 
    w.estado?.toLowerCase() === 'activo' || w.estado?.toLowerCase() === 'active'
  ).length;

  const inactiveWorkers = workers.length - activeWorkers;

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[60px] mb-2" />
              <Skeleton className="h-3 w-[120px]" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const stats = [
    {
      title: "Total Trabajadores",
      value: workers.length,
      description: `${activeWorkers} activos, ${inactiveWorkers} inactivos`,
      icon: Users,
      trend: workers.length > 0 ? "+100%" : "0%",
    },
    {
      title: "Desde Orquest",
      value: orquestCount,
      description: "Empleados sincronizados",
      icon: Building2,
      trend: orquestCount > 0 ? `${((orquestCount / workers.length) * 100).toFixed(0)}%` : "0%",
    },
    {
      title: "Desde Biloop",
      value: biloopCount,
      description: "Empleados registrados",
      icon: Database,
      trend: biloopCount > 0 ? `${((biloopCount / workers.length) * 100).toFixed(0)}%` : "0%",
    },
    {
      title: "Trabajadores Activos",
      value: activeWorkers,
      description: "En servicio actualmente",
      icon: TrendingUp,
      trend: workers.length > 0 ? `${((activeWorkers / workers.length) * 100).toFixed(0)}%` : "0%",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">
              {stat.description}
            </p>
            <div className="flex items-center pt-1">
              <span className="text-xs text-green-600 font-medium">
                {stat.trend}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};