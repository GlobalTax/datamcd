
# 🧪 Comandos de Testing Manual

Debido a que no se pueden modificar automáticamente los scripts en package.json, aquí tienes los comandos que puedes ejecutar manualmente:

## 📋 Comandos Disponibles

### Ejecutar todos los tests
```bash
npx vitest
```

### Ejecutar tests en modo watch (se reinician automáticamente)
```bash
npx vitest --watch
```

### Ejecutar tests con interfaz web
```bash
npx vitest --ui
```

### Generar reporte de cobertura
```bash
npx vitest --coverage
```

### Ejecutar un test específico
```bash
npx vitest src/test/basic.test.tsx
```

### Ejecutar tests con más detalles
```bash
npx vitest --reporter=verbose
```

## 🔧 Para agregar permanentemente los scripts

Si tienes acceso para editar package.json, agrega estas líneas en la sección "scripts":

```json
{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest --watch", 
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

Después podrás usar:
- `npm run test`
- `npm run test:watch`
- `npm run test:ui`
- `npm run test:coverage`

## ✅ Verificar que todo funciona

Ejecuta este comando para probar la configuración:
```bash
npx vitest src/test/basic.test.tsx
```

Si todo está bien configurado, deberías ver que todos los tests pasan exitosamente.
