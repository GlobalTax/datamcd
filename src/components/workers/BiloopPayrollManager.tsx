import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Receipt, 
  Download, 
  Calendar,
  Euro,
  FileText,
  RefreshCw,
  Filter
} from 'lucide-react';
import { useBiloop } from '@/hooks/useBiloop';
import { useToast } from '@/hooks/use-toast';

interface BiloopPayrollManagerProps {
  selectedCompany: string;
}

export const BiloopPayrollManager: React.FC<BiloopPayrollManagerProps> = ({ selectedCompany }) => {
  const [payslips, setPayslips] = useState<any[]>([]);
  const [payrollConcepts, setPayrollConcepts] = useState<any[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [loading, setLoading] = useState(false);

  const { 
    getPayslips, 
    getPayrollConcepts, 
    getPayrollConceptsMonthBi,
    getSummaryPayslips 
  } = useBiloop();
  const { toast } = useToast();

  useEffect(() => {
    loadPayrollData();
  }, [selectedCompany]);

  const loadPayrollData = async () => {
    if (!selectedCompany) return;
    
    setLoading(true);
    try {
      // Cargar nóminas
      const payslipsData = await getPayslips(selectedCompany);
      setPayslips(Array.isArray(payslipsData) ? payslipsData : []);

      // Cargar conceptos de nómina
      const conceptsData = await getPayrollConcepts(selectedCompany);
      setPayrollConcepts(Array.isArray(conceptsData) ? conceptsData : []);

      toast({
        title: "Datos de nómina cargados",
        description: "Nóminas y conceptos actualizados correctamente",
      });
    } catch (error) {
      console.error('Error loading payroll data:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos de nómina",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMonthlyPayroll = async () => {
    if (!selectedCompany || !selectedMonth || !selectedYear) return;

    setLoading(true);
    try {
      const monthlyData = await getPayrollConceptsMonthBi(selectedCompany, selectedMonth);
      // Procesar datos mensuales
      toast({
        title: "Nóminas mensuales cargadas",
        description: `Datos de ${selectedMonth}/${selectedYear} cargados`,
      });
    } catch (error) {
      console.error('Error loading monthly payroll:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las nóminas mensuales",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadPayslip = async (payslipId: string) => {
    try {
      // Implementar descarga de nómina
      toast({
        title: "Descarga iniciada",
        description: "La nómina se está descargando",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo descargar la nómina",
        variant: "destructive",
      });
    }
  };

  if (loading && payslips.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Gestión de Nóminas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Payroll Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Control de Nóminas
          </CardTitle>
          <CardDescription>
            Gestión y consulta de nóminas por período
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
              <div>
                <label className="text-sm font-medium mb-2 block">Mes</label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar mes" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString().padStart(2, '0')}>
                        {new Date(2024, i).toLocaleDateString('es-ES', { month: 'long' })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Año</label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar año" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 5 }, (_, i) => {
                      const year = new Date().getFullYear() - i;
                      return (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button onClick={loadMonthlyPayroll} disabled={loading || !selectedMonth || !selectedYear}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Cargar Período
                </Button>
                <Button variant="outline" onClick={loadPayrollData} disabled={loading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Actualizar
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payslips Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Nóminas ({payslips.length})
            </span>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar Todo
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {payslips.length === 0 ? (
            <div className="text-center py-8">
              <Receipt className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No hay nóminas disponibles</p>
              <Button onClick={loadPayrollData} className="mt-4">
                <RefreshCw className="h-4 w-4 mr-2" />
                Cargar Nóminas
              </Button>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empleado</TableHead>
                    <TableHead>Período</TableHead>
                    <TableHead>Bruto</TableHead>
                    <TableHead>Neto</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payslips.map((payslip, index) => (
                    <TableRow key={payslip.id || index}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{payslip.empleado || `Empleado ${index + 1}`}</p>
                          <p className="text-sm text-muted-foreground">{payslip.dni}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {payslip.periodo || 'No especificado'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Euro className="h-4 w-4" />
                          {payslip.importeBruto || '0'} €
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Euro className="h-4 w-4" />
                          {payslip.importeNeto || '0'} €
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={payslip.estado === 'procesada' ? 'default' : 'secondary'}>
                          {payslip.estado || 'Pendiente'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => downloadPayslip(payslip.id)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payroll Concepts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Conceptos de Nómina ({payrollConcepts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {payrollConcepts.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No hay conceptos de nómina disponibles
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {payrollConcepts.slice(0, 9).map((concept, index) => (
                <Card key={concept.id || index}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{concept.nombre || `Concepto ${index + 1}`}</p>
                        <p className="text-sm text-muted-foreground">{concept.codigo}</p>
                      </div>
                      <Badge variant="outline">
                        {concept.tipo || 'General'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};