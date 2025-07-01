
import { describe, it, expect } from 'vitest';
import { render, screen } from './test-utils';

// Test básico para verificar que el sistema de testing funciona
describe('Basic Testing Setup', () => {
  it('should render a simple component', () => {
    const TestComponent = () => <div>Test Component</div>;
    
    render(<TestComponent />);
    
    expect(screen.getByText('Test Component')).toBeInTheDocument();
  });

  it('should handle basic assertions', () => {
    expect(true).toBe(true);
    expect('hello').toContain('ell');
    expect([1, 2, 3]).toHaveLength(3);
  });

  it('should work with async operations', async () => {
    const asyncFunction = () => Promise.resolve('async result');
    
    const result = await asyncFunction();
    expect(result).toBe('async result');
  });
});
