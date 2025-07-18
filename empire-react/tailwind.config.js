/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary-color)',
        secondary: 'var(--text-secondary)',
        'card-bg': 'var(--card-bg)',
        'bg-color': 'var(--bg-color)',
        'text-color': 'var(--text-color)',
        'border-color': 'var(--border-color)',
      },
      maxWidth: {
        'card': '360px',
        'how-card': '340px',
      },
      screens: {
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
      },
      zIndex: {
        '1000': '1000',
        '1001': '1001',
        '1002': '1002',
      }
    },
  },
  plugins: [],
}
