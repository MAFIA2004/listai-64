
import { useEffect } from 'react';
import { ShoppingItem } from '@/types/shopping';
import { categorizeItems } from '@/lib/gemini-service';

export function useCategorization(
  items: ShoppingItem[], 
  setItems: React.Dispatch<React.SetStateAction<ShoppingItem[]>>,
  setCategories: React.Dispatch<React.SetStateAction<Record<string, string[]>>>
) {
  // Categorize items when they change
  useEffect(() => {
    async function updateCategories() {
      if (items.length === 0) return;
      
      // Only categorize items that don't have a category yet
      const uncategorizedItems = items
        .filter(item => !item.category || item.category === 'uncategorized')
        .map(item => item.name);
      
      if (uncategorizedItems.length === 0) return;
      
      try {
        const result = await categorizeItems(uncategorizedItems);
        
        if (result?.categories) {
          setCategories(result.categories);
          
          // Update item categories
          setItems(prevItems => {
            const updatedItems = [...prevItems];
            
            // Map each item to its category
            for (const [category, categoryItems] of Object.entries(result.categories)) {
              for (const categoryItem of categoryItems) {
                // Find all items that match this name
                updatedItems.forEach((item, index) => {
                  if (item.name.toLowerCase() === categoryItem.toLowerCase()) {
                    updatedItems[index] = { ...item, category };
                  }
                });
              }
            }
            
            return updatedItems;
          });
        }
      } catch (error) {
        console.error('Error categorizing items:', error);
      }
    }
    
    updateCategories();
  }, [items.map(item => item.id).join(','), setItems, setCategories]);
}
