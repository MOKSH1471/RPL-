import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { cricketDevSyncPlugin } from '../../scripts/cricketVitePlugin';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), cricketDevSyncPlugin(path.resolve(__dirname, '../../'))],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3001,
    open: true,
  },
});
