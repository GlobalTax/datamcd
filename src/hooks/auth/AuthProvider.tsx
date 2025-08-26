// === COMPATIBILITY LAYER ===
// Re-export from new context structure for backward compatibility

export { useUnifiedAuth as useAuth, AuthProvider } from '@/contexts/auth';
export type { User, AuthContextType } from '@/types/domains/auth';