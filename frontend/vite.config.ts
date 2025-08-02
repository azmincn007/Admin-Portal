import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
  publicDir: 'public', // make sure _redirects is picked up from here
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
})
