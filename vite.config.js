import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  // Load environment variables from project root
  const env = loadEnv(mode, process.cwd(), '');

  return {
    // Frontend root
    root: 'client',

    // envDir must point to the project root (where .env is)
    // Since root is 'client', we need to go one level up
    envDir: '../',

    plugins: [
      react(),
      tailwindcss()
    ],

    build: {
      outDir: '../dist',
      emptyOutDir: true,
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom'],
            firebase: ['firebase/app', 'firebase/auth'],
            charts: ['recharts'],
            animations: ['gsap', 'framer-motion'],
            maps: ['leaflet', 'react-leaflet']
          }
        }
      }
    },

    resolve: {
      alias: {
        '@': path.resolve(process.cwd(), './client/src'),
      },
    },

    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});