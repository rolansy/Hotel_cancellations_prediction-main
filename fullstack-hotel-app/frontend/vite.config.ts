import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react({
    // Disable fast refresh in production
    fastRefresh: process.env.NODE_ENV !== 'production'
  })],
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom']
        }
      }
    },
    // Make build less strict
    target: 'es2015',
    cssCodeSplit: true,
    assetsInlineLimit: 4096
  },
  esbuild: {
    // Disable TypeScript type checking during build
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://hotel-b-cancel-v1.onrender.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
