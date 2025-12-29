import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://quizz-app-2-bn5d.onrender.com',
        changeOrigin: true
      }
    }
  }
})
