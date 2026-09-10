import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Backend serves uploaded images at /uploads/<file> on port 4000.
      // Without this proxy, <img src="/uploads/..."> resolves against the
      // Vite dev server (5173) and 404s. Works for existing DB rows too,
      // since they all store relative "/uploads/..." paths.
      '/uploads': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
})