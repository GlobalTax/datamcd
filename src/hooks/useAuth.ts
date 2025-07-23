
import { useAuthState } from './auth/useAuthState';

export const useAuth = () => {
  return useAuthState();
};

export type { AuthHook } from './auth/useAuthState';
