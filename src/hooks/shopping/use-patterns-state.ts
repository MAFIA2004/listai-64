
import { useState } from 'react';
import { ShoppingPattern, ItemPurchaseHistory } from '@/types/shopping';
import {
  loadPatternsFromStorage,
  savePatternsToStorage,
  loadItemHistoryFromStorage,
  saveItemHistoryToStorage
} from '@/utils/storage-utils';

export function usePatternsState() {
  // Common item patterns (for forgotten items suggestions)
  const [commonPatterns, setCommonPatterns] = useState<ShoppingPattern[]>(loadPatternsFromStorage());

  // Item purchase history for personalized suggestions
  const [purchaseHistoryLocal, setPurchaseHistoryLocal] = useState<Record<string, ItemPurchaseHistory>>(
    loadItemHistoryFromStorage()
  );

  // Save patterns to localStorage when they change
  const updatePatterns = (patterns: ShoppingPattern[]) => {
    setCommonPatterns(patterns);
    savePatternsToStorage(patterns);
  };

  // Save purchase history to localStorage when it changes
  const updatePurchaseHistoryLocal = (history: Record<string, ItemPurchaseHistory>) => {
    setPurchaseHistoryLocal(history);
    saveItemHistoryToStorage(history);
  };

  return {
    commonPatterns,
    setCommonPatterns: updatePatterns,
    purchaseHistoryLocal,
    setPurchaseHistoryLocal: updatePurchaseHistoryLocal
  };
}
