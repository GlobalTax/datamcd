
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { QueryProvider } from './providers/QueryProvider';
import { RestaurantContextProvider } from './providers/RestaurantContext';
import { initMonitoring } from '@/lib/monitoring/web-vitals';

const container = document.getElementById("root");
if (!container) {
  throw new Error("Root element not found");
}

const root = createRoot(container);
initMonitoring();
root.render(
  <React.StrictMode>
    <QueryProvider>
      <RestaurantContextProvider>
        <App />
      </RestaurantContextProvider>
    </QueryProvider>
  </React.StrictMode>
);
