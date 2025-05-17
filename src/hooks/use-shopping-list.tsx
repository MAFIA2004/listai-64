import { useState, useEffect } from 'react';
import { categorizeItems } from '@/lib/gemini-service';
import { toast } from 'sonner';
import { ShoppingItem, PurchaseHistoryEntry, SortOption, BudgetAlert, ShoppingPattern, ItemPurchaseHistory, ShoppingListHook } from '@/types/shopping';
import { 
  getTodayDateString, 
  getLastSavedDate, 
  updateLastSavedDate 
} from '@/utils/date-utils';
import { 
  getDefaultPatterns, 
  checkForForgottenItems 
} from '@/utils/pattern-utils';
import { 
  checkBudgetAfterAddingItem, 
  getSavingSuggestions, 
  getPriorityItems 
} from '@/utils/budget-utils';
import { 
  updatePurchaseHistory, 
  checkPersonalizedSuggestions 
} from '@/utils/history-utils';
import {
  loadItemsFromStorage,
  loadPurchaseHistoryFromStorage,
  loadBudgetFromStorage,
  loadPatternsFromStorage,
  loadItemHistoryFromStorage,
  saveItemsToStorage,
  saveBudgetToStorage,
  savePatternsToStorage,
  saveItemHistoryToStorage,
  savePurchaseHistoryToStorage,
  moveItemsToHistory
} from '@/utils/storage-utils';

export type {
  ShoppingItem,
  PurchaseHistoryEntry
};

export function useShoppingList(): ShoppingListHook {
  const [items, setItems] = useState<ShoppingItem[]>(() => {
    const lastSavedDate = getLastSavedDate();
    const todayDateString = getTodayDateString();
    
    // If the last saved date is not today, we should move items to history and start fresh
    if (lastSavedDate && lastSavedDate !== todayDateString) {
      // Get saved items to move them to history
      const savedItems = loadItemsFromStorage();
      
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
      return [];
    }
    
    // If it's still the same day, load items normally
    updateLastSavedDate();
    return loadItemsFromStorage();
  });

  const [sortOption, setSortOption] = useState<SortOption>('date');
  const [categories, setCategories] = useState<Record<string, string[]>>({});
  
  // Purchase history state
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseHistoryEntry[]>(
    loadPurchaseHistoryFromStorage()
  );
  
  // Budget management
  const [budget, setBudget] = useState<BudgetAlert>(loadBudgetFromStorage());

  // Common item patterns (for forgotten items suggestions)
  const [commonPatterns, setCommonPatterns] = useState<ShoppingPattern[]>(loadPatternsFromStorage());

  // Item purchase history for personalized suggestions
  const [purchaseHistoryLocal, setPurchaseHistoryLocal] = useState<Record<string, ItemPurchaseHistory>>(
    loadItemHistoryFromStorage()
  );

  // Save items to localStorage whenever they change
  useEffect(() => {
    saveItemsToStorage(items);
  }, [items]);

  // Save budget settings to localStorage
  useEffect(() => {
    saveBudgetToStorage(budget);
  }, [budget]);

  // Save patterns to localStorage
  useEffect(() => {
    savePatternsToStorage(commonPatterns);
  }, [commonPatterns]);

  // Save purchase history to localStorage
  useEffect(() => {
    saveItemHistoryToStorage(purchaseHistoryLocal);
  }, [purchaseHistoryLocal]);

  // Save purchase history entries to localStorage
  useEffect(() => {
    savePurchaseHistoryToStorage(purchaseHistory);
  }, [purchaseHistory]);

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
  }, [items.map(item => item.id).join(',')]);

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
    
    setItems(prevItems => [...prevItems, newItem]);
    
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

  // Function to save the current list to purchase history
  const saveCurrentListToHistory = () => {
    // Only save if there are items in the list
    if (items.length === 0) return;
    
    const historyEntry: PurchaseHistoryEntry = {
      id: crypto.randomUUID(),
      date: new Date(),
      items: [...items],
      totalAmount: calculateTotal()
    };
    
    setPurchaseHistory(prev => [historyEntry, ...prev]);
  };

  // Function to clear the entire shopping list
  const clearAllItems = () => {
    // Save completed items to history before clearing
    const completedItems = items.filter(item => item.completed);
    
    if (completedItems.length > 0) {
      const historyEntry: PurchaseHistoryEntry = {
        id: crypto.randomUUID(),
        date: new Date(),
        items: completedItems,
        totalAmount: completedItems.reduce((total, item) => total + (item.price * item.quantity), 0)
      };
      
      setPurchaseHistory(prev => [historyEntry, ...prev]);
    }
    
    setItems([]);
    toast.success('Lista de compras eliminada');
  };

  const removeItem = (id: string) => {
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

  // Function to restore a list from history
  const restoreListFromHistory = (historyEntryId: string) => {
    const historyEntry = purchaseHistory.find(entry => entry.id === historyEntryId);
    
    if (!historyEntry) return;
    
    const restoredItems = historyEntry.items.map(item => ({
      ...item,
      id: crypto.randomUUID(), // Generate new IDs for the restored items
      date: new Date(), // Set the date to now
      completed: false // Reset completion status
    }));
    
    // Add all items from the history entry to the current list
    setItems(prev => [...prev, ...restoredItems]);
    toast.success('Lista restaurada correctamente');
  };

  // Function to delete a history entry
  const deleteHistoryEntry = (historyEntryId: string) => {
    setPurchaseHistory(prev => prev.filter(entry => entry.id !== historyEntryId));
    toast.success('Lista eliminada del historial');
  };

  // Add the deleteAllHistory function
  const deleteAllHistory = () => {
    setPurchaseHistory([]);
    toast.success('Historial eliminado completamente');
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

  const calculateTotal = () => {
    return items.reduce((total, item) => 
      !item.completed ? total + (item.price * item.quantity) : total, 0
    );
  };

  // Budget management functions
  const updateBudget = (newBudget: Partial<BudgetAlert>) => {
    setBudget(prev => ({ ...prev, ...newBudget }));
  };

  return {
    items: getSortedItems(),
    itemsByCategory: getItemsByCategory(),
    addItem,
    removeItem,
    clearAllItems,
    toggleItemCompletion,
    updateItemQuantity,
    sortOption,
    setSortOption,
    totalPrice: calculateTotal(),
    categories: Object.keys(getItemsByCategory()),
    // Budget functions
    budget,
    updateBudget,
    getSavingSuggestions: () => getSavingSuggestions(items),
    getPriorityItems: (maxBudget) => getPriorityItems(items, maxBudget),
    // Pattern functions
    commonPatterns,
    setCommonPatterns,
    // History functions
    purchaseHistory,
    restoreListFromHistory,
    deleteHistoryEntry,
    deleteAllHistory, // Add the new function to the return object
    // Auto save to history function
    saveCurrentListToHistory
  };
}
