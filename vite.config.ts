import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return undefined;
          }

          if (id.includes('/react/') || id.includes('/react-dom/')) {
            return 'react';
          }

          if (id.includes('/react-router-dom/') || id.includes('/@remix-run/')) {
            return 'router';
          }

          if (id.includes('/@clerk/')) {
            return 'clerk';
          }

          if (id.includes('/@supabase/')) {
            return 'supabase';
          }

          if (id.includes('/lucide-react/')) {
            return 'icons';
          }

          return 'vendor';
        },
      },
    },
  },
})
