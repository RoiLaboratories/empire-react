import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      'localhost',
      '75ac219c4573.ngrok-free.app'  // Allow all ngrok-free.app subdomains
    ]
  }
})
