import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';
import path from 'path';

export default defineConfig({
  plugins: [react(), viteSingleFile()],
  root: 'blocked-app',
  build: {
    outDir: path.resolve(__dirname, 'blocked-build'),
    emptyOutDir: true,
  },
  server: {
    port: 3001,
  },
});
