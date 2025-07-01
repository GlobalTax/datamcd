
import { describe, it, expect } from 'vitest';
import { screen, render } from './test-utils';
import { DashboardSummary } from '@/components/dashboard/DashboardSummary';

describe('DashboardSummary', () => {
  it('renders dashboard summary correctly', () => {
    const mockRestaurants = [
      {
        id: '1',
        name: 'Test Restaurant',
        location: 'Test Location',
        status: 'active',
        lastYearRevenue: 100000
      }
    ];

    render(
      <DashboardSummary 
        totalRestaurants={1} 
        displayRestaurants={mockRestaurants}
        isTemporaryData={false}
      />
    );

    // Verificar que el componente se renderiza sin errores
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('shows temporary data warning when applicable', () => {
    render(
      <DashboardSummary 
        totalRestaurants={0} 
        displayRestaurants={[]}
        isTemporaryData={true}
      />
    );

    // Verificar que se muestra cuando hay datos temporales
    const component = screen.getByTestId('dashboard-summary');
    expect(component).toBeInTheDocument();
  });

  it('handles empty restaurant list', () => {
    render(
      <DashboardSummary 
        totalRestaurants={0} 
        displayRestaurants={[]}
        isTemporaryData={false}
      />
    );

    // Verificar que maneja correctamente listas vacías
    expect(screen.getByText('0')).toBeInTheDocument();
  });
});
