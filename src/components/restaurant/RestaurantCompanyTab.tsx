import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Building2, CheckCircle, RefreshCw, Search, Database } from 'lucide-react';
import { useEInformaIntegration, type CompanyData } from '@/hooks/useEInformaIntegration';
import { useBaseRestaurants } from '@/hooks/useBaseRestaurants';
import { toast } from 'sonner';

interface RestaurantCompanyTabProps {
  restaurantId: string;
}

export const RestaurantCompanyTab: React.FC<RestaurantCompanyTabProps> = ({ restaurantId }) => {
  const [cifToValidate, setCifToValidate] = useState('');
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [lastSuccessfulCIF, setLastSuccessfulCIF] = useState<string>('');
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const { restaurants } = useBaseRestaurants();
  const {
    isLoading,
    isValidating,
    isEnriching,
    validateCIF,
    enrichCompanyData,
    getCompanyByCIF
  } = useEInformaIntegration();

  // Obtener datos del restaurante
  const currentRestaurant = restaurants?.find(r => r.id === restaurantId);
  const restaurantCIF = currentRestaurant?.company_tax_id;

  // Debug logging
  console.log('[RestaurantCompanyTab] Debug Info:', {
    restaurantId,
    currentRestaurant,
    restaurantCIF,
    cifToValidate,
    companyData: companyData ? { cif: companyData.cif, razon_social: companyData.razon_social } : null,
    lastSuccessfulCIF
  });

  // Update debug info in useEffect to prevent infinite re-renders
  useEffect(() => {
    setDebugInfo({
      restaurantId,
      restaurantCIF,
      currentRestaurant: currentRestaurant ? {
        id: currentRestaurant.id,
        restaurant_name: currentRestaurant.restaurant_name,
        company_tax_id: currentRestaurant.company_tax_id
      } : null,
      cifToValidate,
      companyData: companyData ? {
        cif: companyData.cif,
        razon_social: companyData.razon_social,
        validado_einforma: companyData.validado_einforma
      } : null
    });
  }, [restaurantId, restaurantCIF, currentRestaurant, cifToValidate, companyData]);

  // Función estable para cargar datos
  const loadCompanyData = useCallback(async (cif: string) => {
    console.log('[RestaurantCompanyTab] Loading company data for CIF:', cif);
    try {
      const data = await getCompanyByCIF(cif);
      console.log('[RestaurantCompanyTab] Company data loaded:', data);
      
      if (data) {
        setCompanyData(data);
        setLastSuccessfulCIF(cif);
        console.log('[RestaurantCompanyTab] Company data set successfully');
      } else {
        console.log('[RestaurantCompanyTab] No company data found for CIF:', cif);
        // Solo limpiar si estamos cargando un CIF diferente
        if (lastSuccessfulCIF !== cif) {
          setCompanyData(null);
        }
      }
    } catch (error) {
      console.error('[RestaurantCompanyTab] Error loading company data:', error);
      toast.error('Error al cargar los datos de la empresa');
    }
  }, [getCompanyByCIF, lastSuccessfulCIF]);

  useEffect(() => {
    console.log('[RestaurantCompanyTab] useEffect triggered with restaurantCIF:', restaurantCIF);
    if (restaurantCIF) {
      setCifToValidate(restaurantCIF);
      loadCompanyData(restaurantCIF);
    } else {
      // Si el restaurante no tiene CIF, intentar con CIF por defecto basado en el sitio
      const siteNumber = currentRestaurant?.site_number;
      let defaultCIF = '';
      
      if (siteNumber === '633') {
        defaultCIF = 'B66176728'; // Sant Adrià 633 SL
      } else if (siteNumber === '1193') {
        defaultCIF = 'A09936527'; // Barcelona Tajo
      }
      
      if (defaultCIF) {
        console.log(`[RestaurantCompanyTab] Using default CIF for site ${siteNumber}:`, defaultCIF);
        setCifToValidate(defaultCIF);
        loadCompanyData(defaultCIF);
      }
    }
  }, [restaurantCIF, currentRestaurant?.site_number, loadCompanyData]);

  const handleValidateCIF = async () => {
    if (!cifToValidate.trim()) {
      toast.error('Por favor, introduce un CIF');
      return;
    }

    const result = await validateCIF(cifToValidate);
    if (result) {
      if (result.valid) {
        toast.success(result.message);
        // Cargar datos existentes si los hay
        await loadCompanyData(cifToValidate);
      } else {
        toast.error(result.message);
      }
    }
  };

  const handleEnrichData = async () => {
    if (!cifToValidate.trim()) {
      toast.error('Por favor, introduce un CIF válido');
      return;
    }

    console.log('[RestaurantCompanyTab] Enriching data for CIF:', cifToValidate, 'Restaurant ID:', restaurantId);
    try {
      const enrichedData = await enrichCompanyData(cifToValidate, restaurantId);
      console.log('[RestaurantCompanyTab] Enriched data received:', enrichedData);
      
      if (enrichedData) {
        setCompanyData(enrichedData);
        setLastSuccessfulCIF(cifToValidate);
        toast.success('Datos enriquecidos correctamente desde eInforma');
        
        // Recargar datos después de un breve delay para asegurar persistencia
        setTimeout(() => {
          console.log('[RestaurantCompanyTab] Reloading data after enrichment');
          loadCompanyData(cifToValidate);
        }, 1000);
      } else {
        toast.error('No se pudieron obtener datos de eInforma para este CIF');
      }
    } catch (error) {
      console.error('[RestaurantCompanyTab] Error enriching data:', error);
      toast.error('Error al enriquecer los datos. Inténtalo de nuevo.');
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  return (
    <div className="space-y-6">

      {/* Validación de CIF */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Validación de CIF
          </CardTitle>
          <CardDescription>
            Valida y enriquece los datos de la empresa mediante eInforma
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="cif-input">CIF de la empresa</Label>
              <Input
                id="cif-input"
                value={cifToValidate}
                onChange={(e) => setCifToValidate(e.target.value.toUpperCase())}
                placeholder="A12345674"
                maxLength={9}
                disabled={isValidating || isEnriching}
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={handleValidateCIF}
              disabled={isValidating || !cifToValidate.trim()}
              variant="outline"
            >
              {isValidating ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              Validar CIF
            </Button>
            
            <Button
              onClick={handleEnrichData}
              disabled={isEnriching || !cifToValidate.trim()}
            >
              {isEnriching ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Building2 className="h-4 w-4 mr-2" />
              )}
              Enriquecer Datos
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Datos de la empresa */}
      {isLoading ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
      ) : companyData ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Datos de la Empresa
              </CardTitle>
              <div className="flex gap-2">
                {companyData.validado_einforma ? (
                  <Badge variant="default" className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Validado eInforma
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Sin validar
                  </Badge>
                )}
              </div>
            </div>
            {companyData.fecha_ultima_actualizacion && (
              <CardDescription>
                Última actualización: {formatDate(companyData.fecha_ultima_actualizacion)}
              </CardDescription>
            )}
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Información básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">CIF</Label>
                <p className="text-sm font-mono">{companyData.cif}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Razón Social</Label>
                <p className="text-sm">{companyData.razon_social || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Nombre Comercial</Label>
                <p className="text-sm">{companyData.nombre_comercial || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Situación AEAT</Label>
                <p className="text-sm">{companyData.situacion_aeat || 'N/A'}</p>
              </div>
            </div>

            <Separator />

            {/* Información fiscal y jurídica */}
            <div>
              <h4 className="text-sm font-medium mb-3">Información Fiscal y Jurídica</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Forma Jurídica</Label>
                  <p className="text-sm">{companyData.forma_juridica || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Fecha Constitución</Label>
                  <p className="text-sm">{formatDate(companyData.fecha_constitucion)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Capital Social</Label>
                  <p className="text-sm">{formatCurrency(companyData.capital_social)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">CNAE</Label>
                  <p className="text-sm">
                    {companyData.codigo_cnae} - {companyData.descripcion_cnae || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Dirección */}
            <div>
              <h4 className="text-sm font-medium mb-3">Dirección Fiscal</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Label className="text-sm font-medium text-muted-foreground">Domicilio</Label>
                  <p className="text-sm">{companyData.domicilio_fiscal || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Código Postal</Label>
                  <p className="text-sm">{companyData.codigo_postal || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Municipio</Label>
                  <p className="text-sm">{companyData.municipio || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Provincia</Label>
                  <p className="text-sm">{companyData.provincia || 'N/A'}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Contacto */}
            <div>
              <h4 className="text-sm font-medium mb-3">Información de Contacto</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Teléfono</Label>
                  <p className="text-sm">{companyData.telefono || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                  <p className="text-sm">{companyData.email || 'N/A'}</p>
                </div>
                <div className="md:col-span-2">
                  <Label className="text-sm font-medium text-muted-foreground">Web</Label>
                  <p className="text-sm">{companyData.web || 'N/A'}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Datos financieros */}
            <div>
              <h4 className="text-sm font-medium mb-3">Datos Financieros (Estimados)</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Empleados</Label>
                  <p className="text-sm">{companyData.empleados_estimados || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Facturación</Label>
                  <p className="text-sm">{formatCurrency(companyData.facturacion_estimada)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Rating Crediticio</Label>
                  <p className="text-sm">{companyData.rating_crediticio || 'N/A'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : cifToValidate ? (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center space-y-2">
              <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">
                No se encontraron datos para el CIF: {cifToValidate}
              </p>
              <p className="text-xs text-muted-foreground">
                Haz clic en "Enriquecer Datos" para obtener información de eInforma
              </p>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
};