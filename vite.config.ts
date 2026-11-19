import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' so the production build works from any folder (e.g. GitHub Pages)
export default defineConfig({
  base: './',
  plugins: [react()],
});
