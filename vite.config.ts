import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// GitHub Pages serves this project at https://<user>.github.io/Couples-app/, so
// every asset URL needs that subpath prefix. Locally (npm run dev) there's no
// prefix, so it's driven by an env var the deploy workflow sets at build time.
const base = process.env.VITE_BASE_PATH || '/'

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
})
