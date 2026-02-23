import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import istanbul from 'vite-plugin-istanbul';

const VITE_COVERAGE = Boolean(String(process.env['VITE_COVERAGE']).toLowerCase() === 'true')
const UI_ROOT = path.resolve(__dirname, '..')
const REPO_ROOT = path.resolve(__dirname, '../../..')

// https://vitejs.dev/config/
export default defineConfig({
  root: UI_ROOT,
  publicDir: path.resolve(REPO_ROOT, 'public'),
  server: {
    port: 8000,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      }
    }
  },
  build: {
    outDir: path.resolve(REPO_ROOT, 'dist'),
    emptyOutDir: true,
    sourcemap: true,
    target: 'esnext',
    rollupOptions: {
      output: {
        assetFileNames: `assets/[name].[ext]`
      }
    }
  },

  plugins: [react(), istanbul({forceBuildInstrument: VITE_COVERAGE, exclude: ['**/pages/trade/index.tsx']})],
  resolve: {
    alias: {
      '@': UI_ROOT,
      './runtimeConfig': './runtimeConfig.browser',
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      // Node.js global to browser globalThis
      define: {
        global: 'globalThis',
      },
    },
  },
})