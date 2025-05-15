
import { useState, useEffect } from 'react';
import { Sparkles, Loader2, Check, Plus, Mic, MicOff, BookmarkPlus, ListPlus } from 'lucide-react';
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
    
    // Para cada ingrediente, solicitamos un precio
    selectedItems.forEach(item => {
      const defaultPrice = 1.0; // Precio por defecto  
      onAddItem(item.name, defaultPrice, item.quantity);
    });
    
    // Close the dialog and reset state
    toast.success(`${selectedItems.length} ingredientes añadidos a la lista`);
    resetDialog();
  };
  
  const handleSaveIngredients = () => {
    const selectedItems = suggestions.filter(item => item.selected);
    
    if (selectedItems.length === 0) {
      toast.error('Selecciona al menos un ingrediente');
      return;
    }
    
    // Guardar ingredientes en localStorage con el nombre de la receta
    const savedIngredients = localStorage.getItem('aiSuggestedIngredients');
    let existingIngredients: any[] = [];
    
    if (savedIngredients) {
      try {
        existingIngredients = JSON.parse(savedIngredients);
      } catch (e) {
        console.error('Error parsing saved ingredients', e);
      }
    }
    
    // Agregar nuevos ingredientes con id único y el nombre de la receta
    const recipeName = prompt.trim();
    const recipeId = crypto.randomUUID();
    
    const newIngredients = selectedItems.map(item => ({
      id: crypto.randomUUID(),
      name: item.name,
      price: 0, // No guardamos precio para ingredientes generados por IA
      quantity: item.quantity,
      recipe: recipeName,
      recipeId: recipeId,
      date: new Date()
    }));
    
    const updatedIngredients = [...existingIngredients, ...newIngredients];
    localStorage.setItem('aiSuggestedIngredients', JSON.stringify(updatedIngredients));
    
    toast.success(`Receta "${recipeName}" guardada con ${selectedItems.length} ingredientes`);
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
      <DialogContent className="sm:max-w-md backdrop-blur-2xl border border-primary/20 bg-background/60 shadow-lg shadow-primary/5">
        <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary/5 to-background/0 pointer-events-none" />
        
        <DialogHeader className="relative z-10">
          <DialogTitle className="flex items-center gap-2">
            <div className="relative">
              <Sparkles className="h-5 w-5 text-primary animate-pulse" />
              <div className="absolute inset-0 h-5 w-5 bg-primary blur-sm rounded-full opacity-30 animate-pulse" />
            </div>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500">
              Sugerir Ingredientes
            </span>
          </DialogTitle>
          <DialogDescription>
            Describe lo que quieres cocinar y la IA te sugerirá los ingredientes.
          </DialogDescription>
        </DialogHeader>
        
        <div className="relative z-10">
          {!hasResults ? (
            <div className="grid gap-4 py-4">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Ej. Pizza casera para 4 personas"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="flex-1 bg-background/60 backdrop-blur-sm border-primary/20 focus-visible:ring-primary/30"
                  disabled={isLoading || isListening}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleVoiceInput}
                  disabled={isLoading}
                  className={isListening ? "border-primary text-primary" : "border-primary/30"}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
              </div>
              
              {isListening && (
                <div className="text-center text-sm text-primary">
                  Escuchando... <span className="animate-pulse">●</span>
                </div>
              )}
              
              <Button 
                onClick={handleGenerateSuggestions} 
                disabled={isLoading || !prompt.trim()}
                className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all"
              >
                {isLoading ? (
                  <>
                    <div className="absolute inset-0 rounded-md overflow-hidden">
                      <div className="w-[200%] h-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_2s_infinite]" style={{ backgroundSize: '200% 100%' }} />
                    </div>
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
              <h3 className="mb-2 font-medium text-primary">{prompt}</h3>
              <div className="max-h-[240px] overflow-y-auto space-y-2 mb-4 pr-1">
                {suggestions.map((item, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-2 border border-border/40 rounded-md bg-card/30 backdrop-blur-sm"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <Button
                        variant={item.selected ? "default" : "outline"}
                        size="icon"
                        className={`h-6 w-6 shrink-0 ${item.selected ? "bg-primary text-primary-foreground" : "border-primary/30"}`}
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
                <Button 
                  variant="outline" 
                  onClick={resetDialog}
                  className="border-primary/30 hover:bg-primary/10"
                >
                  Cancelar
                </Button>
                <div className="space-x-2">
                  <Button 
                    variant="outline"
                    onClick={handleSaveIngredients}
                    className="border-primary/30 bg-primary/10 hover:bg-primary/20"
                  >
                    <BookmarkPlus className="mr-2 h-4 w-4" />
                    Guardar receta
                  </Button>
                  <Button 
                    onClick={handleAddToList}
                    className="bg-gradient-to-r from-primary to-blue-500 hover:opacity-90"
                  >
                    <ListPlus className="mr-2 h-4 w-4" />
                    Añadir a lista
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
