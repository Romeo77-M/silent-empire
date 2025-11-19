import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/sec-api': {
        target: 'https://www.sec.gov',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/sec-api/, ''),
        headers: {
          'User-Agent': 'Silent Empire LLC tech@silentempire.com'
        }
      },
      '/sec-data': {
        target: 'https://data.sec.gov',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/sec-data/, ''),
        headers: {
          'User-Agent': 'Silent Empire LLC tech@silentempire.com'
        }
      }
    }
  }
})