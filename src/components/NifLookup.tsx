import { useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useCompanyLookup, type CompanyData } from '@/hooks/useCompanyLookup';

interface NifLookupProps {
  onCompanyFound?: (company: CompanyData) => void;
  className?: string;
}

export const NifLookup = ({ onCompanyFound, className }: NifLookupProps) => {
  const [nif, setNif] = useState('');
  const [foundCompany, setFoundCompany] = useState<CompanyData | null>(null);
  const { lookupCompany, isLoading } = useCompanyLookup();

  // Real-time format validation
  const validateNifFormat = (value: string): boolean => {
    const cleanValue = value.trim().toUpperCase();
    
    // NIF: 8 digits + letter
    const nifRegex = /^[0-9]{8}[TRWAGMYFPDXBNJZSQVHLCKE]$/;
    // CIF: letter + 7 digits + digit/letter
    const cifRegex = /^[ABCDEFGHJNPQRSUVW][0-9]{7}[0-9A-J]$/;
    // NIE: X/Y/Z + 7 digits + letter
    const nieRegex = /^[XYZ][0-9]{7}[TRWAGMYFPDXBNJZSQVHLCKE]$/;
    
    return nifRegex.test(cleanValue) || cifRegex.test(cleanValue) || nieRegex.test(cleanValue);
  };

  const handleSearch = async () => {
    const company = await lookupCompany(nif);
    if (company) {
      setFoundCompany(company);
      onCompanyFound?.(company);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && nif && validateNifFormat(nif)) {
      handleSearch();
    }
  };

  const isValidFormat = nif ? validateNifFormat(nif) : true;

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Búsqueda de Empresa
          </CardTitle>
          <CardDescription>
            Introduce un NIF, CIF o NIE para buscar información de la empresa
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder="Ej: B67261552, 12345678Z, X1234567L"
                value={nif}
                onChange={(e) => setNif(e.target.value.toUpperCase())}
                onKeyPress={handleKeyPress}
                className={!isValidFormat ? 'border-destructive' : ''}
              />
              <Button 
                onClick={handleSearch}
                disabled={!nif || !isValidFormat || isLoading}
                className="min-w-[100px]"
              >
                {isLoading ? 'Buscando...' : 'Buscar'}
              </Button>
            </div>
            
            {nif && !isValidFormat && (
              <p className="text-sm text-destructive">
                Formato inválido. Use: NIF (12345678Z), CIF (B12345678) o NIE (X1234567L)
              </p>
            )}
          </div>

          {foundCompany && (
            <>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">{foundCompany.name}</h3>
                  <div className="flex gap-2">
                    <Badge variant={foundCompany.status === 'activo' ? 'default' : 'secondary'}>
                      {foundCompany.status}
                    </Badge>
                    {foundCompany.is_mock && (
                      <Badge variant="outline" className="text-xs">
                        Datos simulados
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="font-medium">NIF/CIF:</span> {foundCompany.nif}
                  </div>
                  
                  {foundCompany.business_sector && (
                    <div>
                      <span className="font-medium">Sector:</span> {foundCompany.business_sector}
                    </div>
                  )}
                  
                  {foundCompany.address_street && (
                    <div className="md:col-span-2">
                      <span className="font-medium">Dirección:</span> {foundCompany.address_street}
                      {foundCompany.address_city && `, ${foundCompany.address_city}`}
                      {foundCompany.address_postal_code && ` (${foundCompany.address_postal_code})`}
                    </div>
                  )}
                  
                  {foundCompany.legal_representative && (
                    <div className="md:col-span-2">
                      <span className="font-medium">Representante legal:</span> {foundCompany.legal_representative}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};