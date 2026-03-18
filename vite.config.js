import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_ACTIONS ? '/study-desk/' : '/',
  server: {
    port: 3002,
    open: false,
  },
  build: {
    chunkSizeWarningLimit: 5000, // scripture JSON chunks are large by design
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('@tiptap') || id.includes('prosemirror')) {
            return 'tiptap';
          }
          if (id.includes('dexie')) {
            return 'dexie';
          }
        },
      },
    },
  },
});
