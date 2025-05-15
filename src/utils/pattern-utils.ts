
import { ShoppingItem, ShoppingPattern } from "@/types/shopping";
import { toast } from 'sonner';

export function getDefaultPatterns(): ShoppingPattern[] {
  return [
    { trigger: ['cereales'], suggestion: '¿Necesitas leche también?' },
    { trigger: ['pasta', 'espaguetis', 'macarrones'], suggestion: '¿Quieres añadir salsa de tomate?' },
    { trigger: ['harina', 'azúcar', 'levadura'], suggestion: '¿Estás horneando? ¿Necesitas huevos?' },
    { trigger: ['queso', 'jamón', 'pan de molde'], suggestion: '¿Vas a hacer sandwiches? ¿Necesitas mayonesa?' },
    { trigger: ['hamburguesa', 'salchichas'], suggestion: '¿Necesitas pan de hamburguesa?' },
    { trigger: ['pizza', 'base de pizza', 'masa de pizza'], suggestion: '¿Has incluido queso mozzarella?' }
  ];
}

export function hasSuggestedItemsAlready(
  pattern: ShoppingPattern, 
  excludeItem: string,
  items: ShoppingItem[]
): boolean {
  // This is a simple check - in a real app, we'd use NLP to match related items
  const suggestion = pattern.suggestion.toLowerCase();
  
  // Extract item names from the suggestion
  const possibleItems = suggestion.match(/(?:añadir|necesitas|incluido)\s+([a-zñáéíóú\s]+?)(?:\?|$)/i);
  
  if (possibleItems && possibleItems[1]) {
    const suggestedItem = possibleItems[1].trim();
    
    // Check if we already have this item
    return items.some(item => 
      item.name.toLowerCase().includes(suggestedItem) && 
      !item.completed &&
      !item.name.toLowerCase().includes(excludeItem)
    );
  }
  
  return false;
}

export function checkForForgottenItems(
  itemName: string,
  items: ShoppingItem[],
  commonPatterns: ShoppingPattern[],
  setCommonPatterns: React.Dispatch<React.SetStateAction<ShoppingPattern[]>>,
  checkPersonalizedSuggestions: (newItemName: string) => void
) {
  const normalizedName = itemName.toLowerCase();
  
  // Check against predefined patterns
  for (const pattern of commonPatterns) {
    // Skip if suggestion was shown recently (in the last hour)
    if (pattern.lastShown && (new Date().getTime() - pattern.lastShown.getTime() < 3600000)) {
      continue;
    }
    
    // Check if the new item is in any trigger list
    if (pattern.trigger.some(trigger => normalizedName.includes(trigger.toLowerCase()))) {
      // Check if we already have any of the implied items
      if (!hasSuggestedItemsAlready(pattern, normalizedName, items)) {
        // Show suggestion toast
        toast('Sugerencia de lista', {
          description: pattern.suggestion,
          action: {
            label: "Cerrar",
            onClick: () => {}
          },
        });
        
        // Update the lastShown timestamp
        setCommonPatterns(prev => prev.map(p => 
          p.trigger.join(',') === pattern.trigger.join(',') 
            ? { ...p, lastShown: new Date() } 
            : p
        ));
        
        // Only show one suggestion at a time
        break;
      }
    }
  }
  
  // Also check personalized purchase patterns
  checkPersonalizedSuggestions(normalizedName);
}
