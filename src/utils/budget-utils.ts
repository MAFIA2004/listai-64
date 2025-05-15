
import { ShoppingItem, BudgetAlert } from '@/types/shopping';
import { toast } from 'sonner';
import { playBudgetExceededSound } from '@/lib/sound-utils';

export function checkBudgetAfterAddingItem(
  itemTotal: number,
  budget: BudgetAlert,
  calculateTotal: () => number
): void {
  if (!budget.enabled) return;

  const currentTotal = calculateTotal();
  const budgetAmount = budget.amount;
  const warningThreshold = budgetAmount * (budget.warningThreshold / 100);

  // If we just crossed the warning threshold
  if (currentTotal > warningThreshold && currentTotal - itemTotal <= warningThreshold) {
    toast.warning(`¡Atención al presupuesto!`, {
      description: `Has superado el ${budget.warningThreshold}% de tu presupuesto (${budgetAmount}€)`
    });
  }
  
  // If we exceed the budget
  if (currentTotal > budgetAmount && currentTotal - itemTotal <= budgetAmount) {
    toast.error(`¡Has excedido tu presupuesto!`, {
      description: `Tu presupuesto es de ${budgetAmount}€ y llevas ${currentTotal.toFixed(2)}€`
    });
    
    // Play sound when budget is exceeded
    playBudgetExceededSound();
  }
}

export function getSavingSuggestions(items: ShoppingItem[]) {
  // Group items by similar names (simple implementation)
  const itemGroups: Record<string, ShoppingItem[]> = {};
  
  items.forEach(item => {
    if (item.completed) return;
    
    // Simple normalization
    const normalizedName = item.name.toLowerCase()
      .replace(/\s+/g, '')
      .replace(/[^a-z]/g, '');
      
    if (!itemGroups[normalizedName]) {
      itemGroups[normalizedName] = [];
    }
    
    itemGroups[normalizedName].push(item);
  });
  
  const suggestions: { original: ShoppingItem, alternative: ShoppingItem, savings: number }[] = [];
  
  // Find items with the same normalized name but different prices
  Object.values(itemGroups).forEach(group => {
    if (group.length > 1) {
      // Sort by price
      group.sort((a, b) => (a.price * a.quantity) - (b.price * b.quantity));
      
      // Compare cheapest with others
      const cheapest = group[0];
      for (let i = 1; i < group.length; i++) {
        const expensive = group[i];
        const priceDiff = (expensive.price - cheapest.price) / expensive.price * 100;
        
        // If price difference is significant (>10%)
        if (priceDiff > 10) {
          suggestions.push({
            original: expensive,
            alternative: cheapest,
            savings: priceDiff
          });
        }
      }
    }
  });
  
  return suggestions;
}

export function getPriorityItems(items: ShoppingItem[], maxBudget: number) {
  const pendingItems = items.filter(item => !item.completed);
  
  // Sort items by price per unit (ascending)
  const sortedItems = [...pendingItems].sort((a, b) => a.price - b.price);
  
  // Find which items fit within the budget
  let currentTotal = 0;
  const withinBudget: ShoppingItem[] = [];
  const outsideBudget: ShoppingItem[] = [];
  
  for (const item of sortedItems) {
    const itemTotal = item.price * item.quantity;
    if (currentTotal + itemTotal <= maxBudget) {
      withinBudget.push(item);
      currentTotal += itemTotal;
    } else {
      outsideBudget.push(item);
    }
  }
  
  return { withinBudget, outsideBudget };
}
