import React, { useState } from 'react';
import { AnnualBudgetGrid } from '@/components/budget/AnnualBudgetGrid';
import { useFranchiseeRestaurants } from '@/hooks/useFranchiseeRestaurants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Building, Calendar, Plus, Download, FileText } from 'lucide-react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/navigation/AppSidebar';
import { BalanceSheetStatement } from '@/components/profitloss/BalanceSheetStatement';
import { CashFlowStatement } from '@/components/profitloss/CashFlowStatement';

export default function AnnualBudgetPage() {
  const { restaurants, loading: restaurantsLoading } = useFranchiseeRestaurants();
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [activeTab, setActiveTab] = useState('budget');

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  if (restaurantsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando restaurantes...</p>
        </div>
      </div>
    );
  }

  const selectedRestaurantData = restaurants.find(r => r.id === selectedRestaurant);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white px-6">
            <SidebarTrigger className="-ml-1" />
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-gray-900">Estados Financieros</h1>
              <p className="text-sm text-gray-500">
                {selectedRestaurantData 
                  ? `${selectedRestaurantData.base_restaurant?.restaurant_name} - #${selectedRestaurantData.base_restaurant?.site_number}`
                  : 'Análisis completo de rentabilidad'
                }
              </p>
            </div>
          </header>

          <main className="flex-1 p-6 space-y-6">
            {/* Header Controls */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Estados Financieros</h1>
                <p className="text-gray-600">Presupuestos y análisis completo</p>
              </div>
              <div className="flex gap-3">
                <Select 
                  value={selectedYear.toString()} 
                  onValueChange={(value) => setSelectedYear(parseInt(value))}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Button variant="outline" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Summary Report
                </Button>
                
                <Button variant="outline" className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Export
                </Button>
              </div>
            </div>

            {/* Restaurant Selector */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Seleccionar Restaurante
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedRestaurant} onValueChange={setSelectedRestaurant}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar restaurante" />
                  </SelectTrigger>
                  <SelectContent>
                    {restaurants.map((restaurant) => (
                      <SelectItem key={restaurant.id} value={restaurant.id}>
                        {restaurant.base_restaurant?.restaurant_name || 'Sin nombre'} - 
                        {restaurant.base_restaurant?.site_number || 'Sin número'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Financial Statement Tabs */}
            {selectedRestaurant ? (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <div className="border-b border-gray-200 px-6 pt-6">
                    <TabsList className="inline-flex h-auto p-0 space-x-8 bg-transparent">
                      <TabsTrigger 
                        value="budget" 
                        className="bg-transparent border-0 border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:bg-transparent data-[state=active]:text-gray-900 data-[state=active]:shadow-none rounded-none px-0 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                      >
                        Profit & Loss
                      </TabsTrigger>
                      <TabsTrigger 
                        value="balance-sheet" 
                        className="bg-transparent border-0 border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:bg-transparent data-[state=active]:text-gray-900 data-[state=active]:shadow-none rounded-none px-0 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                      >
                        Balance Sheet
                      </TabsTrigger>
                      <TabsTrigger 
                        value="cash-flow" 
                        className="bg-transparent border-0 border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:bg-transparent data-[state=active]:text-gray-900 data-[state=active]:shadow-none rounded-none px-0 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                      >
                        Cash Flow Statement
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <div className="p-6">
                    <TabsContent value="budget" className="space-y-6 m-0">
                      <AnnualBudgetGrid
                        restaurantId={selectedRestaurant}
                        year={selectedYear}
                      />
                    </TabsContent>

                    <TabsContent value="balance-sheet" className="space-y-6 m-0">
                      <BalanceSheetStatement restaurantId={selectedRestaurant} year={selectedYear} />
                    </TabsContent>

                    <TabsContent value="cash-flow" className="space-y-6 m-0">
                      <CashFlowStatement restaurantId={selectedRestaurant} year={selectedYear} />
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Selecciona un Restaurante
                  </h3>
                  <p className="text-gray-500">
                    Elige un restaurante de la lista para comenzar a trabajar con sus estados financieros.
                  </p>
                </CardContent>
              </Card>
            )}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
