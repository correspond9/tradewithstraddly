import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const appBasePathRaw = (process.env.VITE_APP_BASE_PATH || '/').trim()
const appBasePath = appBasePathRaw.startsWith('/') ? appBasePathRaw : `/${appBasePathRaw}`
const appBase = appBasePath.endsWith('/') ? appBasePath : `${appBasePath}/`

// https://vitejs.dev/config/
export default defineConfig({
  base: appBase,
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    // Dev-mode proxy: all /api calls go to the FastAPI backend on port 8000
    // In Docker, Nginx handles this — this is only for `npm run dev`
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        // Do NOT rewrite — backend now serves /api/v2/... directly
      },
      '/ws': {
        target: 'ws://localhost:8000',
        ws: true,
      },
    },
  },
})

