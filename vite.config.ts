import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
  },
  optimizeDeps: {
    force: true,
    include: ['react-router-dom', 'react-router', '@supabase/supabase-js'],
    exclude: ['lucide-react'],
  },
});
