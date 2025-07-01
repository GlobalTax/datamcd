
# 🎨 Configuración de Formateo de Código

Este proyecto utiliza **Prettier** para mantener un estilo de código consistente en todo el proyecto.

## 📋 Configuración

La configuración de Prettier se encuentra en `.prettierrc`:

```json
{
  "semi": true,
  "trailingComma": "es5", 
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "bracketSameLine": false,
  "arrowParens": "avoid",
  "endOfLine": "lf",
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

## 🚀 Comandos Disponibles

Debido a las restricciones del proyecto, los scripts deben ejecutarse manualmente:

```bash
# Formatear todo el código del proyecto
node scripts/format-all.js

# Formatear archivos específicos
npx prettier --write "src/**/*.tsx"

# Verificar formato sin modificar archivos
npx prettier --check "src/**/*.{ts,tsx}"

# Formatear un archivo específico
npx prettier --write src/components/MyComponent.tsx
```

## ✨ Características

### 🎯 Ordenamiento Automático de Clases Tailwind
El plugin `prettier-plugin-tailwindcss` ordena automáticamente las clases de Tailwind CSS:

```tsx
// Antes
<div className="text-white bg-blue-500 p-4 rounded-lg shadow-md hover:bg-blue-600">

// Después  
<div className="rounded-lg bg-blue-500 p-4 text-white shadow-md hover:bg-blue-600">
```

### 📏 Configuración de Estilo
- **Semicolons**: Siempre se incluyen (`;`)
- **Comillas**: Simples (`'`) en lugar de dobles (`"`)
- **Ancho de línea**: 80 caracteres máximo
- **Indentación**: 2 espacios (no tabs)
- **Trailing commas**: Solo en ES5 (arrays, objetos)

## 🔧 Integración con Editor

### VS Code
Crea `.vscode/settings.json` para formato automático:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

## 🚫 Archivos Excluidos

Los siguientes archivos/carpetas están excluidos del formateo (ver `.prettierignore`):

- `node_modules/`
- `dist/` y `build/`
- Archivos de configuración (`*.config.js`, `*.config.ts`)
- Archivos generados por Supabase
- Archivos minificados (`*.min.*`)

## 📝 Mejores Prácticas

1. **Ejecuta el formateo antes de hacer commit**:
   ```bash
   node scripts/format-all.js
   ```

2. **Para archivos específicos**:
   ```bash
   npx prettier --write src/pages/DashboardPage.tsx
   ```

3. **Verifica el formato antes de enviar cambios**:
   ```bash
   npx prettier --check "src/**/*.{ts,tsx}"
   ```

## 🔄 Workflow Recomendado

1. Escribe tu código normalmente
2. Antes de hacer commit: `node scripts/format-all.js`
3. Revisa los cambios de formato
4. Haz commit con el código formateado

## 🎯 Beneficios

- ✅ **Consistencia**: Todo el equipo usa el mismo estilo
- ✅ **Productividad**: No más debates sobre formato
- ✅ **Legibilidad**: Código más fácil de leer y mantener
- ✅ **Tailwind**: Clases CSS ordenadas automáticamente
- ✅ **Integración**: Compatible con ESLint existente

---

*Para más información sobre Prettier, visita: https://prettier.io/*
