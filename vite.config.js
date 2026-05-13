import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/icd-token': {
        target: 'https://icdaccessmanagement.who.int',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/icd-token/, '/connect/token')
      },
      '/icd-api': {
        target: 'https://id.who.int',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/icd-api/, '')
      }
    }
  }
})
