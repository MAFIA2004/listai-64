
import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { useLanguage } from '@/hooks/use-language';

// Definimos los tipos que faltan para Speech Recognition
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
  error?: string;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechGrammar {
  src: string;
  weight: number;
}

interface SpeechGrammarList {
  length: number;
  item(index: number): SpeechGrammar;
  [index: number]: SpeechGrammar;
  addFromURI(src: string, weight?: number): void;
  addFromString(string: string, weight?: number): void;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionStatic {
  new (): SpeechRecognition;
  prototype: SpeechRecognition;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  grammars: SpeechGrammarList;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onnomatch: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
}

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionStatic;
    webkitSpeechRecognition: SpeechRecognitionStatic;
  }
}

interface SpeechRecognitionHook {
  isListening: boolean;
  transcript: string;
  error?: string;
  startListening: () => void;
  stopListening: () => void;
}

export function useSpeechRecognition(): SpeechRecognitionHook {
  const { language } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [isNative] = useState(Capacitor.isNativePlatform());

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && !isNative) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        setError(language === 'es' ? "Tu navegador no soporta reconocimiento de voz" : "Your browser doesn't support speech recognition");
        return;
      }

      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      
      // Set the language based on the current app language
      recognitionInstance.lang = language === 'es' ? 'es-ES' : 'en-US';

      recognitionInstance.onresult = (event) => {
        const current = event.resultIndex;
        const result = event.results[current][0].transcript;
        setTranscript(result);
        setIsListening(false);
      };

      recognitionInstance.onerror = (event) => {
        setError(`Error: ${event.error}`);
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, [isNative, language]); // Added language as a dependency

  const startListening = useCallback(() => {
    setError(undefined);
    setTranscript('');

    if (isNative) {
      // On native platforms, inform that we'd use a different approach
      setError(language === 'es' 
        ? "El reconocimiento de voz necesita permisos en Android" 
        : "Voice recognition requires permissions on Android");
      return;
    }

    if (recognition) {
      try {
        // Update the recognition language before starting
        recognition.lang = language === 'es' ? 'es-ES' : 'en-US';
        recognition.start();
        setIsListening(true);
      } catch (err) {
        setError(language === 'es' 
          ? "Error al iniciar reconocimiento de voz" 
          : "Error starting voice recognition");
        setIsListening(false);
      }
    }
  }, [recognition, isNative, language]);

  const stopListening = useCallback(() => {
    if (recognition && isListening && !isNative) {
      recognition.stop();
      setIsListening(false);
    }
  }, [recognition, isListening, isNative]);

  return { isListening, transcript, error, startListening, stopListening };
}
