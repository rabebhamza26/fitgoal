import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// En développement, les appels /api sont redirigés vers Spring Boot.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8083',
        changeOrigin: true, // Indispensable pour corriger l'en-tête Host
        secure: false,      // Utile si vous passez plus tard en HTTPS local
      }
    },
  },
});