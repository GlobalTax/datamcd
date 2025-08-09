import React from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/navigation/AppSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SearchableRestaurantSelect, RestaurantOption } from '@/components/ui/searchable-restaurant-select';
import { useFranchiseeRestaurants } from '@/hooks/useFranchiseeRestaurants';
import { useRestaurantFinancials } from '@/hooks/useRestaurantFinancials';
import { useProfitLossCalculations } from '@/hooks/useProfitLossData';
import Sparkline from '@/components/charts/Sparkline';
import { Seo } from '@/components/seo/Seo';
import { useNavigate } from 'react-router-dom';

export default function FinancialSummaryPage() {
  const navigate = useNavigate();
  const { restaurants, loading: restaurantsLoading } = useFranchiseeRestaurants();
  const [selectedRestaurantId, setSelectedRestaurantId] = React.useState<string>('');

  React.useEffect(() => {
    if (!selectedRestaurantId && restaurants.length > 0) {
      setSelectedRestaurantId(restaurants[0].id);
    }
  }, [restaurants, selectedRestaurantId]);

  const restaurantOptions: RestaurantOption[] = React.useMemo(() => {
    return restaurants.map((r) => ({
      id: r.id,
      name: r.base_restaurant?.restaurant_name || 'Restaurante',
      site_number: r.base_restaurant?.site_number || 'N/A',
      base_restaurant: {
        restaurant_name: r.base_restaurant?.restaurant_name || 'Restaurante',
        site_number: r.base_restaurant?.site_number || 'N/A',
      },
    }));
  }, [restaurants]);

  const { financials, budgets, loading } = useRestaurantFinancials(selectedRestaurantId);
  const { formatCurrency } = useProfitLossCalculations();

  const monthRevenue = financials.monthlyData.map((m) => m.revenue);
  const monthProfit = financials.monthlyData.map((m) => m.profit);
  const monthMargin = financials.monthlyData.map((m) => m.margin);

  const selectedRestaurant = restaurantOptions.find((r) => r.id === selectedRestaurantId);
  const selectedSite = selectedRestaurant?.site_number || '001';

  return (
    <SidebarProvider>
      <Seo
        title={`Resumen Financiero | McDonald's`}
        description="Vista unificada de P&L, presupuestos y valoración. KPIs clave y comparativas en una sola pantalla."
      />
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <header className="flex h-16 shrink-0 items-center gap-3 border-b bg-white px-4 sm:px-6">
            <SidebarTrigger className="-ml-1" />
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-semibold">Resumen Financiero</h1>
              <p className="text-sm text-muted-foreground truncate">KPIs, tendencias y comparación VS presupuesto</p>
            </div>
            <div className="w-full sm:w-80">
              <SearchableRestaurantSelect
                restaurants={restaurantOptions}
                value={selectedRestaurantId}
                onValueChange={setSelectedRestaurantId}
                placeholder="Selecciona restaurante"
                loading={restaurantsLoading}
                compact
              />
            </div>
          </header>

          <main className="flex-1 p-4 sm:p-6">
            {/* KPIs */}
            <section aria-labelledby="kpis" className="mb-4">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <Card className="h-24">
                  <CardHeader className="py-2 pb-0">
                    <CardTitle className="text-xs font-medium text-muted-foreground">Ventas</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-1">
                    <div className="flex items-end justify-between gap-3">
                      <div className="text-xl font-semibold truncate">{formatCurrency(financials.totalRevenue)}</div>
                      <div className="w-20">
                        <Sparkline data={monthRevenue} />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="h-24">
                  <CardHeader className="py-2 pb-0">
                    <CardTitle className="text-xs font-medium text-muted-foreground">EBITDA (aprox.)</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-1">
                    <div className="flex items-end justify-between gap-3">
                      <div className="text-xl font-semibold truncate">{formatCurrency(financials.netProfit)}</div>
                      <div className="w-20">
                        <Sparkline data={monthProfit} />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="h-24">
                  <CardHeader className="py-2 pb-0">
                    <CardTitle className="text-xs font-medium text-muted-foreground">ROI</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-1">
                    <div className="flex items-end justify-between gap-3">
                      <div className="text-xl font-semibold">—</div>
                      <div className="w-20">
                        <Sparkline data={monthMargin} />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="h-24">
                  <CardHeader className="py-2 pb-0">
                    <CardTitle className="text-xs font-medium text-muted-foreground">Cash Flow</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-1">
                    <div className="flex items-end justify-between gap-3">
                      <div className="text-xl font-semibold truncate">{formatCurrency(financials.netProfit)}</div>
                      <div className="w-20">
                        <Sparkline data={monthProfit} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Comparativa presupuesto */}
            <section aria-labelledby="comparativa" className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <h2 id="comparativa" className="text-sm font-semibold">Año actual vs Presupuesto</h2>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => navigate(`/profit-loss/${selectedSite}`)}>Ver P&L</Button>
                  <Button size="sm" variant="outline" onClick={() => navigate('/annual-budget')}>Ver Presupuesto</Button>
                  <Button size="sm" variant="outline" onClick={() => navigate('/valuation')}>Ver Valoración</Button>
                </div>
              </div>

              <div className="overflow-hidden rounded-md border bg-card">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left px-3 py-2 font-medium">Categoría</th>
                      <th className="text-right px-3 py-2 font-medium">Presupuesto</th>
                      <th className="text-right px-3 py-2 font-medium">Real</th>
                      <th className="text-right px-3 py-2 font-medium">Var</th>
                    </tr>
                  </thead>
                  <tbody>
                    {budgets.comparison.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-3 py-4 text-center text-muted-foreground">{loading ? 'Cargando…' : 'Sin datos de presupuesto'}</td>
                      </tr>
                    ) : (
                      budgets.comparison.map((row) => {
                        const varianceCls = row.variance <= 0 ? 'text-emerald-600' : 'text-red-600';
                        return (
                          <tr key={row.category} className="border-t">
                            <td className="px-3 py-2">{row.category}</td>
                            <td className="px-3 py-2 text-right">{formatCurrency(row.budget)}</td>
                            <td className="px-3 py-2 text-right">{formatCurrency(row.actual)}</td>
                            <td className={`px-3 py-2 text-right font-medium ${varianceCls}`}>{formatCurrency(row.variance)}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
