
import { Button } from '@/components/ui/button';
import { Mic, MicOff } from 'lucide-react';

interface VoiceInputButtonProps {
  isListening: boolean;
  isProcessing: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
}

export function VoiceInputButton({
  isListening,
  isProcessing,
  onStartListening,
  onStopListening
}: VoiceInputButtonProps) {
  return (
    <Button 
      type="button" 
      variant="outline" 
      className={`${isListening ? 'bg-primary text-primary-foreground animate-pulse' : ''}`} 
      onClick={isListening ? onStopListening : onStartListening} 
      disabled={isProcessing}
    >
      {isListening ? <MicOff className="mr-1 h-4 w-4" /> : <Mic className="mr-1 h-4 w-4" />}
      <span className="sr-only sm:not-sr-only sm:inline-block">
        {isListening ? 'Escuchando...' : 'Por voz'}
      </span>
    </Button>
  );
}
