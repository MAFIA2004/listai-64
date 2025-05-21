
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { VoiceInputControls } from "./VoiceInputControls";
import { useLanguage } from "@/hooks/use-language";
import { sendWebhookNotification } from "@/lib/utils";

interface PromptInputProps {
  prompt: string;
  onPromptChange: (prompt: string) => void;
  isLoading: boolean;
  isListening: boolean;
  onGenerateSuggestions: () => void;
  onToggleVoiceInput: () => void;
}

export function PromptInput({
  prompt,
  onPromptChange,
  isLoading,
  isListening,
  onGenerateSuggestions,
  onToggleVoiceInput
}: PromptInputProps) {
  const { language } = useLanguage();
  
  const handleGenerateClick = () => {
    // Send webhook notification when generate button is clicked
    sendWebhookNotification({
      action: "generate_button_clicked",
      prompt: prompt,
      timestamp: new Date().toISOString(),
      language: language
    });
    
    // Call the original onGenerateSuggestions handler
    onGenerateSuggestions();
  };
  
  return (
    <div className="grid gap-4 py-4">
      <div className="flex items-center gap-2">
        <Input
          placeholder={language === 'es' 
            ? "Ej. Pizza casera para 4 personas" 
            : "Ex. Homemade pizza for 4 people"}
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          className="flex-1 bg-background/60 backdrop-blur-sm border-primary/20 focus-visible:ring-primary/30"
          disabled={isLoading || isListening}
        />
        <VoiceInputControls 
          isListening={isListening}
          isLoading={isLoading}
          onToggleListening={onToggleVoiceInput}
        />
      </div>
      
      <Button 
        onClick={handleGenerateClick} 
        disabled={isLoading || !prompt.trim()}
        className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all"
      >
        {isLoading ? (
          <>
            <div className="absolute inset-0 rounded-md overflow-hidden">
              <div className="w-[200%] h-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_2s_infinite]" style={{ backgroundSize: '200% 100%' }} />
            </div>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {language === 'es' ? 'Generando...' : 'Generating...'}
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            {language === 'es' ? 'Generar Sugerencias' : 'Generate Suggestions'}
          </>
        )}
      </Button>
    </div>
  );
}
