
# 🔐 Sistema de Autenticación - Documentación Completa

## 📋 Índice
1. [Arquitectura del Sistema](#arquitectura-del-sistema)
2. [Instalación y Configuración](#instalación-y-configuración)
3. [Hooks de Autenticación](#hooks-de-autenticación)
4. [Herramientas de Diagnóstico](#herramientas-de-diagnóstico)
5. [Solución de Problemas](#solución-de-problemas)
6. [Guías de Migración](#guías-de-migración)
7. [Mejores Prácticas](#mejores-prácticas)
8. [Monitoreo y Mantenimiento](#monitoreo-y-mantenimiento)
9. [Referencia de API](#referencia-de-api)
10. [Casos de Uso](#casos-de-uso)

---

## 🏗️ Arquitectura del Sistema

### Sistemas Disponibles

#### 1. **useAuth** (Sistema Principal) - ✅ RECOMENDADO
- **Archivo**: `src/hooks/useAuth.tsx`
- **Características**:
  - Sistema completo con AuthProvider
  - Integración con componentes existentes
  - Manejo optimizado de race conditions
  - Logging detallado para debugging
  - Timeouts para consultas de base de datos

#### 2. **useSimpleAuth** (Sistema Alternativo) - ✅ ESTABLE
- **Archivo**: `src/hooks/useSimpleAuth.tsx`
- **Características**:
  - Lógica centralizada y simplificada
  - Mejor manejo de errores
  - Más fácil de debuggear
  - No requiere AuthProvider
  - Ideal para casos complejos o debugging

#### 3. **useFastAuth** y **useOptimizedAuth** (Sistemas de Respaldo)
- Para casos especiales o pruebas de rendimiento
- Mantienen compatibilidad con la API principal

### Componentes de Soporte

#### AuthProvider
- **Archivo**: `src/hooks/useAuth.tsx`
- Maneja el estado global de autenticación
- Configura listeners de Supabase
- Previene race conditions

#### UserDataFetcher
- **Archivo**: `src/hooks/auth/useUserDataFetcher.tsx`
- Optimizado con timeouts (8-10 segundos)
- Manejo graceful de errores
- Soporte para datos de franquiciado y restaurantes

#### AuthActions
- **Archivo**: `src/hooks/auth/useAuthActions.tsx`
- Acciones de login, logout, y registro
- Mensajes de error localizados en español
- Manejo específico de errores de Supabase

---

## 🚀 Instalación y Configuración

### Prerequisitos
- Proyecto Supabase configurado
- Autenticación habilitada en Supabase
- Tablas `profiles`, `franchisees`, y `franchisee_restaurants` creadas

### Paso 1: Aplicar Migraciones SQL
La migración principal se encuentra en `supabase/migrations/20250701141449-5b9f093b-efdb-4473-8924-8b949c4d6114.sql`

```bash
# Si usas Supabase CLI
supabase db push

# O aplica manualmente en el Dashboard de Supabase
```

### Paso 2: Configurar AuthProvider
```tsx
// En tu App.tsx o componente raíz
import { AuthProvider } from '@/hooks/useAuth';

function App() {
  return (
    <AuthProvider>
      {/* Tu aplicación */}
    </AuthProvider>
  );
}
```

### Paso 3: Usar el Hook en Componentes
```tsx
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const { user, franchisee, restaurants, loading, signIn, signOut } = useAuth();
  
  if (loading) return <div>Cargando...</div>;
  
  return (
    <div>
      {user ? (
        <div>Bienvenido, {user.full_name}</div>
      ) : (
        <button onClick={() => signIn(email, password)}>
          Iniciar Sesión
        </button>
      )}
    </div>
  );
}
```

---

## 🎣 Hooks de Autenticación

### useAuth (Principal)
```tsx
const {
  user,          // Usuario actual (User | null)
  session,       // Sesión de Supabase (Session | null)
  franchisee,    // Datos del franquiciado (Franchisee | null)
  restaurants,   // Lista de restaurantes (Restaurant[])
  loading,       // Estado de carga (boolean)
  signIn,        // Función de login
  signUp,        // Función de registro
  signOut,       // Función de logout
  refreshData    // Función para refrescar datos
} = useAuth();
```

### useSimpleAuth (Alternativo)
```tsx
const {
  user,
  franchisee,
  restaurants,
  loading,
  error,           // Estado de error (string | null)
  isAuthenticated, // Estado de autenticación (boolean)
  signIn,
  signOut,
  refreshData
} = useSimpleAuth();
```

---

## 🔍 Herramientas de Diagnóstico

### SimpleAuthDebugger
Componente visual para diagnóstico completo del sistema:

```tsx
import SimpleAuthDebugger from '@/components/debug/SimpleAuthDebugger';

// En cualquier página para debugging
function DebugPage() {
  return <SimpleAuthDebugger />;
}
```

**Características**:
- Estado actual del usuario y sesión
- Información de franquiciado y restaurantes
- Botones para refrescar datos y cerrar sesión
- Interfaz visual clara y organizada

### AuthDebugger (Versión Completa)
Para diagnóstico técnico detallado:

```tsx
import { AuthDebugger } from '@/components/debug/AuthDebugger';

// Para debugging técnico avanzado
function TechnicalDebug() {
  return <AuthDebugger />;
}
```

**Características**:
- Datos JSON completos de Supabase
- Verificación de políticas RLS
- Detección de errores específicos
- Información de sesión técnica

---

## 🛠️ Solución de Problemas

### Problemas Comunes

#### 1. **Error: "Perfil de usuario no encontrado"**
**Síntomas**: Usuario se autentica pero no aparecen datos
**Causa**: El trigger `handle_new_user` no funcionó
**Solución**:
```sql
-- Verificar que el trigger existe
SELECT * FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Si no existe, recrearlo
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

#### 2. **Error: "Timeout after Xms"**
**Síntomas**: Consultas que nunca terminan
**Causa**: Problemas de red o consultas complejas
**Solución**:
- Verificar conexión a internet
- Revisar índices en Supabase
- Usar `useSimpleAuth` como alternativa

#### 3. **Error: "RLS policy violation"**
**Síntomas**: Usuarios no pueden acceder a sus datos
**Causa**: Políticas RLS mal configuradas
**Solución**: Aplicar la migración SQL más reciente

#### 4. **Race Conditions en AuthProvider**
**Síntomas**: Datos que aparecen y desaparecen
**Causa**: Múltiples llamadas simultáneas
**Solución**: El sistema actual maneja esto automáticamente

### Debugging con Logs de Consola

Los hooks incluyen logging detallado. Busca estos prefijos:

```javascript
// useAuth y AuthProvider
"AuthProvider - Initializing auth system"
"AuthProvider - User data loaded successfully"

// useUserDataFetcher
"useUserDataFetcher - Fetching user data for: [ID]"
"useUserDataFetcher - Successfully loaded data"

// useSimpleAuth
"useSimpleAuth - Initializing auth"
"useSimpleAuth - Loading user data for: [ID]"

// useAuthActions
"useAuthActions - Attempting login for: [email]"
"useAuthActions - Sign in successful"
```

---

## 🔄 Guías de Migración

### De useAuth a useSimpleAuth

#### Razones para Migrar:
- Problemas persistentes con el sistema principal
- Necesidad de mayor control sobre el estado
- Debugging más fácil
- Lógica más centralizada

#### Pasos de Migración:

1. **Cambiar el import**:
```tsx
// Antes
import { useAuth } from '@/hooks/useAuth';

// Después
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
```

2. **Actualizar el hook**:
```tsx
// La API es idéntica, no necesitas cambiar el resto del código
const { user, franchisee, restaurants, loading, signIn, signOut } = useSimpleAuth();
```

3. **Remover AuthProvider** (opcional):
```tsx
// Si migras completamente, puedes quitar el AuthProvider
// useSimpleAuth no lo necesita
function App() {
  return (
    // Sin AuthProvider
    <YourApp />
  );
}
```

### Migración Gradual
Puedes usar ambos sistemas simultáneamente durante la migración:

```tsx
// En componentes que funcionan bien
const auth = useAuth();

// En componentes problemáticos
const auth = useSimpleAuth();
```

---

## ✅ Mejores Prácticas

### 1. Manejo de Estados de Carga
```tsx
function MyComponent() {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!user) {
    return <LoginForm />;
  }
  
  return <AuthenticatedContent />;
}
```

### 2. Manejo de Errores
```tsx
function LoginComponent() {
  const { signIn } = useAuth();
  const [error, setError] = useState('');
  
  const handleLogin = async (email, password) => {
    const result = await signIn(email, password);
    if (result.error) {
      setError(result.error);
    }
  };
  
  return (
    <form onSubmit={handleLogin}>
      {error && <div className="error">{error}</div>}
      {/* Campos del formulario */}
    </form>
  );
}
```

### 3. Debugging en Desarrollo
```tsx
// Solo en desarrollo
if (process.env.NODE_ENV === 'development') {
  console.log('Auth state:', { user, loading, franchisee });
}
```

### 4. Optimización de Re-renders
```tsx
// Usa useMemo para datos derivados
const userDisplayName = useMemo(() => {
  return user?.full_name || user?.email || 'Usuario';
}, [user]);
```

---

## 📊 Monitoreo y Mantenimiento

### Métricas Importantes

#### 1. **Tiempo de Autenticación**
- Tiempo desde login hasta datos cargados
- Meta: < 3 segundos en condiciones normales

#### 2. **Tasa de Errores**
- Porcentaje de logins fallidos
- Errores de timeout en consultas
- Violaciones de RLS

#### 3. **Rendimiento de Consultas**
- Tiempo de carga de perfil: < 1 segundo
- Tiempo de carga de franquiciado: < 2 segundos  
- Tiempo de carga de restaurantes: < 3 segundos

### Logs a Monitorear

#### Errores Críticos:
```javascript
// Buscar estos patrones en logs
"Critical error:"
"Timeout after"
"RLS policy violation"
"Profile fetch error:"
```

#### Información de Rendimiento:
```javascript
// Patrones de rendimiento
"Successfully loaded data:"
"User data loaded successfully"
"Auth state change:"
```

### Optimizaciones Automáticas

El sistema incluye:
- **Timeouts automáticos** para evitar bloqueos
- **Retry logic** en consultas críticas
- **Caching** de datos de usuario
- **Debouncing** de actualizaciones de estado

---

## 📚 Referencia de API

### Tipos TypeScript

```typescript
interface User {
  id: string;
  email: string;
  full_name?: string;
  role: 'franchisee' | 'asesor' | 'admin' | 'superadmin' | 'manager' | 'asistente';
  phone?: string;
  created_at: string;
  updated_at: string;
}

interface Franchisee {
  id: string;
  user_id: string;
  franchisee_name: string;
  company_name?: string;
  tax_id?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  total_restaurants?: number;
  created_at: string;
  updated_at: string;
  profiles: {
    email: string;
    phone?: string;
    full_name: string;
  };
  hasAccount: boolean;
  isOnline: boolean;
  lastAccess: string;
}

interface Restaurant {
  id: string;
  franchisee_id: string;
  site_number: string;
  restaurant_name: string;
  address: string;
  city: string;
  state?: string;
  postal_code?: string;
  country?: string;
  opening_date?: string;
  restaurant_type: 'traditional' | 'express' | 'delivery';
  status: 'active' | 'inactive' | 'pending' | 'closed';
  square_meters?: number;
  seating_capacity?: number;
  created_at: string;
  updated_at: string;
}
```

### Funciones de Autenticación

```typescript
// useAuth y useSimpleAuth
signIn(email: string, password: string): Promise<{ error?: string }>
signUp(email: string, password: string, fullName: string): Promise<{ error?: string }>
signOut(): Promise<void>
refreshData(): Promise<void>
```

---

## 🎯 Casos de Uso

### Caso 1: Usuario Franquiciado Básico
```tsx
function FranchiseeView() {
  const { user, franchisee, restaurants, loading } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  
  return (
    <div>
      <h1>Bienvenido, {franchisee?.franchisee_name}</h1>
      <div>Restaurantes: {restaurants.length}</div>
      <RestaurantList restaurants={restaurants} />
    </div>
  );
}
```

### Caso 2: Manejo de Múltiples Roles
```tsx
function RoleBasedView() {
  const { user } = useAuth();
  
  switch (user?.role) {
    case 'admin':
    case 'superadmin':
      return <AdminDashboard />;
    case 'asesor':
      return <AdvisorDashboard />;
    case 'franchisee':
      return <FranchiseeDashboard />;
    default:
      return <AccessDenied />;
  }
}
```

### Caso 3: Debugging en Producción
```tsx
function DebugToggle() {
  const [showDebug, setShowDebug] = useState(false);
  
  return (
    <div>
      {/* Solo mostrar en desarrollo o para admins */}
      {(process.env.NODE_ENV === 'development' || user?.role === 'admin') && (
        <button onClick={() => setShowDebug(!showDebug)}>
          {showDebug ? 'Ocultar' : 'Mostrar'} Debug
        </button>
      )}
      
      {showDebug && <SimpleAuthDebugger />}
    </div>
  );
}
```

### Caso 4: Fallback para Datos Faltantes
```tsx
function SafeUserDisplay() {
  const { user, franchisee, loading } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  
  return (
    <div>
      <h1>
        {franchisee?.franchisee_name || 
         user?.full_name || 
         user?.email || 
         'Usuario'}
      </h1>
      
      {!franchisee && user?.role === 'franchisee' && (
        <div className="warning">
          Datos de franquiciado pendientes de configuración
        </div>
      )}
    </div>
  );
}
```

---

## 🔧 Configuración Avanzada

### Variables de Entorno
```bash
# .env.local (no incluir en el repositorio)
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Configuración de Supabase

#### Políticas RLS Aplicadas:
- **profiles**: Usuarios solo ven su propio perfil
- **franchisees**: Franquiciados solo ven sus datos
- **franchisee_restaurants**: Acceso basado en ownership
- **base_restaurants**: Lectura pública, escritura para asesores

#### Índices Optimizados:
- `idx_profiles_email` en `profiles(email)`
- `idx_profiles_role` en `profiles(role)`
- `idx_franchisees_user_id_status` en `franchisees(user_id)`
- `idx_franchisee_restaurants_franchisee_status` en `franchisee_restaurants(franchisee_id, status)`

---

## 🆘 Soporte y Contribución

### Reportar Problemas
1. Usar `SimpleAuthDebugger` para obtener información del estado
2. Incluir logs de consola relevantes
3. Especificar pasos para reproducir el problema
4. Indicar navegador y versión

### Desarrollo Local
```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Ejecutar tests
npm run test

# Build para producción
npm run build
```

### Estructura de Archivos
```
src/
├── hooks/
│   ├── useAuth.tsx              # Sistema principal
│   ├── useSimpleAuth.tsx        # Sistema alternativo
│   └── auth/
│       ├── AuthContext.tsx      # Contexto de autenticación
│       ├── useAuthState.tsx     # Estado de autenticación
│       ├── useUserDataFetcher.tsx # Fetcher optimizado
│       └── useAuthActions.tsx   # Acciones de auth
├── components/
│   └── debug/
│       ├── SimpleAuthDebugger.tsx # Debug visual
│       └── AuthDebugger.tsx     # Debug técnico
└── types/
    └── auth.ts                  # Tipos TypeScript
```

---

## 📝 Changelog

### Versión Actual (2025-01-07)
- ✅ Corregidos errores de TypeScript en `useUserDataFetcher`
- ✅ Implementados timeouts para todas las consultas
- ✅ Mejorado manejo de errores en `useAuthActions`
- ✅ Creado `SimpleAuthDebugger` para diagnóstico visual
- ✅ Aplicada migración SQL para corregir RLS
- ✅ Optimizado `AuthProvider` para evitar race conditions

### Versión Anterior
- ✅ Sistema base de autenticación
- ✅ Integración con Supabase
- ✅ Componentes de debug básicos

---

## 🔮 Próximas Mejoras

### Planificadas
- [ ] Sistema de cache más avanzado
- [ ] Soporte para autenticación social (Google, etc.)
- [ ] Métricas automáticas de rendimiento
- [ ] Tests automatizados
- [ ] Documentación interactiva

### En Consideración
- [ ] Modo offline
- [ ] Sincronización en background
- [ ] Notificaciones push
- [ ] Auditoría de seguridad

---

*Documentación actualizada: 2025-01-07*
*Versión del sistema: 2.0.0*
