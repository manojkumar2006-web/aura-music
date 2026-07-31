import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import type { UserConfig } from 'vitest/config';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    test: {
      // Vitest configuration
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      include: ['src/test/**/*.test.ts', 'src/test/**/*.test.tsx'],
      coverage: { reporter: ['text', 'html'] },
    } as UserConfig['test'],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâ€”file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            // Core React framework — loads first
            if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
              return 'react-vendor';
            }
            // State management
            if (id.includes('node_modules/zustand')) {
              return 'react-vendor';
            }
            // Animation library
            if (id.includes('node_modules/motion') || id.includes('node_modules/framer-motion')) {
              return 'motion-vendor';
            }
            // Player + DnD — lazy loaded after first interaction
            if (
              id.includes('src/components/player/AudioPlayer') ||
              id.includes('src/components/player/SyncedLyrics') ||
              id.includes('node_modules/@dnd-kit')
            ) {
              return 'player';
            }
            // Heavy modals — lazy loaded on demand
            if (
              id.includes('src/components/CoupleCompatibility') ||
              id.includes('src/components/OnboardingWizard') ||
              id.includes('src/components/PremiumWidgets')
            ) {
              return 'heavy';
            }
          },
        },
      },
    },
  };
});
