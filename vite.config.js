import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  root: 'react-app',
  build: {
    outDir: path.resolve(__dirname, 'react-build'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'react-app/index.html'),
        charity: path.resolve(__dirname, 'react-app/charity/index.html'),
      },
    },
  },
  server: {
    port: 3000,
  },
});
