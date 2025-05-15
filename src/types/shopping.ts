
import { Dispatch, SetStateAction } from 'react';

export interface ShoppingItem {
  id: string;
  name: string;
  price: number;
  completed: boolean;
  date: Date;
  category?: string;
  quantity: number;
}

export interface PurchaseHistoryEntry {
  id: string;
  date: Date;
  items: ShoppingItem[];
  totalAmount: number;
}

export type SortOption = 'name' | 'price-asc' | 'price-desc' | 'date' | 'category';

export interface BudgetAlert {
  enabled: boolean;
  amount: number;
  warningThreshold: number; // percentage (e.g., 80 means warn at 80% of budget)
}

export interface ShoppingPattern {
  trigger: string[];
  suggestion: string;
  lastShown?: Date;
}

export interface ItemPurchaseHistory {
  frequency: number;
  lastBought: Date;
}

export interface ShoppingListHook {
  items: ShoppingItem[];
  itemsByCategory: Record<string, ShoppingItem[]>;
  addItem: (name: string, price: number, quantity?: number, category?: string) => void;
  removeItem: (id: string) => void;
  clearAllItems: () => void;
  toggleItemCompletion: (id: string) => void;
  updateItemQuantity: (id: string, quantity: number) => void;
  sortOption: SortOption;
  setSortOption: Dispatch<SetStateAction<SortOption>>;
  totalPrice: number;
  categories: string[];
  budget: BudgetAlert;
  updateBudget: (newBudget: Partial<BudgetAlert>) => void;
  getSavingSuggestions: () => { original: ShoppingItem; alternative: ShoppingItem; savings: number }[];
  getPriorityItems: (maxBudget: number) => { withinBudget: ShoppingItem[]; outsideBudget: ShoppingItem[] };
  commonPatterns: ShoppingPattern[];
  setCommonPatterns: Dispatch<SetStateAction<ShoppingPattern[]>>;
  purchaseHistory: PurchaseHistoryEntry[];
  restoreListFromHistory: (historyEntryId: string) => void;
  deleteHistoryEntry: (historyEntryId: string) => void;
}
