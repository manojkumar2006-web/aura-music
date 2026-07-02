import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.auramusic.app',
  appName: 'Aura Music',
  webDir: 'dist',
  server: {
    url: 'https://aura-music-512tlon8n-manoj22.vercel.app',
    cleartext: true
  }
};

export default config;
