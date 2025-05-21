
import { useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { processVoiceInputWithAI } from '@/lib/voice-processing';
import { SpellCheckDialog } from '@/components/SpellCheckDialog';
import { ItemSuggestions } from '@/components/ItemSuggestions';
import { VoiceInputButton } from '@/components/VoiceInputButton';
import { useAddItemForm } from '@/hooks/use-add-item-form';
import { toast } from "sonner";
import { useLanguage } from "@/hooks/use-language";

interface AddItemFormProps {
  onAddItem: (name: string, price: number, quantity?: number) => void;
}

export function AddItemForm({ onAddItem }: AddItemFormProps) {
  const { t, language } = useLanguage();
  
  const {
    itemName,
    itemPrice,
    itemQuantity,
    suggestions,
    showSuggestions,
    setShowSuggestions,
    processingVoiceInput,
    spellCheckOpen,
    setSpellCheckOpen,
    spellCheckSuggestions,
    misspelledWord,
    handleNameChange,
    handleSuggestionClick,
    handleSubmit,
    handleSelectSpellingSuggestion,
    handleIgnoreSpelling,
    setVoiceRecognitionValues,
    setProcessingStatus,
    handlePriceChange,
    handleQuantityChange
  } = useAddItemForm({ onAddItem });

  // Voice recognition
  const {
    isListening,
    transcript,
    error,
    startListening,
    stopListening
  } = useSpeechRecognition();

  // Handle voice transcript
  useEffect(() => {
    if (transcript) {
      // Process voice input with AI, passing the current language
      const processVoice = async () => {
        setProcessingStatus(true);
        try {
          const result = await processVoiceInputWithAI(transcript, language);
          setVoiceRecognitionValues(result.name, result.price, result.quantity);
        } finally {
          setProcessingStatus(false);
        }
      };
      
      processVoice();
    }
  }, [transcript, language]); // Added language as a dependency

  // Handle errors in voice recognition
  useEffect(() => {
    if (error) {
      toast.error(t('message.voice_error'), {
        description: error
      });
    }
  }, [error, t]);

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        <div className="relative">
          <Input 
            type="text" 
            placeholder={t('input.item')}
            value={itemName} 
            onChange={handleNameChange} 
            onFocus={() => itemName.length >= 2 && setShowSuggestions(true)} 
            autoComplete="off" 
            className="w-full bg-card dark:bg-card/50 border-input" 
          />

          <ItemSuggestions 
            show={showSuggestions}
            suggestions={suggestions}
            onSelectSuggestion={handleSuggestionClick}
          />
        </div>

        <div className="flex gap-2">
          <Input 
            type="text" 
            placeholder={t('input.price') + " *"}
            value={itemPrice} 
            onChange={handlePriceChange}
            className="w-full bg-card dark:bg-card/50 border-input" 
            inputMode="decimal" 
          />

          <Input 
            type="text" 
            placeholder={t('input.quantity')}
            value={itemQuantity} 
            onChange={handleQuantityChange}
            className="w-24 bg-card dark:bg-card/50 border-input" 
            inputMode="numeric" 
          />
        </div>

        <div className="flex gap-2">
          <Button type="submit" className="flex-1">
            <Plus className="mr-1 h-4 w-4" />
            {t('button.add_item')}
          </Button>

          <VoiceInputButton 
            isListening={isListening}
            isProcessing={processingVoiceInput}
            onStartListening={startListening}
            onStopListening={stopListening}
          />
        </div>
      </form>

      <SpellCheckDialog 
        open={spellCheckOpen}
        onOpenChange={setSpellCheckOpen}
        misspelledWord={misspelledWord}
        suggestions={spellCheckSuggestions}
        onSelectSuggestion={handleSelectSpellingSuggestion}
        onIgnoreSpelling={handleIgnoreSpelling}
      />
    </>
  );
}
