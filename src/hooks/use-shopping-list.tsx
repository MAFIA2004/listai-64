
import { useEffect } from 'react';
import { ShoppingItem, PurchaseHistoryEntry, SortOption, BudgetAlert, ShoppingPattern, ItemPurchaseHistory, ShoppingListHook } from '@/types/shopping';
import { savePurchaseHistoryToStorage } from '@/utils/storage-utils';
import { useItemsState } from './shopping/use-items-state';
import { useHistoryState } from './shopping/use-history-state';
import { useBudgetState } from './shopping/use-budget-state';
import { usePatternsState } from './shopping/use-patterns-state';
import { useCategorization } from './shopping/use-categorization';

export type {
  ShoppingItem,
  PurchaseHistoryEntry
};

export function useShoppingList(): ShoppingListHook {
  // Estados internos
  const { 
    commonPatterns, 
    setCommonPatterns,
    purchaseHistoryLocal,
    setPurchaseHistoryLocal 
  } = usePatternsState();
  
  const {
    budget,
    updateBudget,
    getSavingSuggestionsWrapper,
    getPriorityItemsWrapper
  } = useBudgetState();
  
  const {
    purchaseHistory,
    setPurchaseHistory,
    saveCurrentListToHistory: saveToHistory,
    restoreListFromHistory: restoreFromHistory,
    deleteHistoryEntry,
    deleteAllHistory
  } = useHistoryState();
  
  const {
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
    getPhantomItems, // Nueva función
    getRegularItems // Nueva función
  } = useItemsState(
    budget, 
    commonPatterns, 
    setCommonPatterns, 
    purchaseHistoryLocal, 
    setPurchaseHistoryLocal,
    setPurchaseHistory
  );
  
  // Usar el hook de categorización
  useCategorization(items, setItems, setCategories);
  
  // Guardar historial de compras en localStorage
  useEffect(() => {
    savePurchaseHistoryToStorage(purchaseHistory);
  }, [purchaseHistory]);
  
  // Wrappers para funciones que necesitan acceso a estados
  const saveCurrentListToHistory = () => saveToHistory(items);
  const restoreListFromHistory = (id: string) => restoreFromHistory(id, setItems);

  return {
    items: getSortedItems(),
    phantomItems: getPhantomItems(), // Retornamos los productos fantasma
    regularItems: getRegularItems(), // Retornamos los productos normales
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
    getSavingSuggestions: () => getSavingSuggestionsWrapper(items),
    getPriorityItems: (maxBudget) => getPriorityItemsWrapper(items, maxBudget),
    // Pattern functions
    commonPatterns,
    setCommonPatterns,
    // History functions
    purchaseHistory,
    restoreListFromHistory,
    deleteHistoryEntry,
    deleteAllHistory,
    // Auto save to history function
    saveCurrentListToHistory
  };
}
