
import { Capacitor } from '@capacitor/core';
import { toast } from 'sonner';

// Import types from @capacitor/admob but handle case when the module isn't available
let AdMob: any;
let InterstitialAdPluginEvents: any;

// Dynamically import AdMob only in native environments
// This prevents build errors in web environments
try {
  if (Capacitor.isNativePlatform()) {
    const admobModule = require('@capacitor/admob');
    AdMob = admobModule.AdMob;
    InterstitialAdPluginEvents = admobModule.InterstitialAdPluginEvents;
  }
} catch (error) {
  console.warn('AdMob module not available:', error);
}

// Interface definitions for better type safety
interface AdOptions {
  adId: string;
  npa?: boolean;
}

interface AdMobInitializeOptions {
  requestTrackingAuthorization?: boolean;
  initializeForTesting?: boolean;
  testingDevices?: string[];
  tagForChildDirectedTreatment?: boolean;
  tagForUnderAgeOfConsent?: boolean;
  appId: string;
}

interface AdLoadInfo {
  adUnitId: string;
}

// AdMob IDs
const APP_ID = {
  android: 'ca-app-pub-5099055278802719~4749079976',
  ios: 'ca-app-pub-5099055278802719~4749079976', // Use the same ID for iOS or update with iOS specific ID
};

const INTERSTITIAL_ID = {
  android: 'ca-app-pub-5099055278802719/5868680409',
  ios: 'ca-app-pub-5099055278802719/5868680409', // Use the same ID for iOS or update with iOS specific ID
};

// Test IDs for development
const TEST_INTERSTITIAL_ID = {
  android: 'ca-app-pub-3940256099942544/1033173712',
  ios: 'ca-app-pub-3940256099942544/4411468910',
};

// Determine if we're in a native environment
const isNative = Capacitor.isNativePlatform();

// Get appropriate ad ID based on platform and environment
const getInterstitialAdId = (): string => {
  if (!isNative) return '';
  
  const platform = Capacitor.getPlatform();
  
  // Use test ads when in development
  if (process.env.NODE_ENV === 'development') {
    return platform === 'ios' ? TEST_INTERSTITIAL_ID.ios : TEST_INTERSTITIAL_ID.android;
  }
  
  return platform === 'ios' ? INTERSTITIAL_ID.ios : INTERSTITIAL_ID.android;
};

// Initialize AdMob
export const initializeAdMob = async (): Promise<void> => {
  if (!isNative || !AdMob) return;
  
  try {
    const platform = Capacitor.getPlatform();
    await AdMob.initialize({
      requestTrackingAuthorization: true,
      initializeForTesting: process.env.NODE_ENV === 'development',
      testingDevices: ['EMULATOR'],
      tagForChildDirectedTreatment: false,
      tagForUnderAgeOfConsent: false,
      appId: platform === 'ios' ? APP_ID.ios : APP_ID.android,
    } as AdMobInitializeOptions);
    console.log('AdMob initialized successfully');
  } catch (error) {
    console.error('Failed to initialize AdMob', error);
  }
};

// Class to manage interstitial ads
export class InterstitialAdManager {
  private isAdLoaded = false;
  private isAdLoading = false;
  
  constructor() {
    if (isNative && AdMob && InterstitialAdPluginEvents) {
      // Set up ad event listeners
      AdMob.addListener(InterstitialAdPluginEvents.Loaded, (info: AdLoadInfo) => {
        console.log('Interstitial ad loaded', info);
        this.isAdLoaded = true;
        this.isAdLoading = false;
      });
      
      AdMob.addListener(InterstitialAdPluginEvents.FailedToLoad, (error: any) => {
        console.error('Interstitial ad failed to load', error);
        this.isAdLoaded = false;
        this.isAdLoading = false;
      });
      
      AdMob.addListener(InterstitialAdPluginEvents.Showed, () => {
        console.log('Interstitial ad shown');
        this.isAdLoaded = false;
      });
      
      AdMob.addListener(InterstitialAdPluginEvents.Dismissed, () => {
        console.log('Interstitial ad dismissed');
        this.isAdLoaded = false;
      });
      
      AdMob.addListener(InterstitialAdPluginEvents.FailedToShow, (error: any) => {
        console.error('Interstitial ad failed to show', error);
        this.isAdLoaded = false;
      });
    }
  }
  
  // Preload an interstitial ad
  async loadAd(): Promise<boolean> {
    if (!isNative || !AdMob) return false;
    if (this.isAdLoaded || this.isAdLoading) return this.isAdLoaded;
    
    this.isAdLoading = true;
    
    try {
      const adId = getInterstitialAdId();
      if (!adId) {
        this.isAdLoading = false;
        return false;
      }
      
      const options: AdOptions = {
        adId,
        npa: false
      };
      
      await AdMob.prepareInterstitial(options);
      return true;
    } catch (error) {
      console.error('Error loading interstitial ad:', error);
      this.isAdLoading = false;
      return false;
    }
  }
  
  // Show a loaded interstitial ad
  async showAd(): Promise<boolean> {
    if (!isNative || !AdMob) return false;
    if (!this.isAdLoaded) await this.loadAd();
    
    try {
      if (this.isAdLoaded) {
        await AdMob.showInterstitial();
        return true;
      } else {
        console.log('Interstitial ad not loaded yet');
        return false;
      }
    } catch (error) {
      console.error('Error showing interstitial ad:', error);
      return false;
    }
  }
  
  // Check if an ad is ready to be shown
  isAdReady(): boolean {
    return this.isAdLoaded;
  }
  
  // Show an interstitial ad and execute callback after completion or failure
  async showAdWithCallback(onAdClosed: () => void): Promise<void> {
    if (!isNative || !AdMob) {
      // Fallback behavior for web or when ads can't be shown
      onAdClosed();
      return;
    }
    
    try {
      // Try to show the ad
      const adShown = await this.showAd();
      
      if (!adShown) {
        // If ad couldn't be shown, fallback immediately
        console.log('Ad could not be shown, executing fallback');
        onAdClosed();
      } else {
        // Add a one-time listener for ad dismiss event
        const dismissListener = AdMob.addListener(
          InterstitialAdPluginEvents.Dismissed, 
          () => {
            onAdClosed();
            // Remove the listener after it's called
            dismissListener.remove();
          }
        );
        
        // Also add a failsafe timeout in case the dismiss event doesn't fire
        setTimeout(() => {
          dismissListener.remove();
          onAdClosed();
        }, 30000); // 30 second failsafe
      }
    } catch (error) {
      console.error('Error in showAdWithCallback:', error);
      // Execute callback on error
      onAdClosed();
    }
  }
}

// Create a singleton instance of the ad manager
export const interstitialAdManager = new InterstitialAdManager();

// Function to show a simulated ad for web testing
export const showSimulatedAd = (onComplete: () => void): void => {
  toast.info('Simulating an ad for web testing...');
  
  // Simulate the ad display time
  setTimeout(() => {
    console.log('Simulated ad completed');
    onComplete();
  }, 3000); // 3 seconds for simulation
};

// Helper function that works across all platforms
export const showInterstitialAd = async (onAdClosed: () => void): Promise<void> => {
  if (isNative && AdMob) {
    // Show real ad on native platforms
    await interstitialAdManager.showAdWithCallback(onAdClosed);
  } else {
    // Show simulated ad on web
    showSimulatedAd(onAdClosed);
  }
};
