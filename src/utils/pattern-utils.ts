
import { ShoppingItem, ShoppingPattern } from '@/types/shopping';
import { toast } from 'sonner';

export function getDefaultPatterns(): ShoppingPattern[] {
  return [
    {
      trigger: ["pan", "baguette", "hogaza"],
      suggestion: "mantequilla"
    },
    {
      trigger: ["pasta", "espagueti", "macarrones"],
      suggestion: "salsa de tomate"
    },
    {
      trigger: ["leche"],
      suggestion: "cereales"
    },
    {
      trigger: ["queso", "jamón"],
      suggestion: "pan"
    },
    {
      trigger: ["hamburguesa", "salchichas"],
      suggestion: "ketchup"
    }
  ];
}

export function checkForForgottenItems(
  newItemName: string,
  currentItems: ShoppingItem[],
  patterns: ShoppingPattern[],
  setPatterns: React.Dispatch<React.SetStateAction<ShoppingPattern[]>>,
  onSuggestionCallback?: (suggestion: string) => void
): void {
  const normalizedName = newItemName.toLowerCase().trim();
  
  // 1. Check if we should suggest any items based on common patterns
  for (let i = 0; i < patterns.length; i++) {
    const pattern = patterns[i];
    
    // Check if this pattern is triggered by the new item
    if (pattern.trigger.some(trigger => 
      normalizedName.includes(trigger) || 
      trigger.includes(normalizedName)
    )) {
      // Check if suggested item is already in the list
      const suggestionNormalized = pattern.suggestion.toLowerCase();
      const isSuggestionInList = currentItems.some(item => 
        item.name.toLowerCase().includes(suggestionNormalized) ||
        suggestionNormalized.includes(item.name.toLowerCase())
      );
      
      // Check if we recently showed this suggestion (within last hour)
      const now = new Date();
      const recentlySuggested = pattern.lastShown instanceof Date && 
        ((now.getTime() - pattern.lastShown.getTime()) < 60 * 60 * 1000);
      
      // If suggestion is not in list and not recently suggested, show it
      if (!isSuggestionInList && !recentlySuggested) {
        // Update the lastShown timestamp
        setPatterns(prevPatterns => {
          const updatedPatterns = [...prevPatterns];
          updatedPatterns[i] = {
            ...updatedPatterns[i],
            lastShown: new Date()
          };
          return updatedPatterns;
        });
        
        // Show the suggestion
        toast('Sugerencia', {
          description: `¿Quieres añadir "${pattern.suggestion}" a tu lista?`,
          action: {
            label: "Añadir",
            onClick: () => {
              if (onSuggestionCallback) {
                onSuggestionCallback(pattern.suggestion);
              }
            }
          },
        });
        
        // Only show one suggestion at a time
        break;
      }
    }
  }
  
  // 2. Learn new patterns from user behavior (basic implementation)
  // This would typically be implemented with more sophisticated logic
}
