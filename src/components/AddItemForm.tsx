
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

interface AddItemFormProps {
  onAddItem: (name: string, price: number, quantity?: number) => void;
}

export function AddItemForm({ onAddItem }: AddItemFormProps) {
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
    setProcessingStatus
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
      // Process voice input with AI
      const processVoice = async () => {
        setProcessingStatus(true);
        try {
          const result = await processVoiceInputWithAI(transcript);
          setVoiceRecognitionValues(result.name, result.price, result.quantity);
        } finally {
          setProcessingStatus(false);
        }
      };
      
      processVoice();
    }
  }, [transcript]);

  // Handle errors in voice recognition
  useEffect(() => {
    if (error) {
      toast.error("Error de reconocimiento de voz", {
        description: error
      });
    }
  }, [error]);

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        <div className="relative">
          <Input 
            type="text" 
            placeholder="Artículo" 
            value={itemName} 
            onChange={handleNameChange} 
            onFocus={() => itemName.length >= 2 && setShowSuggestions(true)} 
            autoComplete="off" 
            className="w-full bg-slate-50" 
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
            placeholder="Precio (€)" 
            value={itemPrice} 
            onChange={(e) => setVoiceRecognitionValues(undefined, e.target.value, undefined)} 
            className="w-full" 
            inputMode="decimal" 
          />

          <Input 
            type="number" 
            placeholder="Cantidad" 
            value={itemQuantity} 
            onChange={(e) => setVoiceRecognitionValues(undefined, undefined, e.target.value)} 
            className="w-24" 
            min="1" 
            inputMode="numeric" 
          />
        </div>

        <div className="flex gap-2">
          <Button type="submit" className="flex-1">
            <Plus className="mr-1 h-4 w-4" />
            Añadir Artículo
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
