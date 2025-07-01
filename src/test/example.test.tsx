
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/hooks/useAuth';
import { DashboardSummary } from '@/components/dashboard/DashboardSummary';

// Custom render function with providers
const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {ui}
      </AuthProvider>
    </BrowserRouter>
  );
};

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

    renderWithProviders(
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
    renderWithProviders(
      <DashboardSummary 
        totalRestaurants={0} 
        displayRestaurants={[]}
        isTemporaryData={true}
      />
    );

    expect(screen.getByText('Trabajando con datos temporales')).toBeInTheDocument();
  });
});
