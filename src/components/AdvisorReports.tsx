import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { showError } from '@/utils/notifications';

interface Report {
  id: string;
  title: string;
  description: string;
  createdAt: string;
}

const AdvisorReports = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchReports = async () => {
    try {
      setLoading(true);
      // Simulación de la obtención de reportes desde una API o base de datos
      const mockReports: Report[] = [
        {
          id: '1',
          title: 'Reporte de Ventas Mensual',
          description: 'Resumen de las ventas del mes actual.',
          createdAt: '2024-07-21T10:00:00Z',
        },
        {
          id: '2',
          title: 'Análisis de Costos Operativos',
          description: 'Detalle de los costos operativos y recomendaciones.',
          createdAt: '2024-07-15T14:30:00Z',
        },
        {
          id: '3',
          title: 'Informe de Satisfacción del Cliente',
          description: 'Resultados de las encuestas de satisfacción del cliente.',
          createdAt: '2024-07-01T09:00:00Z',
        },
      ];
      setReports(mockReports);
    } catch (error) {
      console.error('Error fetching reports:', error);
      showError('Error al cargar los reportes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reportes de Asesores</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Cargando reportes...</p>
        ) : (
          <ul>
            {reports.map((report) => (
              <li key={report.id} className="mb-4">
                <h3 className="text-lg font-semibold">{report.title}</h3>
                <p className="text-gray-600">{report.description}</p>
                <p className="text-sm text-gray-500">
                  Fecha de creación: {new Date(report.createdAt).toLocaleDateString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default AdvisorReports;
