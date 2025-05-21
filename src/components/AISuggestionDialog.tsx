import { useState, useEffect } from 'react';
import { Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { getAIRecipeSuggestions } from '@/lib/gemini-service';
import { useLanguage } from '@/hooks/use-language';
import { getItemEmoji, sendWebhookNotification } from '@/lib/utils'; // Import the webhook utility

// Import refactored components
import { AdDisplay } from './ai/AdDisplay';
import { PromptInput } from './ai/PromptInput';
import { SuggestionsList } from './ai/SuggestionsList';
import { AddItemForm } from './ai/AddItemForm';

interface AISuggestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddItem: (name: string, price: number, quantity?: number) => void;
}

interface RecipeSuggestion {
  name: string;
  quantity: number;
  selected: boolean;
}

interface ItemFormValues {
  price: number;
  quantity: number;
}

export function AISuggestionDialog({ open, onOpenChange, onAddItem }: AISuggestionDialogProps) {
  const { language } = useLanguage();
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<RecipeSuggestion[]>([]);
  const [hasResults, setHasResults] = useState(false);
  const [selectedItemForAdd, setSelectedItemForAdd] = useState<RecipeSuggestion | null>(null);
  const [showAd, setShowAd] = useState(false);
  
  const { isListening, transcript, startListening, stopListening } = useSpeechRecognition();
  
  // Process voice input
  useEffect(() => {
    if (transcript) {
      setPrompt(transcript);
    }
  }, [transcript]);
  
  const handleVoiceInput = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };
  
  const handleGenerateSuggestions = async () => {
    if (!prompt.trim()) {
      toast.error(language === 'es' ? 'Por favor, indica lo que quieres cocinar' : 'Please indicate what you want to cook');
      return;
    }
    
    // Send webhook notification when user generates AI suggestions
    await sendWebhookNotification({
      action: "generate_ai_product",
      prompt: prompt,
      timestamp: new Date().toISOString(),
      language: language
    });
    
    // Skip the ad and generate suggestions immediately
    generateSuggestionsAfterAd();
  };
  
  const generateSuggestionsAfterAd = async () => {
    setIsLoading(true);
    setHasResults(false);
    
    try {
      console.log("Fetching AI suggestions for prompt:", prompt);
      const result = await getAIRecipeSuggestions(prompt);
      console.log("AI suggestion results:", result);
      
      if (result && result.ingredients && result.ingredients.length > 0) {
        // Filter out water and map the ingredients to our format with selected state
        const mappedSuggestions = result.ingredients
          .filter(ingredient => 
            !ingredient.name.toLowerCase().includes('agua') && 
            !ingredient.name.toLowerCase().includes('water'))
          .map(ingredient => ({
            name: ingredient.name,
            quantity: ingredient.quantity || 1,
            selected: true // Default to selected
          }));
        
        setSuggestions(mappedSuggestions);
        setHasResults(true);
        toast.success(language === 'es' ? '¡Sugerencias generadas!' : 'Suggestions generated!');
      } else {
        console.error("No ingredients found in result:", result);
        toast.error(language === 'es' ? 'No se pudieron generar sugerencias' : 'Could not generate suggestions');
      }
    } catch (error) {
      console.error('Error generating suggestions:', error);
      toast.error(language === 'es' ? 'Error al generar sugerencias' : 'Error generating suggestions');
    } finally {
      setIsLoading(false);
    }
  };
  
  const toggleItemSelection = (index: number) => {
    setSuggestions(prev => 
      prev.map((item, i) => 
        i === index ? { ...item, selected: !item.selected } : item
      )
    );
  };
  
  const handleOpenAddItemForm = (item: RecipeSuggestion) => {
    setSelectedItemForAdd(item);
  };
  
  const handleAddItem = (values: ItemFormValues) => {
    if (!selectedItemForAdd) return;
    
    onAddItem(
      selectedItemForAdd.name,
      values.price,
      values.quantity
    );
    
    toast.success(
      language === 'es' 
        ? `${selectedItemForAdd.name} añadido a la lista`
        : `${selectedItemForAdd.name} added to the list`
    );
    
    // Remove the item from the suggestions list after adding it to the shopping list
    setSuggestions(prev => prev.filter(item => item.name !== selectedItemForAdd.name));
    
    setSelectedItemForAdd(null);
  };
  
  const resetDialog = () => {
    setPrompt('');
    setSuggestions([]);
    setHasResults(false);
    setSelectedItemForAdd(null);
    setShowAd(false);
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md backdrop-blur-2xl border border-primary/20 bg-background/60 shadow-lg shadow-primary/5 dark:bg-background/60">
          <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary/5 to-background/0 pointer-events-none" />
          
          <DialogHeader className="relative z-10">
            <DialogTitle className="flex items-center gap-2">
              <div className="relative">
                <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                <div className="absolute inset-0 h-5 w-5 bg-primary blur-sm rounded-full opacity-30 animate-pulse" />
              </div>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500">
                {language === 'es' ? 'Sugerir Ingredientes' : 'Suggest Ingredients'}
              </span>
            </DialogTitle>
            <DialogDescription>
              {language === 'es' 
                ? 'Describe lo que quieres cocinar y la IA te sugerirá los ingredientes.'
                : 'Describe what you want to cook and the AI will suggest ingredients.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="relative z-10">
            {/* Ad Display component is kept but will not be shown since we're bypassing it */}
            
            {!hasResults && (
              <PromptInput 
                prompt={prompt}
                onPromptChange={setPrompt}
                isLoading={isLoading}
                isListening={isListening}
                onGenerateSuggestions={handleGenerateSuggestions}
                onToggleVoiceInput={handleVoiceInput}
              />
            )}
            
            {hasResults && (
              <div className="py-4">
                <h3 className="mb-2 font-medium text-primary">{prompt}</h3>
                
                <SuggestionsList 
                  suggestions={suggestions}
                  onToggleSelection={toggleItemSelection}
                  onOpenAddForm={handleOpenAddItemForm}
                />
                
                <div className="flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={resetDialog}
                    className="border-primary/30 hover:bg-primary/10"
                  >
                    {language === 'es' ? 'Cancelar' : 'Cancel'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Item Form Dialog */}
      <Dialog open={!!selectedItemForAdd} onOpenChange={(open) => !open && setSelectedItemForAdd(null)}>
        <DialogContent className="sm:max-w-[350px] backdrop-blur-md bg-background/60 border border-primary/20">
          <DialogHeader>
            <DialogTitle>{language === 'es' ? 'Añadir a la lista' : 'Add to list'}</DialogTitle>
            <DialogDescription>
              {selectedItemForAdd && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-lg">{getItemEmoji(selectedItemForAdd.name)}</span>
                  <span>{selectedItemForAdd.name}</span>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>

          <AddItemForm
            selectedItem={selectedItemForAdd}
            onCancel={() => setSelectedItemForAdd(null)}
            onAddItem={handleAddItem}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
