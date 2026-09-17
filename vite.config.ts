import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Project Pages base: https://sahilorbo.github.io/aurix-hero-v2/
export default defineConfig({
  plugins: [react()],
  base: '/aurix-hero-v2/',
})
