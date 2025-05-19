
import { useEffect, useState } from 'react';
import { GoogleAdSense } from '../ads/GoogleAdSense';

interface AdDisplayProps {
  isVisible: boolean;
  onAdComplete: () => void;
  timerDuration?: number;
}

export function AdDisplay({ isVisible, onAdComplete, timerDuration = 5 }: AdDisplayProps) {
  const [timeRemaining, setTimeRemaining] = useState(timerDuration);
  
  useEffect(() => {
    if (!isVisible) {
      setTimeRemaining(timerDuration);
      return;
    }
    
    if (timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(prevTime => prevTime - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      onAdComplete();
    }
  }, [isVisible, timeRemaining, onAdComplete, timerDuration]);
  
  if (!isVisible) return null;
  
  return (
    <div className="ad-container p-4 rounded-lg border border-primary/20 bg-background mb-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium text-primary">Anuncio</h3>
        <span className="text-sm text-muted-foreground">{timeRemaining}s</span>
      </div>
      <div className="h-32 flex items-center justify-center bg-primary/5 rounded-md mb-2 overflow-hidden">
        <GoogleAdSense 
          format="fluid" 
          slot="5962660784" 
          style={{ height: '100%', width: '100%', minHeight: '100px' }}
        />
      </div>
      <p className="text-xs text-center text-muted-foreground">
        Espere mientras se genera su sugerencia...
      </p>
    </div>
  );
}
