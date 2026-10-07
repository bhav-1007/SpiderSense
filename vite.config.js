import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'axios', 'socket.io-client', 'framer-motion', 'leaflet', 'react-leaflet', 'recharts', 'lucide-react']
        }
      }
    }
  }
});
