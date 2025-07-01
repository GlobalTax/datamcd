
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

    expect(screen.getByText('Restaurantes Totales')).toBeInTheDocument();
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

    expect(screen.getByText('Trabajando con datos temporales')).toBeInTheDocument();
  });
});
