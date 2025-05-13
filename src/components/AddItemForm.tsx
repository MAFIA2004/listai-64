
import { useState, useRef, useEffect } from 'react';
import { Mic } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { COMMON_SHOPPING_ITEMS } from '@/lib/constants';
import { checkSpelling } from '@/lib/utils';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { toast } from "sonner";

interface AddItemFormProps {
  onAddItem: (name: string, price: number) => void;
}

export function AddItemForm({ onAddItem }: AddItemFormProps) {
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  
  // Voice recognition
  const { isListening, transcript, error, startListening, stopListening } = useSpeechRecognition();
  
  // Spell check dialog
  const [spellCheckOpen, setSpellCheckOpen] = useState(false);
  const [spellCheckSuggestions, setSpellCheckSuggestions] = useState<string[]>([]);
  const [misspelledWord, setMisspelledWord] = useState('');

  // Handle voice transcript
  useEffect(() => {
    if (transcript) {
      // Try to parse item and price from voice input
      // Common patterns: "add [item] [price]", "[item] [price]", etc.
      const pricePattern = /\d+([.,]\d{1,2})?/g;
      const priceMatches = transcript.match(pricePattern);
      
      if (priceMatches && priceMatches.length > 0) {
        const price = priceMatches[0].replace(',', '.');
        
        // Extract item name by removing the price
        let name = transcript.replace(priceMatches[0], '').trim();
        
        // Remove common prefixes like "add", "añadir", etc.
        const prefixes = ['añadir', 'añade', 'agregar', 'agrega', 'add'];
        for (const prefix of prefixes) {
          if (name.toLowerCase().startsWith(prefix)) {
            name = name.substring(prefix.length).trim();
            break;
          }
        }
        
        // Remove "euros" or "€" if present
        name = name.replace(/(euros|€)/gi, '').trim();
        
        setItemName(name);
        setItemPrice(price);
        
        // Show toast to confirm what was understood
        toast.success("Entrada por voz reconocida", {
          description: `"${name}" por ${price}€`
        });
      } else {
        // If no price pattern was found, use the whole transcript as item name
        setItemName(transcript);
        setItemPrice('');
        toast.info("No se detectó precio en la entrada por voz", {
          description: "Por favor, añade el precio manualmente."
        });
      }
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

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const updateSuggestions = (input: string) => {
    if (input.length < 2) {
      setSuggestions([]);
      return;
    }

    const inputLower = input.toLowerCase();
    const filtered = COMMON_SHOPPING_ITEMS.filter(item => 
      item.toLowerCase().includes(inputLower)
    ).slice(0, 5);

    setSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setItemName(value);
    updateSuggestions(value);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setItemName(suggestion);
    setShowSuggestions(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!itemName.trim()) {
      toast.error("Nombre no puede estar vacío");
      return;
    }
    
    const price = parseFloat(itemPrice.replace(',', '.'));
    if (isNaN(price) || price <= 0) {
      toast.error("Precio debe ser un número positivo");
      return;
    }

    // Check spelling before adding
    const { isMisspelled, suggestions } = checkSpelling(itemName);
    if (isMisspelled && suggestions.length > 0) {
      setMisspelledWord(itemName);
      setSpellCheckSuggestions(suggestions);
      setSpellCheckOpen(true);
      return;
    }
    
    // If no spelling issues, add the item directly
    addItemToList(itemName, price);
  };

  const handleSelectSpellingSuggestion = (suggestion: string) => {
    const price = parseFloat(itemPrice.replace(',', '.'));
    addItemToList(suggestion, price);
    setSpellCheckOpen(false);
  };

  const handleIgnoreSpelling = () => {
    const price = parseFloat(itemPrice.replace(',', '.'));
    addItemToList(misspelledWord, price);
    setSpellCheckOpen(false);
  };

  const addItemToList = (name: string, price: number) => {
    onAddItem(name, price);
    setItemName('');
    setItemPrice('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

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
            className="w-full"
            autoComplete="off"
          />

          {/* Suggestions dropdown */}
          {showSuggestions && (
            <div 
              className="absolute z-10 mt-1 w-full bg-popover border rounded-md shadow-lg max-h-60 overflow-auto"
              ref={suggestionsRef}
            >
              {suggestions.map((suggestion, idx) => (
                <div 
                  key={idx} 
                  className="p-2 hover:bg-muted cursor-pointer"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Precio (€)"
            value={itemPrice}
            onChange={(e) => setItemPrice(e.target.value)}
            className="w-full"
            inputMode="decimal"
          />

          <Button 
            type="button"
            variant="outline"
            className={`shrink-0 ${isListening ? 'bg-primary text-primary-foreground animate-pulse' : ''}`}
            onClick={isListening ? stopListening : startListening}
          >
            <Mic className="mr-1 h-4 w-4" />
            <span className="sr-only sm:not-sr-only sm:inline-block">
              {isListening ? 'Escuchando...' : 'Añadir por voz'}
            </span>
          </Button>
        </div>

        <Button type="submit" className="w-full">
          Añadir Artículo
        </Button>
      </form>

      {/* Spell check dialog */}
      <Dialog open={spellCheckOpen} onOpenChange={setSpellCheckOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sugerencia ortográfica</DialogTitle>
            <DialogDescription>
              ¿Quisiste decir alguna de estas opciones para <span className="font-medium">{misspelledWord}</span>?
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-2 py-4">
            {spellCheckSuggestions.map((suggestion, idx) => (
              <Button
                key={idx}
                variant="outline"
                onClick={() => handleSelectSpellingSuggestion(suggestion)}
                className="w-full justify-start"
              >
                {suggestion}
              </Button>
            ))}
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={handleIgnoreSpelling}>
              Usar "{misspelledWord}"
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
