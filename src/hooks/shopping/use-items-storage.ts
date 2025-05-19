
import { PurchaseHistoryEntry, ItemPurchaseHistory } from '@/types/shopping';

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

export function savePurchaseHistoryToStorage(history: PurchaseHistoryEntry[]): void {
  localStorage.setItem('purchaseHistoryEntries', JSON.stringify(history));
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

export function saveItemHistoryToStorage(history: Record<string, ItemPurchaseHistory>): void {
  localStorage.setItem('purchaseHistory', JSON.stringify(history));
}
