import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      'localhost',
      '82e6522e24ea.ngrok-free.app'  // Allow all ngrok-free.app subdomains
    ]
  }
})
