
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

### Uso Manual (Recomendado actualmente)
```bash
# Ejecutar todos los tests
npx vitest

# Ejecutar tests en modo watch
npx vitest --watch

# Ejecutar tests con interfaz web
npx vitest --ui

# Generar reporte de cobertura
npx vitest --coverage
```

### Scripts NPM (Si package.json permite modificaciones)
```bash
# Una vez configurado package.json:
npm run test
npm run test:watch  
npm run test:ui
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

### Tests Incluidos
- `src/test/basic.test.tsx` - Tests básicos para verificar el setup
- `src/test/example.test.tsx` - Ejemplo con componente DashboardSummary

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

## ✅ Verificar Instalación

Ejecuta este comando para confirmar que todo funciona:
```bash
npx vitest src/test/basic.test.tsx
```

Si ves que todos los tests pasan, la configuración está correcta.

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

---

*Para más información sobre Testing Library: https://testing-library.com/docs/react-testing-library/intro/*
