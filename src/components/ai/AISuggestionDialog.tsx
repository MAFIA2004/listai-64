
import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { useLanguage } from '@/hooks/use-language';
import { sendWebhookNotification, parseWebhookResponse } from '@/lib/utils';

// Import refactored components
import { PromptInput } from './PromptInput';
import { SuggestionsList } from './SuggestionsList';
import { AddItemDialog } from './AddItemDialog';

// Types
import { RecipeSuggestion, ItemFormValues } from '@/types/ai-suggestions';

interface AISuggestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddItem: (name: string, price: number, quantity?: number) => void;
}

export function AISuggestionDialog({ open, onOpenChange, onAddItem }: AISuggestionDialogProps) {
  const { language } = useLanguage();
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<RecipeSuggestion[]>([]);
  const [hasResults, setHasResults] = useState(false);
  const [selectedItemForAdd, setSelectedItemForAdd] = useState<RecipeSuggestion | null>(null);
  const [responseDescription, setResponseDescription] = useState('');
  
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
    
    setIsLoading(true);
    setHasResults(false);
    
    try {
      // Send the prompt to the webhook
      const webhookResponse = await sendWebhookNotification(prompt);
      console.log("Webhook response received:", webhookResponse);
      
      if (webhookResponse) {
        // Parse the webhook response
        const { description, ingredients } = parseWebhookResponse(webhookResponse);
        console.log("Parsed response - Description:", description);
        console.log("Parsed response - Ingredients:", ingredients);
        
        // Set the description
        setResponseDescription(description);
        
        // Map the ingredients to our format
        if (ingredients && ingredients.length > 0) {
          const mappedSuggestions = ingredients.map(name => ({
            name,
            quantity: 1,
            selected: true
          }));
          
          setSuggestions(mappedSuggestions);
          setHasResults(true);
          toast.success(language === 'es' ? '¡Sugerencias generadas!' : 'Suggestions generated!');
        } else {
          console.error("No ingredients found in response:", webhookResponse);
          toast.error(language === 'es' ? 'No se pudieron generar sugerencias' : 'Could not generate suggestions');
        }
      } else {
        console.error("Invalid webhook response:", webhookResponse);
        toast.error(language === 'es' ? 'Respuesta del servidor no válida' : 'Invalid server response');
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
    setResponseDescription('');
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
                
                {/* Show the description if available */}
                {responseDescription && (
                  <div className="p-3 mb-4 bg-primary/10 rounded-md text-sm">
                    <p className="italic text-muted-foreground">{responseDescription}</p>
                  </div>
                )}
                
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
      <AddItemDialog
        selectedItem={selectedItemForAdd}
        onClose={() => setSelectedItemForAdd(null)}
        onAddItem={handleAddItem}
      />
    </>
  );
}
