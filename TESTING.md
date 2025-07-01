
# 🧪 Guía de Testing

Este proyecto utiliza **Vitest** con **Testing Library** para realizar pruebas unitarias y de integración.

## 📋 Configuración

### Dependencias Instaladas
- `vitest` - Framework de testing rápido
- `jsdom` - Entorno DOM para testing
- `@vitest/ui` - Interfaz web para ejecutar tests
- `@testing-library/react` - Utilidades para testing de React
- `@testing-library/jest-dom` - Matchers adicionales para DOM
- `@testing-library/user-event` - Simulación de eventos de usuario

### Archivos de Configuración
- `vitest.config.ts` - Configuración principal de Vitest
- `src/test/setup.ts` - Setup global y mocks
- `src/test/test-utils.tsx` - Utilidades personalizadas de testing
- `tsconfig.test.json` - Configuración TypeScript para tests

## 🚀 Comandos Disponibles

```bash
# Ejecutar todos los tests
npm run test

# Ejecutar tests en modo watch
npm run test:watch

# Ejecutar tests con interfaz web
npm run test:ui

# Generar reporte de cobertura
npm run test:coverage
```

## 📝 Escribiendo Tests

### Estructura Básica
```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { MiComponente } from '@/components/MiComponente';

describe('MiComponente', () => {
  it('debe renderizar correctamente', () => {
    render(<MiComponente />);
    expect(screen.getByText('Texto esperado')).toBeInTheDocument();
  });
});
```

### Testing de Componentes con Context
Usa `render` de `test-utils.tsx` que incluye todos los providers necesarios:

```typescript
import { render, screen } from '@/test/test-utils';

// Automáticamente incluye AuthProvider y BrowserRouter
render(<ComponenteQueUsaAuth />);
```

### Mocking de Servicios
Los mocks principales están configurados en `setup.ts`:
- Supabase client
- React Router hooks
- APIs del navegador (ResizeObserver, IntersectionObserver)

### Ejemplo de Test de Interacción
```typescript
import { render, screen, fireEvent } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';

it('debe manejar click del usuario', async () => {
  const user = userEvent.setup();
  render(<MiBoton />);
  
  await user.click(screen.getByRole('button'));
  expect(screen.getByText('Clickeado')).toBeInTheDocument();
});
```

## 🎯 Mejores Prácticas

### 1. Usar getByRole cuando sea posible
```typescript
// ✅ Bueno
screen.getByRole('button', { name: 'Guardar' });

// ❌ Evitar
screen.getByTestId('save-button');
```

### 2. Testing de Comportamiento, no Implementación
```typescript
// ✅ Bueno - Testa el comportamiento
expect(screen.getByText('Usuario guardado exitosamente')).toBeInTheDocument();

// ❌ Evitar - Testa implementación
expect(mockSaveUser).toHaveBeenCalledWith({ name: 'Juan' });
```

### 3. Arrange, Act, Assert
```typescript
it('debe calcular el total correctamente', () => {
  // Arrange
  const items = [{ price: 10 }, { price: 20 }];
  
  // Act
  render(<CarritoCompras items={items} />);
  
  // Assert
  expect(screen.getByText('Total: €30')).toBeInTheDocument();
});
```

## 📊 Cobertura de Código

La cobertura se genera en la carpeta `coverage/` con reportes en:
- HTML: `coverage/index.html`
- JSON: `coverage/coverage-final.json`
- Texto: Mostrado en consola

### Objetivo de Cobertura
- **Componentes críticos**: 90%+
- **Utilidades**: 85%+
- **Hooks personalizados**: 80%+

## 🔧 Configuración Personalizada

### Variables de Entorno para Tests
Crea `.env.test` para variables específicas de testing:
```
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=test-key
```

### Mocks Personalizados
Para crear mocks específicos de componentes:

```typescript
// En tu archivo de test
import { vi } from 'vitest';

vi.mock('@/components/ComponenteComplejo', () => ({
  ComponenteComplejo: () => <div>Mock Component</div>
}));
```

## 🐛 Debugging Tests

### Debug en VS Code
1. Instala la extensión "Vitest"
2. Usa breakpoints directamente en el código
3. Ejecuta tests en modo debug

### Debug Manual
```typescript
import { screen } from '@testing-library/react';

// Ver el DOM actual
screen.debug();

// Ver un elemento específico
screen.debug(screen.getByRole('button'));
```

## 📁 Estructura de Archivos de Test

```
src/
├── test/
│   ├── setup.ts              # Setup global
│   ├── test-utils.tsx        # Utilidades personalizadas
│   └── example.test.tsx      # Ejemplos
├── components/
│   ├── Component.tsx
│   └── Component.test.tsx    # Tests junto al componente
└── hooks/
    ├── useHook.tsx
    └── useHook.test.tsx      # Tests junto al hook
```

---

*Para más información sobre Testing Library: https://testing-library.com/docs/react-testing-library/intro/*
