import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Allows access from the local network
    port: 5175,       // You can set any available port
    open: true,       // Automatically opens the browser
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
  
    },
  },
}); 