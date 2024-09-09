import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'whalefort.devices.com',
  appName: 'whalefort.devices',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  }
};

export default config;
