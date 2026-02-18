import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  root: 'blocked-app',
  base: '/blocked/',
  build: {
    outDir: path.resolve(__dirname, 'blocked-build'),
    emptyOutDir: true,
  },
  server: {
    port: 3001,
  },
});
