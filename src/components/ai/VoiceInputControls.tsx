
import { Button } from '@/components/ui/button';
import { Mic, MicOff } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';

interface VoiceInputControlsProps {
  isListening: boolean;
  isLoading: boolean;
  onToggleListening: () => void;
  transcript?: string;
}

export function VoiceInputControls({ 
  isListening, 
  isLoading, 
  onToggleListening,
  transcript 
}: VoiceInputControlsProps) {
  const { language } = useLanguage();
  
  return (
    <>
      <Button
        variant="outline"
        size="icon"
        onClick={onToggleListening}
        disabled={isLoading}
        className={isListening ? "border-primary text-primary" : "border-primary/30"}
      >
        {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
      </Button>
      
      {isListening && (
        <div className="text-center text-sm text-primary">
          {language === 'es' ? 'Escuchando...' : 'Listening...'} <span className="animate-pulse">●</span>
        </div>
      )}
    </>
  );
}
