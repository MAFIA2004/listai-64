
import { useState, useEffect } from 'react';
import { ShoppingItem, SortOption } from '@/types/shopping';
import { 
  loadItemsFromStorage,
  saveItemsToStorage
} from '@/utils/storage-utils';
import {
  getTodayDateString,
  getLastSavedDate,
  updateLastSavedDate
} from '@/utils/date-utils';
import { phantomItems, ensurePhantomItems } from './use-phantom-items';
import { useItemsActions } from './use-items-actions';
import { useItemsSorting } from './use-items-sorting';
import { loadPurchaseHistoryFromStorage, savePurchaseHistoryToStorage } from './use-items-storage';

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
        
        // Create a new history entry with the last saved date
        const historyEntry = {
          id: crypto.randomUUID(),
          date: new Date(lastSavedDate),
          items: savedItems,
          totalAmount: savedItems.reduce((total, item) => total + (item.price * item.quantity), 0)
        };
        
        // Add to history and save
        const newHistory = [historyEntry, ...savedHistory];
        savePurchaseHistoryToStorage(newHistory);
        
        // Clear current items for today
        localStorage.removeItem('shoppingItems');
      }
      
      // Update the last saved date to today
      updateLastSavedDate();
      return [...phantomItems]; // Start with phantom items
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

  // Import sorting functions
  const { 
    getSortedItems,
    getPhantomItems,
    getRegularItems,
    getItemsByCategory,
    calculateTotal
  } = useItemsSorting(items, sortOption);

  // Import action functions
  const {
    addItem,
    removeItem,
    toggleItemCompletion,
    updateItemQuantity,
    clearAllItems
  } = useItemsActions(
    items, 
    setItems, 
    budget, 
    commonPatterns, 
    setCommonPatterns, 
    purchaseHistoryLocal, 
    setPurchaseHistoryLocal, 
    setPurchaseHistory,
    calculateTotal
  );

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
    getPhantomItems,
    getRegularItems
  };
}
