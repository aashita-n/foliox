import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // AI Chat proxy (port 5001) - More specific routes must come first
      '/ai-chat': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
        ws: true,
      },
      // Flask API routes (port 5000)
      '/api/market': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      // Java backend routes (port 8080)
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/portfolio': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/balance': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/market': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
