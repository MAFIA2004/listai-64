
import { ShoppingItem, PurchaseHistoryEntry, BudgetAlert, ShoppingPattern, ItemPurchaseHistory } from '@/types/shopping';
import { getDefaultPatterns } from './pattern-utils';

export {
  loadPurchaseHistoryFromStorage,
  savePurchaseHistoryToStorage,
  loadItemHistoryFromStorage,
  saveItemHistoryToStorage
} from '@/hooks/shopping/use-items-storage';

export function loadItemsFromStorage(): ShoppingItem[] {
  const savedItems = localStorage.getItem('shoppingItems');
  if (savedItems) {
    try {
      const parsedItems = JSON.parse(savedItems);
      return parsedItems.map((item: any) => ({
        ...item,
        date: new Date(item.date),
        quantity: item.quantity || 1,
        category: item.category || 'uncategorized'
      }));
    } catch (e) {
      console.error('Error parsing saved items', e);
      return [];
    }
  }
  return [];
}

export function loadBudgetFromStorage(): BudgetAlert {
  const savedBudget = localStorage.getItem('shoppingBudget');
  if (savedBudget) {
    try {
      return JSON.parse(savedBudget);
    } catch (e) {
      return { enabled: false, amount: 100, warningThreshold: 80 };
    }
  }
  return { enabled: false, amount: 100, warningThreshold: 80 };
}

export function loadPatternsFromStorage(): ShoppingPattern[] {
  const savedPatterns = localStorage.getItem('shoppingPatterns');
  if (savedPatterns) {
    try {
      return JSON.parse(savedPatterns);
    } catch (e) {
      return getDefaultPatterns();
    }
  }
  return getDefaultPatterns();
}

export function saveItemsToStorage(items: ShoppingItem[]): void {
  localStorage.setItem('shoppingItems', JSON.stringify(items));
}

export function saveBudgetToStorage(budget: BudgetAlert): void {
  localStorage.setItem('shoppingBudget', JSON.stringify(budget));
}

export function savePatternsToStorage(patterns: ShoppingPattern[]): void {
  localStorage.setItem('shoppingPatterns', JSON.stringify(patterns));
}

export function moveItemsToHistory(
  items: ShoppingItem[], 
  purchaseHistory: PurchaseHistoryEntry[],
  lastSavedDate: string
): { newItems: ShoppingItem[], newHistory: PurchaseHistoryEntry[] } {
  // Return early if no items to process
  if (items.length === 0) {
    return { newItems: [], newHistory: purchaseHistory };
  }

  // Create a new history entry with the last saved date
  const lastDate = lastSavedDate ? new Date(lastSavedDate) : new Date();
  const historyEntry: PurchaseHistoryEntry = {
    id: crypto.randomUUID(),
    date: lastDate,
    items: items,
    totalAmount: items.reduce((total: number, item: ShoppingItem) => 
      total + (item.price * item.quantity), 0)
  };
  
  // Add to history and return the updated state
  return { 
    newItems: [], 
    newHistory: [historyEntry, ...purchaseHistory] 
  };
}
