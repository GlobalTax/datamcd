
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useLogging } from '@/hooks/useLogging';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { logInfo } = useLogging();

  React.useEffect(() => {
    logInfo('Dashboard page loaded');
  }, [logInfo]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Bienvenido, {user?.user_metadata?.full_name || user?.email}
        </h1>
        <p className="text-gray-600 mt-2">
          Panel de control de franquiciado McDonald's
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Restaurantes</CardTitle>
            <CardDescription>
              Gestiona tus restaurantes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              restaurantes activos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Nómina</CardTitle>
            <CardDescription>
              Revisar costes de personal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€0</div>
            <p className="text-xs text-muted-foreground">
              coste mensual
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>P&L</CardTitle>
            <CardDescription>
              Análisis financiero
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€0</div>
            <p className="text-xs text-muted-foreground">
              beneficio neto
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
