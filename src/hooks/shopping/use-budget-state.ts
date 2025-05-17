
import { useState } from 'react';
import { BudgetAlert, ShoppingItem } from '@/types/shopping';
import {
  loadBudgetFromStorage,
  saveBudgetToStorage
} from '@/utils/storage-utils';
import { getSavingSuggestions, getPriorityItems } from '@/utils/budget-utils';

export function useBudgetState() {
  const [budget, setBudget] = useState<BudgetAlert>(loadBudgetFromStorage());

  // Guardar configuraciones de presupuesto en localStorage cuando cambien
  const updateBudget = (newBudget: Partial<BudgetAlert>) => {
    const updatedBudget = { ...budget, ...newBudget };
    setBudget(updatedBudget);
    saveBudgetToStorage(updatedBudget);
  };

  const getSavingSuggestionsWrapper = (items: ShoppingItem[]) => {
    return getSavingSuggestions(items.filter(item => !item.phantom));
  };

  const getPriorityItemsWrapper = (items: ShoppingItem[], maxBudget: number) => {
    return getPriorityItems(items.filter(item => !item.phantom), maxBudget);
  };

  return {
    budget,
    updateBudget,
    getSavingSuggestionsWrapper,
    getPriorityItemsWrapper
  };
}
