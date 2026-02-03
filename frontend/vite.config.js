import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // More specific routes must come first
      '/api/market': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/balance': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/portfolio': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/market': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
