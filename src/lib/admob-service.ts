
import { Capacitor } from '@capacitor/core';
import { toast } from 'sonner';

// Types for AdMob to be used without direct import for better compatibility
interface AdOptions {
  adId: string;
  npa?: boolean;
}

interface AdLoadInfo {
  adUnitId: string;
}

interface AdMobInitializationOptions {
  requestTrackingAuthorization?: boolean;
  initializeForTesting?: boolean;
  testingDevices?: string[];
  tagForChildDirectedTreatment?: boolean;
  tagForUnderAgeOfConsent?: boolean;
  appId: string;
}

// IDs de anuncios reales
const APP_ID = {
  android: "ca-app-pub-5099055278802719~4749079976",
  ios: "ca-app-pub-5099055278802719~4749079976"
};

const INTERSTITIAL_ID = {
  android: "ca-app-pub-5099055278802719/5868680409",
  ios: "ca-app-pub-5099055278802719/5868680409"
};

// Para pruebas durante desarrollo (opcional)
const TEST_INTERSTITIAL_ID = {
  android: "ca-app-pub-3940256099942544/1033173712",
  ios: "ca-app-pub-3940256099942544/4411468910"
};

// Comprobamos si estamos en una plataforma nativa (iOS/Android)
const isNative = Capacitor.isNativePlatform();

// Versión simulada de AdMob para entornos web o cuando el módulo no está disponible
const SimulatedAdMob = {
  initialize: async () => console.log("Simulando inicialización de AdMob"),
  prepareInterstitial: async () => console.log("Simulando preparación de anuncio"),
  showInterstitial: async () => console.log("Simulando mostrar anuncio"),
  addListener: () => ({
    remove: () => {}
  })
};

// Carga dinámica del módulo AdMob
let AdMob: any = SimulatedAdMob;
let InterstitialAdPluginEvents: any = {
  Loaded: 'interstitialAdLoaded',
  FailedToLoad: 'interstitialAdFailedToLoad',
  Showed: 'interstitialAdShowed',
  Dismissed: 'interstitialAdDismissed',
  FailedToShow: 'interstitialAdFailedToShow'
};

// Intentar cargar el módulo AdMob solo cuando estamos en una plataforma nativa
if (isNative) {
  // Utilizamos una función async inmediatamente ejecutada
  (async () => {
    try {
      // Importación dinámica con tipo 'any' para evitar problemas de compilación
      const module = await import(/* @vite-ignore */ '@capacitor/admob');
      AdMob = module.AdMob;
      InterstitialAdPluginEvents = module.InterstitialAdPluginEvents;
      console.log("Módulo AdMob cargado correctamente");
    } catch (error) {
      console.error("Error al cargar el módulo AdMob:", error);
    }
  })();
}

// Obtener ID de anuncio adecuado según plataforma
const getInterstitialAdId = () => {
  if (!isNative) return "";
  
  const platform = Capacitor.getPlatform();
  
  // Usar anuncios reales, no de prueba
  return platform === "ios" ? INTERSTITIAL_ID.ios : INTERSTITIAL_ID.android;
};

// Inicializar AdMob
export const initializeAdMob = async () => {
  if (!isNative) return;
  
  try {
    const platform = Capacitor.getPlatform();
    await AdMob.initialize({
      requestTrackingAuthorization: true,
      initializeForTesting: false, // Cambiado a false para usar anuncios reales
      testingDevices: [], // Vacío para anuncios reales
      tagForChildDirectedTreatment: false,
      tagForUnderAgeOfConsent: false,
      appId: platform === "ios" ? APP_ID.ios : APP_ID.android
    });
    console.log("AdMob inicializado correctamente");
  } catch (error) {
    console.error("Error al inicializar AdMob", error);
  }
};

// Clase para gestionar anuncios intersticiales
export class InterstitialAdManager {
  isAdLoaded: boolean = false;
  isAdLoading: boolean = false;

  constructor() {
    if (isNative) {
      // Configuramos los listeners para eventos de anuncios
      AdMob.addListener(InterstitialAdPluginEvents.Loaded, (info: AdLoadInfo) => {
        console.log("Anuncio intersticial cargado", info);
        this.isAdLoaded = true;
        this.isAdLoading = false;
      });

      AdMob.addListener(InterstitialAdPluginEvents.FailedToLoad, (error: any) => {
        console.error("Error al cargar anuncio intersticial", error);
        this.isAdLoaded = false;
        this.isAdLoading = false;
      });

      AdMob.addListener(InterstitialAdPluginEvents.Showed, () => {
        console.log("Anuncio intersticial mostrado");
        this.isAdLoaded = false;
      });

      AdMob.addListener(InterstitialAdPluginEvents.Dismissed, () => {
        console.log("Anuncio intersticial cerrado");
        this.isAdLoaded = false;
      });

      AdMob.addListener(InterstitialAdPluginEvents.FailedToShow, (error: any) => {
        console.error("Error al mostrar anuncio intersticial", error);
        this.isAdLoaded = false;
      });
    }
  }

  // Precargar un anuncio intersticial
  async loadAd(): Promise<boolean> {
    if (!isNative) return false;
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
        npa: false,
      };
      
      await AdMob.prepareInterstitial(options);
      return true;
    } catch (error) {
      console.error("Error al cargar anuncio intersticial:", error);
      this.isAdLoading = false;
      return false;
    }
  }

  // Mostrar un anuncio intersticial cargado
  async showAd(): Promise<boolean> {
    if (!isNative) return false;
    if (!this.isAdLoaded) await this.loadAd();
    
    try {
      if (this.isAdLoaded) {
        await AdMob.showInterstitial();
        return true;
      } else {
        console.log("Anuncio intersticial no está listo");
        return false;
      }
    } catch (error) {
      console.error("Error al mostrar anuncio intersticial:", error);
      return false;
    }
  }

  // Comprobar si un anuncio está listo para ser mostrado
  isAdReady(): boolean {
    return this.isAdLoaded;
  }

  // Mostrar un anuncio intersticial y ejecutar callback después
  async showAdWithCallback(onAdClosed: () => void): Promise<void> {
    if (!isNative) {
      onAdClosed();
      return;
    }
    
    try {
      const adShown = await this.showAd();
      if (!adShown) {
        console.log("No se pudo mostrar el anuncio, ejecutando callback");
        onAdClosed();
      } else {
        // Configurar listener para cuando se cierre el anuncio
        const dismissListener = AdMob.addListener(
          InterstitialAdPluginEvents.Dismissed,
          () => {
            onAdClosed();
            dismissListener.remove();
          }
        );
        
        // Timeout por seguridad (30 segundos)
        setTimeout(() => {
          dismissListener.remove();
          onAdClosed();
        }, 30000);
      }
    } catch (error) {
      console.error("Error en showAdWithCallback:", error);
      onAdClosed();
    }
  }
}

// Instancia global del gestor de anuncios
export const interstitialAdManager = new InterstitialAdManager();

// Función para mostrar anuncios intersticiales
export const showInterstitialAd = async (onAdClosed: () => void): Promise<void> => {
  if (isNative) {
    await interstitialAdManager.showAdWithCallback(onAdClosed);
  } else {
    // Fallback para entorno web (mensaje informativo)
    toast.info("Los anuncios solo funcionan en dispositivos móviles");
    setTimeout(() => {
      onAdClosed();
    }, 1000);
  }
};
