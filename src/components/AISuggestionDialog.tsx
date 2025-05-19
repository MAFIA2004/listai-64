
import { useState, useEffect } from 'react';
import { Sparkles, Loader2, Check, Plus, Mic, MicOff, X } from 'lucide-react';
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { getItemEmoji } from '@/lib/utils';
import { GoogleAdSense } from './ads/GoogleAdSense';
import { useLanguage } from '@/hooks/use-language';

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
  const { t, language } = useLanguage();
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<RecipeSuggestion[]>([]);
  const [hasResults, setHasResults] = useState(false);
  const [selectedItemForAdd, setSelectedItemForAdd] = useState<RecipeSuggestion | null>(null);
  const [showAd, setShowAd] = useState(false);
  const [adTimerCount, setAdTimerCount] = useState(5);
  
  const { isListening, transcript, startListening, stopListening } = useSpeechRecognition();
  
  const form = useForm<ItemFormValues>({
    defaultValues: {
      price: 1.0,
      quantity: 1,
    },
  });
  
  // Process voice input - update prompt when transcript changes
  useEffect(() => {
    if (transcript) {
      setPrompt(transcript);
    }
  }, [transcript]);
  
  // Contador para el anuncio real
  useEffect(() => {
    if (showAd && adTimerCount > 0) {
      const timer = setTimeout(() => {
        setAdTimerCount(adTimerCount - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (showAd && adTimerCount === 0) {
      // Cuando el contador llega a 0, cerrar el anuncio y comenzar la generación
      setShowAd(false);
      setAdTimerCount(5); // Reset para la próxima vez
      generateSuggestionsAfterAd();
    }
  }, [showAd, adTimerCount]);
  
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
    
    // Mostrar el anuncio real antes de generar sugerencias
    setShowAd(true);
  };
  
  const generateSuggestionsAfterAd = async () => {
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
        toast.success(language === 'es' ? '¡Sugerencias generadas!' : 'Suggestions generated!');
      } else {
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
    
    // Reset form with item's quantity
    form.reset({
      price: 1.0,
      quantity: item.quantity,
    });
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
    setAdTimerCount(5);
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
            {showAd ? (
              <div className="ad-container p-4 rounded-lg border border-primary/20 bg-background mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-primary">
                    {language === 'es' ? 'Anuncio' : 'Advertisement'}
                  </h3>
                  <span className="text-sm text-muted-foreground">
                    {adTimerCount}s
                  </span>
                </div>
                <div className="h-32 flex items-center justify-center bg-primary/5 rounded-md mb-2 overflow-hidden">
                  <GoogleAdSense 
                    format="fluid" 
                    slot="5962660784" 
                    style={{ height: '100%', width: '100%', minHeight: '100px' }}
                  />
                </div>
                <p className="text-xs text-center text-muted-foreground">
                  {language === 'es' 
                    ? 'Espere mientras se carga el contenido...'
                    : 'Please wait while content loads...'}
                </p>
              </div>
            ) : !hasResults ? (
              <div className="grid gap-4 py-4">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder={language === 'es' 
                      ? "Ej. Pizza casera para 4 personas" 
                      : "Ex. Homemade pizza for 4 people"}
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
                    {language === 'es' ? 'Escuchando...' : 'Listening...'} <span className="animate-pulse">●</span>
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
                          {getItemEmoji(item.name)} {item.name}
                        </span>
                      </div>
                      
                      {item.selected && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenAddItemForm(item)}
                          className="text-xs border-primary/30 bg-card/30"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          {language === 'es' ? 'Añadir' : 'Add'}
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                
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

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAddItem)} className="space-y-4 py-2">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{language === 'es' ? 'Precio (€)' : 'Price (€)'}</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        min="0.01"
                        className="bg-background/60"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{language === 'es' ? 'Cantidad' : 'Quantity'}</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1" 
                        className="bg-background/60"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setSelectedItemForAdd(null)}
                  className="border-primary/20"
                >
                  {language === 'es' ? 'Cancelar' : 'Cancel'}
                </Button>
                <Button 
                  type="submit"
                  className="bg-gradient-to-r from-primary to-primary/80"
                >
                  {language === 'es' ? 'Añadir a la lista' : 'Add to list'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
