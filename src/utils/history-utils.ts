
import { PurchaseHistoryEntry, ShoppingItem, ItemPurchaseHistory } from '@/types/shopping';

export function updatePurchaseHistory(
  itemName: string,
  purchaseHistoryLocal: Record<string, ItemPurchaseHistory>,
  setPurchaseHistoryLocal: React.Dispatch<React.SetStateAction<Record<string, ItemPurchaseHistory>>>
): void {
  setPurchaseHistoryLocal(prev => {
    const history = { ...prev };
    const normalizedName = itemName.toLowerCase();
    
    if (history[normalizedName]) {
      history[normalizedName] = {
        frequency: history[normalizedName].frequency + 1,
        lastBought: new Date()
      };
    } else {
      history[normalizedName] = {
        frequency: 1,
        lastBought: new Date()
      };
    }
    
    return history;
  });
}

export function checkPersonalizedSuggestions(
  newItemName: string,
  items: ShoppingItem[],
  purchaseHistoryLocal: Record<string, ItemPurchaseHistory>
) {
  // Find items frequently bought with the new item
  const relatedItems: [string, number][] = [];
  
  // Simple algorithm: if items are frequently bought together (within 1 day)
  // and one is added, suggest the other
  items.forEach(item => {
    const name = item.name.toLowerCase();
    if (name !== newItemName && !items.find(i => i.name.toLowerCase() === name && !i.completed)) {
      // Check purchase history correlation
      const itemHistory = purchaseHistoryLocal[name];
      const newItemHistory = purchaseHistoryLocal[newItemName];
      
      if (itemHistory && newItemHistory && itemHistory.frequency > 1) {
        // If both items were bought within a day of each other multiple times
        const daysDiff = Math.abs(
          (itemHistory.lastBought.getTime() - newItemHistory.lastBought.getTime()) / (1000 * 3600 * 24)
        );
        
        if (daysDiff < 1) {
          relatedItems.push([name, itemHistory.frequency]);
        }
      }
    }
  });
  
  // Sort by frequency
  relatedItems.sort((a, b) => b[1] - a[1]);
  
  // Return the most frequently co-purchased item
  return relatedItems.length > 0 ? {
    itemName: relatedItems[0][0],
    relatedItem: newItemName
  } : null;
}
