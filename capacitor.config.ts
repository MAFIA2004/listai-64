
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.7b4778bdaa7742c6955d04def2276ec5',
  appName: 'genshin-shop-sync',
  webDir: 'dist',
  server: {
    url: 'https://7b4778bd-aa77-42c6-955d-04def2276ec5.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    // Configure permissions for filesystem
    Permissions: {
      permissions: [
        "android.permission.RECORD_AUDIO",
        "android.permission.READ_EXTERNAL_STORAGE",
        "android.permission.WRITE_EXTERNAL_STORAGE",
        "android.permission.INTERNET"
      ]
    },
    // Configure filesystem plugin
    Filesystem: {
      requestPermissions: true
    }
  }
};

export default config;
