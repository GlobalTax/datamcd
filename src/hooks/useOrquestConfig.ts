
// This file is deprecated in favor of useSecureConfig
// All API configurations are now handled securely on the server side
// Please use useSecureConfig('orquest', franchiseeId) instead

export const useOrquestConfig = () => {
  console.warn('useOrquestConfig is deprecated. Use useSecureConfig instead.');
  
  return {
    config: null,
    loading: false,
    error: 'This hook is deprecated. Please use useSecureConfig.',
    fetchConfig: () => Promise.resolve(),
    saveConfig: () => Promise.resolve(false),
    isConfigured: () => false,
  };
};
