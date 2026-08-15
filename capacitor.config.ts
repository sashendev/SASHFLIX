import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Capacitor Configuration for SASHFLIX
 * 
 * Connected to: https://sashflix.vercel.app (Vercel deployment)
 * This configuration connects the mobile app to your deployed Next.js backend.
 * All updates to your Vercel app automatically reflect in the mobile app!
 */

const config: CapacitorConfig = {
  appId: 'com.sashflix.app',
  appName: 'SASHFLIX',
  appVersion: '1.0.0',
  webDir: 'public', // Fallback in case server is offline
  
  // Production: Connected to Vercel deployment
  server: {
    androidScheme: 'https',
    url: 'https://sashflix.vercel.app',
  },

  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
    },
    CapacitorHttp: {
      enabled: true,
    },
  },
};

export default config;
