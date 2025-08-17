
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { QueryProvider } from './providers/QueryProvider';
import { RestaurantContextProvider } from './providers/RestaurantContext';
import { useRestaurantPrefetch } from '@/hooks/useRestaurantPrefetch';
import { initMonitoring } from '@/lib/monitoring/web-vitals';

const container = document.getElementById("root");
if (!container) {
  throw new Error("Root element not found");
}

// Component wrapper to use hooks inside providers
const AppWithPrefetch = () => {
  const { prefetchRestaurantData } = useRestaurantPrefetch();
  
  return (
    <RestaurantContextProvider onRestaurantChange={prefetchRestaurantData}>
      <App />
    </RestaurantContextProvider>
  );
};

const root = createRoot(container);
initMonitoring();
root.render(
  <React.StrictMode>
    <QueryProvider>
      <AppWithPrefetch />
    </QueryProvider>
  </React.StrictMode>
);
