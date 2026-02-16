import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  root: 'react-app',
  build: {
    outDir: path.resolve(__dirname, 'react-build'),
    emptyOutDir: true,
  },
  server: {
    port: 3000,
  },
});
