
# 🔧 Solución de Problemas de Autenticación

## 📋 Resumen de Problemas Identificados

### 1. **Múltiples Sistemas de Autenticación Conflictuantes**
- `useAuth` (sistema principal)
- `useFastAuth` (sistema alternativo)
- `useOptimizedAuth` (sistema optimizado)

### 2. **Problemas en el AuthProvider Principal**
- Llamadas duplicadas a `fetchUserData`
- Race conditions entre verificación inicial y listener
- Manejo inconsistente de estados de carga

### 3. **Problemas de Base de Datos**
- Timeouts frecuentes en consultas
- Falta de índices optimizados
- Consultas complejas que pueden fallar

### 4. **Problemas de RLS (Row Level Security)**
- Políticas recursivas
- Función `get_current_user_role()` que puede fallar
- Conflicto entre roles `'asesor'` y `'advisor'`

## 🛠️ Soluciones Implementadas

### 1. **AuthProvider Simplificado** ✅
- **Archivo**: `src/hooks/useAuth.tsx`
- **Cambios**:
  - Eliminación de llamadas duplicadas
  - Uso de `useCallback` para optimizar funciones
  - Mejor manejo de race conditions
  - Logging mejorado para debugging

### 2. **Fetcher de Datos Optimizado** ✅
- **Archivo**: `src/hooks/auth/useUserDataFetcher.tsx`
- **Cambios**:
  - Implementación de timeouts para consultas
  - Manejo de errores más robusto
  - Mejor logging para debugging
  - Continuación graceful en caso de errores

### 3. **Hook de Autenticación Simplificado** ✅
- **Archivo**: `src/hooks/useSimpleAuth.tsx`
- **Características**:
  - Sistema más simple y robusto
  - Mejor manejo de errores
  - Logging detallado
  - Manejo de casos edge

### 4. **Componente de Debug** ✅
- **Archivo**: `src/components/debug/AuthDebugger.tsx`
- **Características**:
  - Diagnóstico completo del sistema de autenticación
  - Verificación de sesión, usuario, perfil, franquiciado
  - Detección de errores de RLS
  - Interfaz visual para debugging

## 🚀 Pasos para Implementar las Soluciones

### Paso 1: Usar el Componente de Debug
```tsx
import { AuthDebugger } from '@/components/debug/AuthDebugger';

// En cualquier página para debugging
<AuthDebugger />
```

### Paso 2: Migrar a useSimpleAuth (Opcional)
Si los problemas persisten, puedes migrar al hook simplificado:

```tsx
// En lugar de useAuth, usar useSimpleAuth
import { useSimpleAuth } from '@/hooks/useSimpleAuth';

const { user, franchisee, restaurants, loading, signIn, signOut } = useSimpleAuth();
```

### Paso 3: Verificar Logs en Consola
Los nuevos hooks incluyen logging detallado. Busca en la consola del navegador:
- `AuthProvider -`
- `useUserDataFetcher -`
- `useAuthActions -`
- `useSimpleAuth -`

## 🔍 Diagnóstico de Problemas

### Problemas Comunes y Soluciones

#### 1. **Error: "Perfil de usuario no encontrado"**
- **Causa**: El trigger `handle_new_user` no se ejecutó correctamente
- **Solución**: Verificar que el trigger esté activo en Supabase

#### 2. **Error: "Timeout after Xms"**
- **Causa**: Consultas lentas o problemas de red
- **Solución**: Verificar índices de base de datos y conexión

#### 3. **Error: "RLS policy violation"**
- **Causa**: Políticas RLS mal configuradas
- **Solución**: Aplicar la migración de corrección de RLS

#### 4. **Usuario no se carga después del login**
- **Causa**: Race condition en el AuthProvider
- **Solución**: Usar el AuthProvider corregido o migrar a useSimpleAuth

## 📊 Comparación de Hooks

### useAuth (Actual)
- ✅ Sistema completo con provider
- ✅ Integración con componentes existentes
- ❌ Lógica compleja y distribuida
- ❌ Posibles race conditions

### useSimpleAuth (Nuevo)
- ✅ Lógica centralizada
- ✅ Mejor manejo de errores
- ✅ Más simple de debuggear
- ❌ Requiere migración de componentes

## 🔧 Herramientas de Debug

### AuthDebugger
El componente `AuthDebugger` proporciona:
- Estado actual del hook de autenticación
- Información de sesión de Supabase
- Datos de perfil y franquiciado
- Lista de errores detectados
- Estado de RLS

### Console Logs
Todos los hooks incluyen logging detallado:
```javascript
// Ejemplo de logs
useSimpleAuth - Initializing auth
useSimpleAuth - Found existing session
useSimpleAuth - Loading user data for: 12345
useSimpleAuth - User data loaded successfully
```

## 🆘 Resolución de Problemas

### Si el login no funciona:
1. Verificar que el usuario existe en Supabase Auth
2. Verificar que el perfil se creó correctamente
3. Revisar políticas RLS en la tabla profiles

### Si los datos no se cargan:
1. Usar AuthDebugger para ver qué falla
2. Verificar logs en la consola
3. Verificar permisos RLS en las tablas

### Si hay errores de timeout:
1. Verificar conexión a internet
2. Verificar estado de Supabase
3. Considerar aumentar timeouts en useUserDataFetcher

## 📝 Notas de Migración

### Para migrar a useSimpleAuth:

1. **Reemplazar import**:
```tsx
// Antes
import { useAuth } from '@/hooks/useAuth';

// Después
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
```

2. **Actualizar uso**:
```tsx
// La API es idéntica
const { user, franchisee, restaurants, loading, signIn, signOut } = useSimpleAuth();
```

3. **Remover AuthProvider** (opcional):
```tsx
// Si migras completamente, puedes remover el AuthProvider
// y usar useSimpleAuth directamente en componentes
```

## 🔐 Seguridad

- Todos los hooks manejan la autenticación de forma segura
- Las consultas respetan las políticas RLS
- Los errores se manejan sin exponer información sensible
- Los tokens se gestionan automáticamente por Supabase

## 📈 Rendimiento

- useSimpleAuth es más eficiente al centralizar la lógica
- Los timeouts previenen bloqueos indefinidos
- El caching de datos reduce consultas innecesarias
- Los logs pueden deshabilitarse en producción

---

**Nota**: Este documento debe actualizarse conforme se implementen nuevas mejoras o se identifiquen nuevos problemas.
