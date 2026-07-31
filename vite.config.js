import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // 👈 Import Tailwind here!

// https://vitejs.dev
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // 👈 Activate the Tailwind compiler engine!
  ],
})
