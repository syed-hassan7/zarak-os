import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { dirname, resolve } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify - file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
    build: {
      // Isolate the heaviest vendor libs into their own async chunks so a
      // recruiter opening the OS doesn't pay for pdf.js/recharts/three
      // unless they actually open CV.app / Skills.app, or the 3D intro
      // renders. See docs/DESIGN_SYSTEM.md §11.
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return undefined;
            if (id.includes('pdfjs-dist')) return 'vendor-pdf';
            if (id.includes('recharts') || id.includes('d3-')) return 'vendor-charts';
            if (id.includes('three') || id.includes('@react-three')) return 'vendor-three';
            if (id.includes('gifuct-js')) return 'vendor-gif';
            if (id.includes('motion')) return 'vendor-motion';
            return 'vendor';
          },
        },
      },
      chunkSizeWarningLimit: 700,
    },
  };
});
