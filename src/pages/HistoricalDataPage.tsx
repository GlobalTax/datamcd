
import React, { useState } from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/navigation/AppSidebar';
import { useRestaurants } from '@/hooks/useRestaurants';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HistoricalPLDashboard } from '@/components/profitloss/historical/HistoricalPLDashboard';
import { Card, CardContent } from '@/components/ui/card';

const HistoricalDataPage = () => {
  const { restaurants } = useRestaurants();
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>('');

  // Auto-select first restaurant if available
  React.useEffect(() => {
    if (restaurants && restaurants.length > 0 && !selectedRestaurantId) {
      setSelectedRestaurantId(restaurants[0].id);
    }
  }, [restaurants, selectedRestaurantId]);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-card px-6">
            <SidebarTrigger className="-ml-1" />
            <div className="flex-1">
              <h1 className="text-lg font-semibold">Datos Históricos P&L</h1>
              <p className="text-sm text-muted-foreground">Análisis histórico de Profit & Loss</p>
            </div>
          </header>

          <main className="flex-1 p-6">
            <div className="mb-6">
              <Select value={selectedRestaurantId} onValueChange={setSelectedRestaurantId}>
                <SelectTrigger className="w-[300px]">
                  <SelectValue placeholder="Selecciona un restaurante" />
                </SelectTrigger>
                <SelectContent>
                  {restaurants?.map((restaurant) => (
                    <SelectItem key={restaurant.id} value={restaurant.id}>
                      {restaurant.restaurant_name || restaurant.site_number || restaurant.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedRestaurantId ? (
              <HistoricalPLDashboard restaurantId={selectedRestaurantId} />
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center py-16">
                  <p className="text-muted-foreground">
                    Selecciona un restaurante para ver los datos históricos
                  </p>
                </CardContent>
              </Card>
            )}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default HistoricalDataPage;
