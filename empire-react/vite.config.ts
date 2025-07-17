import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      'localhost',
      '2fec70103c0c.ngrok-free.app'  // Allow all ngrok-free.app subdomains
    ]
  }
})
