
import { ShoppingItem, PurchaseHistoryEntry, BudgetAlert, ShoppingPattern, ItemPurchaseHistory } from '@/types/shopping';
import { getDefaultPatterns } from './pattern-utils';

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

export function loadPurchaseHistoryFromStorage(): PurchaseHistoryEntry[] {
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

export function loadItemHistoryFromStorage(): Record<string, ItemPurchaseHistory> {
  const savedHistory = localStorage.getItem('purchaseHistory');
  if (savedHistory) {
    try {
      const parsed = JSON.parse(savedHistory);
      // Convert string dates back to Date objects
      const converted: Record<string, ItemPurchaseHistory> = {};
      for (const [key, value] of Object.entries(parsed)) {
        converted[key] = {
          frequency: (value as any).frequency,
          lastBought: new Date((value as any).lastBought)
        };
      }
      return converted;
    } catch (e) {
      return {};
    }
  }
  return {};
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

export function saveItemHistoryToStorage(history: Record<string, ItemPurchaseHistory>): void {
  localStorage.setItem('purchaseHistory', JSON.stringify(history));
}

export function savePurchaseHistoryToStorage(history: PurchaseHistoryEntry[]): void {
  localStorage.setItem('purchaseHistoryEntries', JSON.stringify(history));
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
