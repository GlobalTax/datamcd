
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Configuración optimizada para code splitting
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-select', '@radix-ui/react-tabs'],
          'query-vendor': ['@tanstack/react-query'],
          'chart-vendor': ['recharts'],
          
          // App chunks por funcionalidad
          'dashboard': [
            'src/components/dashboard/UnifiedDashboard.tsx',
            'src/components/dashboard/DashboardSummary.tsx'
          ],
          'auth': [
            'src/hooks/auth/AuthProvider.tsx',
            'src/hooks/auth/useUnifiedAuth.ts'
          ],
          'analysis': [
            'src/components/analysis/AnalysisDashboard.tsx',
            'src/components/analysis/AnalysisSpecificDashboard.tsx'
          ]
        },
        // Naming pattern para chunks
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId;
          if (facadeModuleId) {
            const fileName = path.basename(facadeModuleId, path.extname(facadeModuleId));
            return `chunks/${fileName}-[hash].js`;
          }
          return 'chunks/[name]-[hash].js';
        },
        // Asset naming
        assetFileNames: 'assets/[name]-[hash].[ext]',
        // Entry naming
        entryFileNames: '[name]-[hash].js'
      }
    },
    // Optimización de chunks
    chunkSizeWarningLimit: 1000,
    // Separar CSS por chunks
    cssCodeSplit: true,
    // Minificación optimizada
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: mode === 'production'
      }
    }
  },
  // Optimización de dependencias
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'lucide-react',
      'recharts'
    ],
    exclude: []
  }
}));
