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

// Constantes para patrones de reconocimiento
const PRICE_PATTERNS = [
  // Patrones de precio con palabras clave
  /(\d+([.,]\d{1,2})?)(?:\s*(?:euros?|€))/i,  // "10 euros", "10€"
  /(\d+)[.,](\d{1,2})(?:\s*(?:euros?|€))?/i,  // "10.50", "10,50" con o sin "euros"
  /(\d+)\s*con\s*(\d{1,2})(?:\s*(?:euros?|€))?/i,  // "10 con 50" con o sin "euros"
  /a\s*(\d+([.,]\d{1,2})?)(?:\s*(?:euros?|€))?/i,  // "a 10 euros", "a 10€"
  /por\s*(\d+([.,]\d{1,2})?)(?:\s*(?:euros?|€))?/i,  // "por 10 euros"
  /vale\s*(\d+([.,]\d{1,2})?)(?:\s*(?:euros?|€))?/i,  // "vale 10 euros"
  /cuesta\s*(\d+([.,]\d{1,2})?)(?:\s*(?:euros?|€))?/i,  // "cuesta 10 euros"
  /precio\s*(?:de|es|:)?\s*(\d+([.,]\d{1,2})?)(?:\s*(?:euros?|€))?/i,  // "precio 10 euros"
];

// Palabras clave que indican la separación entre producto y precio
const SEPARATOR_KEYWORDS = [
  'a', 'por', 'vale', 'cuesta', 'precio', 'de', 'euros', 'euro', '€'
];

// Palabras relacionadas con peso/kilo
const WEIGHT_KEYWORDS = [
  'kilo', 'kilos', 'kg', 'gramos', 'g', 'medio kilo', 'cuarto de kilo'
];

// Patrones para productos por peso
const WEIGHT_PATTERNS = [
  /(\d+(?:[.,]\d+)?)\s*(?:kilo|kilos|kg)s?\s+de\s+(.+)/i,  // "2 kilos de manzanas"
  /(\d+(?:[.,]\d+)?)\s*(?:gramos?|g)\s+de\s+(.+)/i,  // "500 gramos de queso"
  /(?:un\s+)?(?:kilo|kg)\s+de\s+(.+)/i,  // "un kilo de patatas" o "kilo de patatas"
  /(?:medio|mitad de un)\s+(?:kilo|kg)\s+de\s+(.+)/i,  // "medio kilo de cebollas"
  /(?:cuarto de)\s+(?:kilo|kg)\s+de\s+(.+)/i,  // "cuarto de kilo de tomates"
];

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

  // Función para procesar la entrada de voz
  const processVoiceInput = (transcript: string): { name: string; price: string } => {
    let name = '';
    let price = '';
    
    // Normalizar el texto (minúsculas, espacios, etc)
    const normalizedTranscript = transcript.toLowerCase().trim();
    
    // 1. Verificar productos por peso
    for (const pattern of WEIGHT_PATTERNS) {
      const match = normalizedTranscript.match(pattern);
      if (match) {
        if (match[1] && match[2]) {
          // Si tiene cantidad y nombre
          name = `${match[2]} (${match[1]} kg)`.trim();
        } else if (match[1]) {
          // Si solo tiene cantidad
          name = `(${match[1]} kg)`.trim();
        } else if (match[0]) {
          // Si solo tiene nombre
          name = `${match[1]} (1 kg)`.trim();
        }
        
        // Buscar precio después de la parte de peso
        const remainingText = normalizedTranscript.replace(match[0], '').trim();
        
        // Buscar precio en el texto restante
        for (const pricePattern of PRICE_PATTERNS) {
          const priceMatch = remainingText.match(pricePattern);
          if (priceMatch && priceMatch[1]) {
            price = priceMatch[1].replace(',', '.');
            break;
          }
        }
        
        return { name, price };
      }
    }
    
    // 2. Buscar el precio utilizando patrones comunes
    let foundPrice = false;
    let priceValue = '';
    
    for (const pattern of PRICE_PATTERNS) {
      const match = normalizedTranscript.match(pattern);
      if (match && match[1]) {
        priceValue = match[1].replace(',', '.');
        foundPrice = true;
        
        // Extraer el nombre eliminando la parte del precio
        name = normalizedTranscript.replace(match[0], '').trim();
        break;
      }
    }
    
    if (foundPrice) {
      price = priceValue;
    } else {
      // 3. Si no hay patrón directo, intentar dividir por palabras clave
      const words = normalizedTranscript.split(' ');
      let beforeSeparator = [];
      let afterSeparator = [];
      let foundSeparator = false;
      
      for (let i = 0; i < words.length; i++) {
        if (!foundSeparator && SEPARATOR_KEYWORDS.some(keyword => words[i].includes(keyword))) {
          foundSeparator = true;
          // Buscar un número después del separador
          for (let j = i; j < words.length; j++) {
            if (/\d+([.,]\d{1,2})?/.test(words[j])) {
              price = words[j].replace(',', '.');
              break;
            }
          }
        } else if (foundSeparator) {
          afterSeparator.push(words[i]);
        } else {
          beforeSeparator.push(words[i]);
        }
      }
      
      // Si no se encontró separador, usar todo como nombre
      if (beforeSeparator.length > 0 && !foundSeparator) {
        name = beforeSeparator.join(' ');
      } else {
        name = beforeSeparator.join(' ');
      }
    }
    
    // 4. Limpiar el nombre final quitando palabras clave redundantes
    for (const keyword of [...SEPARATOR_KEYWORDS, ...WEIGHT_KEYWORDS]) {
      name = name.replace(new RegExp(`\\b${keyword}\\b`, 'gi'), '');
    }
    
    // Eliminar palabras de precio comunes y artículos
    const wordsToRemove = ['añadir', 'añade', 'agregar', 'agrega', 'add'];
    for (const word of wordsToRemove) {
      const regex = new RegExp(`^${word}\\s+`, 'i');
      name = name.replace(regex, '');
    }
    
    // Limpiar espacios múltiples
    name = name.replace(/\s+/g, ' ').trim();
    
    return { name, price };
  };

  // Handle voice transcript
  useEffect(() => {
    if (transcript) {
      const { name, price } = processVoiceInput(transcript);
      
      if (name) {
        setItemName(name);
      }
      
      if (price) {
        setItemPrice(price);
      } else {
        setItemPrice('');
      }
      
      // Mostrar toast con lo que se entendió
      if (name && price) {
        toast.success("Entrada por voz reconocida", {
          description: `"${name}" por ${price}€`
        });
      } else if (name) {
        toast.info("Producto reconocido, falta precio", {
          description: `"${name}"`
        });
      } else if (price) {
        toast.info("Precio reconocido, falta producto", {
          description: `${price}€`
        });
      } else {
        toast.warning("No se reconoció correctamente", {
          description: "Intenta de nuevo con 'producto a precio'"
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
