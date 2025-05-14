
import { useState, useEffect } from 'react';
import { Sparkles, Loader2, Check, Plus, Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { getAIRecipeSuggestions } from '@/lib/gemini-service';

interface AISuggestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddItem: (name: string, price: number, quantity?: number) => void;
}

interface RecipeSuggestion {
  name: string;
  estimatedPrice: number;
  quantity: number;
  selected: boolean;
}

export function AISuggestionDialog({ open, onOpenChange, onAddItem }: AISuggestionDialogProps) {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<RecipeSuggestion[]>([]);
  const [hasResults, setHasResults] = useState(false);
  
  const { isListening, transcript, startListening, stopListening } = useSpeechRecognition();
  
  // Process voice input - update prompt when transcript changes
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
      toast.error('Por favor, indica lo que quieres cocinar');
      return;
    }
    
    setIsLoading(true);
    setHasResults(false);
    
    try {
      const result = await getAIRecipeSuggestions(prompt);
      
      if (result && result.ingredients && result.ingredients.length > 0) {
        // Filter out water and map the ingredients to our format with selected state
        const mappedSuggestions = result.ingredients
          .filter(ingredient => 
            !ingredient.name.toLowerCase().includes('agua') && 
            !ingredient.name.toLowerCase().includes('water'))
          .map(ingredient => ({
            name: ingredient.name,
            estimatedPrice: ingredient.price || 1.0, // Default price if not provided
            quantity: ingredient.quantity || 1,
            selected: true // Default to selected
          }));
        
        setSuggestions(mappedSuggestions);
        setHasResults(true);
        toast.success('¡Sugerencias generadas!');
      } else {
        toast.error('No se pudieron generar sugerencias');
      }
    } catch (error) {
      console.error('Error generating suggestions:', error);
      toast.error('Error al generar sugerencias');
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
  
  const handleAddToList = () => {
    const selectedItems = suggestions.filter(item => item.selected);
    
    if (selectedItems.length === 0) {
      toast.error('Selecciona al menos un ingrediente');
      return;
    }
    
    // Add all selected items to the shopping list
    selectedItems.forEach(item => {
      onAddItem(item.name, item.estimatedPrice, item.quantity);
    });
    
    // Close the dialog and reset state
    toast.success(`${selectedItems.length} ingredientes añadidos a la lista`);
    resetDialog();
  };
  
  const resetDialog = () => {
    setPrompt('');
    setSuggestions([]);
    setHasResults(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Asistente de Compras IA
          </DialogTitle>
          <DialogDescription>
            Describe lo que quieres cocinar y la IA te sugerirá los ingredientes.
          </DialogDescription>
        </DialogHeader>
        
        {!hasResults ? (
          <div className="grid gap-4 py-4">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Ej. Pizza casera para 4 personas"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="flex-1"
                disabled={isLoading || isListening}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleVoiceInput}
                disabled={isLoading}
                className={isListening ? "border-primary text-primary" : ""}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
            </div>
            
            {isListening && (
              <div className="text-center text-sm text-muted-foreground">
                Escuchando... <span className="animate-pulse">●</span>
              </div>
            )}
            
            <Button 
              onClick={handleGenerateSuggestions} 
              disabled={isLoading || !prompt.trim()}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generar Sugerencias
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="py-4">
            <h3 className="mb-2 font-medium">Ingredientes sugeridos:</h3>
            <div className="max-h-[240px] overflow-y-auto space-y-2 mb-4">
              {suggestions.map((item, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-2 border rounded-md"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <Button
                      variant={item.selected ? "default" : "outline"}
                      size="icon"
                      className="h-6 w-6 shrink-0"
                      onClick={() => toggleItemSelection(index)}
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                    <span className={item.selected ? "font-medium" : "text-muted-foreground"}>
                      {item.name} 
                      {item.quantity > 1 && ` (x${item.quantity})`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={resetDialog}>
                Cancelar
              </Button>
              <Button onClick={handleAddToList}>
                <Plus className="mr-2 h-4 w-4" />
                Añadir a la lista
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
