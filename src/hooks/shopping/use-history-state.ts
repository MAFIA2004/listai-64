import { useState } from 'react';
import { 
  PurchaseHistoryEntry,
  ShoppingItem
} from '@/types/shopping';
import { toast } from 'sonner';
import {
  loadPurchaseHistoryFromStorage,
  savePurchaseHistoryToStorage
} from '@/utils/storage-utils';

export function useHistoryState() {
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseHistoryEntry[]>(
    loadPurchaseHistoryFromStorage()
  );

  // Guardar historial en localStorage cuando cambie
  const saveCurrentListToHistory = (items: ShoppingItem[]) => {
    // Only save if there are items in the list
    if (items.length === 0) return;
    
    // Filter out phantom items before saving to history
    const nonPhantomItems = items.filter(item => !item.phantom);
    
    if (nonPhantomItems.length === 0) return; // Don't save if there are only phantom items
    
    const historyEntry: PurchaseHistoryEntry = {
      id: crypto.randomUUID(),
      date: new Date(),
      items: [...nonPhantomItems],
      totalAmount: nonPhantomItems.reduce((total, item) => total + (item.price * item.quantity), 0)
    };
    
    const updatedHistory = [historyEntry, ...purchaseHistory];
    setPurchaseHistory(updatedHistory);
    savePurchaseHistoryToStorage(updatedHistory);
  };

  // Function to restore a list from history
  const restoreListFromHistory = (
    historyEntryId: string,
    setItems: React.Dispatch<React.SetStateAction<ShoppingItem[]>>
  ) => {
    const historyEntry = purchaseHistory.find(entry => entry.id === historyEntryId);
    
    if (!historyEntry) return;
    
    const restoredItems = historyEntry.items.map(item => ({
      ...item,
      id: crypto.randomUUID(), // Generate new IDs for the restored items
      date: new Date(), // Set the date to now
      completed: false // Reset completion status
    }));
    
    // Add all items from the history entry to the current list
    // Ensure we keep the phantom items
    setItems(prev => {
      const phantomItemsFromPrev = prev.filter(item => item.phantom);
      return [...phantomItemsFromPrev, ...restoredItems];
    });
    toast.success('Lista restaurada correctamente');
  };

  // Function to delete a history entry
  const deleteHistoryEntry = (historyEntryId: string) => {
    const updatedHistory = purchaseHistory.filter(entry => entry.id !== historyEntryId);
    setPurchaseHistory(updatedHistory);
    savePurchaseHistoryToStorage(updatedHistory);
    toast.success('Lista eliminada del historial');
  };

  // Add the deleteAllHistory function
  const deleteAllHistory = () => {
    setPurchaseHistory([]);
    savePurchaseHistoryToStorage([]);
    toast.success('Historial eliminado completamente');
  };

  return {
    purchaseHistory,
    setPurchaseHistory,
    saveCurrentListToHistory,
    restoreListFromHistory,
    deleteHistoryEntry,
    deleteAllHistory
  };
}
