import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'co.canchalibre.app',
  appName: 'CanchaLibre',
  webDir: '../../dist/apps/movil/browser',
  server: {
    androidScheme: 'https',
  },
  android: {
    path: 'android',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: '#0f9d58',
      showSpinner: false,
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#0f9d58',
    },
  },
};

export default config;
