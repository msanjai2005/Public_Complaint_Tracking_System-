import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/',  // ← Add this
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://public-complaint-tracking-system.onrender.com',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'https://public-complaint-tracking-system.onrender.com',
        changeOrigin: true,
      },
    },
  },
});