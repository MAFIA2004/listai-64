import { ShoppingItem } from '@/types/shopping';
import { saveItemsToStorage } from '@/utils/storage-utils';
import { updatePurchaseHistory } from '@/utils/history-utils';
import { checkForForgottenItems } from '@/utils/pattern-utils';
import { checkPersonalizedSuggestions } from '@/utils/history-utils';
import { checkBudgetAfterAddingItem } from '@/utils/budget-utils';
import { toast } from 'sonner';

export function useItemsActions(
  items: ShoppingItem[],
  setItems: React.Dispatch<React.SetStateAction<ShoppingItem[]>>,
  budget: { enabled: boolean; amount: number; warningThreshold: number },
  commonPatterns: any[],
  setCommonPatterns: React.Dispatch<React.SetStateAction<any[]>>,
  purchaseHistoryLocal: Record<string, any>,
  setPurchaseHistoryLocal: React.Dispatch<React.SetStateAction<Record<string, any>>>,
  setPurchaseHistory: React.Dispatch<React.SetStateAction<any[]>>,
  calculateTotal: (items?: ShoppingItem[]) => number
) {
  const addItem = (name: string, price: number, quantity: number = 1, category?: string) => {
    // Validate price must be at least 0.1
    if (price < 0.1) {
      toast.error("El precio debe ser al menos 0.1");
      return;
    }
    
    // Store price with 2 decimal precision to avoid JavaScript floating point issues
    const fixedPrice = parseFloat(price.toFixed(2));
    
    // Check if item with same name AND SAME PRICE exists (important change here)
    const existingItem = items.find(item => 
      item.name.toLowerCase() === name.toLowerCase() && 
      item.price === fixedPrice && 
      !item.completed);
    
    if (existingItem) {
      // Update quantity instead of adding new item (only if name AND price match)
      setItems(prevItems => prevItems.map(item => 
        item.id === existingItem.id 
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
      toast.success(`Cantidad actualizada: ${name} (${existingItem.quantity + quantity})`);
      
      // Check budget after updating quantity
      checkBudgetAfterAddingItem(fixedPrice * quantity, budget, calculateTotal);
      return;
    }
    
    const newItem: ShoppingItem = {
      id: crypto.randomUUID(),
      name,
      price: fixedPrice, // Use fixed price here
      quantity,
      completed: false,
      date: new Date(),
      category: category || 'uncategorized',
    };
    
    // Find the index of the last phantom item (item with name "5")
    const lastPhantomIndex = [...items].reverse().findIndex(item => item.phantom && item.name === "5");
    
    // If found, insert after that item, otherwise add to the end
    if (lastPhantomIndex !== -1) {
      const insertIndex = items.length - lastPhantomIndex;
      const newItems = [...items];
      newItems.splice(insertIndex, 0, newItem);
      setItems(newItems);
    } else {
      setItems(prevItems => [...prevItems, newItem]);
    }
    
    // Check for forgotten related items
    checkForForgottenItems(
      name, 
      items, 
      commonPatterns, 
      setCommonPatterns, 
      (newItemName) => {
        const suggestion = checkPersonalizedSuggestions(newItemName, items, purchaseHistoryLocal);
        if (suggestion) {
          toast('Basado en tus compras', {
            description: `Normalmente compras ${suggestion.itemName} junto con ${suggestion.relatedItem}. ¿Quieres añadirlo?`,
            action: {
              label: "Cerrar",
              onClick: () => {}
            },
          });
        }
      }
    );
    
    // Check budget after adding item
    checkBudgetAfterAddingItem(fixedPrice * quantity, budget, calculateTotal);
  };

  const removeItem = (id: string) => {
    // No permitir eliminar productos fantasma
    const item = items.find(item => item.id === id);
    if (item?.phantom) return;
    
    setItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const toggleItemCompletion = (id: string) => {
    setItems(prevItems => prevItems.map(item => {
      if (item.id === id) {
        const newCompletedState = !item.completed;
        
        // If marking as completed, update purchase history
        if (newCompletedState) {
          updatePurchaseHistory(item.name, purchaseHistoryLocal, setPurchaseHistoryLocal);
        }
        
        return { ...item, completed: newCompletedState };
      }
      return item;
    }));
  };

  const updateItemQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    
    setItems(prevItems => prevItems.map(item => 
      item.id === id ? { ...item, quantity } : item
    ));
  };

  const clearAllItems = () => {
    // Save completed non-phantom items to history before clearing
    const completedItems = items.filter(item => item.completed && !item.phantom);
    
    if (completedItems.length > 0) {
      const historyEntry = {
        id: crypto.randomUUID(),
        date: new Date(),
        items: completedItems,
        totalAmount: completedItems.reduce((total, item) => total + (item.price * item.quantity), 0)
      };
      
      setPurchaseHistory(prev => [historyEntry, ...prev]);
    }
    
    // Keep phantom items when clearing
    setItems(items.filter(item => item.phantom));
    toast.success('Lista de compras eliminada');
  };

  return {
    addItem,
    removeItem,
    toggleItemCompletion,
    updateItemQuantity,
    clearAllItems
  };
}
