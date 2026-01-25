import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.cuentamimercado.app',
  appName: 'cuenta-mi-mercado',
  webDir: 'dist/cuenta-mi-mercado/browser',
  plugins: {
    StatusBar: {
      overlay: false,
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#CAD1C5',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
};

export default config;
