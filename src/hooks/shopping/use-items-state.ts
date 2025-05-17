
import { useState, useEffect } from 'react';
import { ShoppingItem, SortOption } from '@/types/shopping';
import { toast } from 'sonner';
import { 
  loadItemsFromStorage,
  saveItemsToStorage,
  moveItemsToHistory
} from '@/utils/storage-utils';
import {
  getTodayDateString,
  getLastSavedDate,
  updateLastSavedDate
} from '@/utils/date-utils';
import { checkBudgetAfterAddingItem } from '@/utils/budget-utils';
import { checkForForgottenItems } from '@/utils/pattern-utils';
import { updatePurchaseHistory, checkPersonalizedSuggestions } from '@/utils/history-utils';
import { phantomItems, ensurePhantomItems } from './use-phantom-items';

export function useItemsState(
  budget: { enabled: boolean; amount: number; warningThreshold: number },
  commonPatterns: any[],
  setCommonPatterns: React.Dispatch<React.SetStateAction<any[]>>,
  purchaseHistoryLocal: Record<string, any>,
  setPurchaseHistoryLocal: React.Dispatch<React.SetStateAction<Record<string, any>>>,
  setPurchaseHistory: React.Dispatch<React.SetStateAction<any[]>>
) {
  const [items, setItems] = useState<ShoppingItem[]>(() => {
    const lastSavedDate = getLastSavedDate();
    const todayDateString = getTodayDateString();
    
    // If the last saved date is not today, we should move items to history and start fresh
    if (lastSavedDate && lastSavedDate !== todayDateString) {
      // Get saved items to move them to history
      const savedItems = loadItemsFromStorage().filter(item => !item.phantom);
      
      if (savedItems.length > 0) {
        // Get existing history
        const savedHistory = loadPurchaseHistoryFromStorage();
        
        // Move items to history
        const { newHistory } = moveItemsToHistory(savedItems, savedHistory, lastSavedDate);
        
        // Save the updated history
        savePurchaseHistoryToStorage(newHistory);
        
        // Clear current items for today
        localStorage.removeItem('shoppingItems');
      }
      
      // Update the last saved date to today
      updateLastSavedDate();
      return [...phantomItems]; // Iniciar con productos fantasma
    }
    
    // If it's still the same day, load items normally and ensure phantom items are included
    updateLastSavedDate();
    const savedItems = loadItemsFromStorage();
    
    // Check if phantom items already exist in the saved items
    const existingPhantomIds = new Set(savedItems.filter(item => item.phantom).map(item => item.id));
    
    // Add phantom items that don't already exist
    const missingPhantomItems = phantomItems.filter(item => !existingPhantomIds.has(item.id));
    
    return [...savedItems, ...missingPhantomItems];
  });

  const [sortOption, setSortOption] = useState<SortOption>('date');
  const [categories, setCategories] = useState<Record<string, string[]>>({});

  // Save items to localStorage whenever they change
  useEffect(() => {
    saveItemsToStorage(items);
  }, [items]);

  const addItem = (name: string, price: number, quantity: number = 1, category?: string) => {
    // Check if item with same name exists
    const existingItem = items.find(item => 
      item.name.toLowerCase() === name.toLowerCase() && !item.completed);
    
    if (existingItem) {
      // Update quantity instead of adding new item
      setItems(prevItems => prevItems.map(item => 
        item.id === existingItem.id 
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
      toast.success(`Cantidad actualizada: ${name} (${existingItem.quantity + quantity})`);
      
      // Check budget after updating quantity
      checkBudgetAfterAddingItem(existingItem.price * quantity, budget, calculateTotal);
      return;
    }
    
    const newItem: ShoppingItem = {
      id: crypto.randomUUID(),
      name,
      price,
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
    checkBudgetAfterAddingItem(price * quantity, budget, calculateTotal);
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

  const calculateTotal = (itemsToCalculate = items) => {
    return itemsToCalculate.reduce((total, item) => 
      (!item.completed && !item.phantom) ? total + (item.price * item.quantity) : total, 0
    );
  };

  const getSortedItems = () => {
    return [...items].sort((a, b) => {
      switch (sortOption) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price-asc':
          return (a.price * a.quantity) - (b.price * b.quantity);
        case 'price-desc':
          return (b.price * b.quantity) - (a.price * a.quantity);
        case 'category':
          return (a.category || '').localeCompare(b.category || '');
        case 'date':
          // Put phantom items at the end when sorting by date
          if (a.phantom && !b.phantom) return 1;
          if (!a.phantom && b.phantom) return -1;
          return b.date.getTime() - a.date.getTime();
        default:
          return 0;
      }
    });
  };

  // Nueva función para obtener solo los productos fantasma
  const getPhantomItems = () => {
    return items.filter(item => item.phantom);
  };

  // Nueva función para obtener solo los productos normales
  const getRegularItems = () => {
    const regularItems = items.filter(item => !item.phantom);
    return regularItems.sort((a, b) => {
      switch (sortOption) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price-asc':
          return (a.price * a.quantity) - (b.price * b.quantity);
        case 'price-desc':
          return (b.price * b.quantity) - (a.price * a.quantity);
        case 'category':
          return (a.category || '').localeCompare(b.category || '');
        case 'date':
          return b.date.getTime() - a.date.getTime();
        default:
          return 0;
      }
    });
  };

  const getItemsByCategory = () => {
    const categorizedItems: Record<string, ShoppingItem[]> = {};
    
    getSortedItems().forEach(item => {
      const category = item.category || 'uncategorized';
      if (!categorizedItems[category]) {
        categorizedItems[category] = [];
      }
      categorizedItems[category].push(item);
    });
    
    return categorizedItems;
  };

  return {
    items,
    setItems,
    sortOption,
    setSortOption,
    categories,
    setCategories,
    addItem,
    removeItem,
    toggleItemCompletion,
    updateItemQuantity,
    clearAllItems,
    calculateTotal,
    getSortedItems,
    getItemsByCategory,
    getPhantomItems, // Exportamos la nueva función
    getRegularItems // Exportamos la nueva función
  };
}

// Importado de storage-utils para evitar ciclos
function loadPurchaseHistoryFromStorage() {
  const savedHistory = localStorage.getItem('purchaseHistoryEntries');
  if (savedHistory) {
    try {
      const parsedHistory = JSON.parse(savedHistory);
      return parsedHistory.map((entry: any) => ({
        ...entry,
        date: new Date(entry.date),
        items: entry.items.map((item: any) => ({
          ...item,
          date: new Date(item.date)
        }))
      }));
    } catch (e) {
      console.error('Error parsing saved purchase history', e);
      return [];
    }
  }
  return [];
}

// Importado de storage-utils para evitar ciclos
function savePurchaseHistoryToStorage(history: any[]): void {
  localStorage.setItem('purchaseHistoryEntries', JSON.stringify(history));
}
