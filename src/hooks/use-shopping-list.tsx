import { useState, useEffect } from 'react';
import { categorizeItems } from '@/lib/gemini-service';
import { toast } from 'sonner';
import { playBudgetExceededSound } from '@/lib/sound-utils';
import { format } from 'date-fns';

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

type SortOption = 'name' | 'price-asc' | 'price-desc' | 'date' | 'category';

interface BudgetAlert {
  enabled: boolean;
  amount: number;
  warningThreshold: number; // percentage (e.g., 80 means warn at 80% of budget)
}

interface ShoppingPattern {
  trigger: string[];
  suggestion: string;
  lastShown?: Date;
}

export function useShoppingList() {
  // Get today's date in yyyy-MM-dd format
  const getTodayDateString = () => {
    return format(new Date(), 'yyyy-MM-dd');
  };

  // Get the last saved date
  const getLastSavedDate = () => {
    return localStorage.getItem('lastShoppingDate') || '';
  };

  // Set the last saved date to today
  const updateLastSavedDate = () => {
    localStorage.setItem('lastShoppingDate', getTodayDateString());
  };

  const [items, setItems] = useState<ShoppingItem[]>(() => {
    const lastSavedDate = getLastSavedDate();
    const todayDateString = getTodayDateString();
    
    // If the last saved date is not today, we should move items to history and start fresh
    if (lastSavedDate && lastSavedDate !== todayDateString) {
      // Get saved items to move them to history
      const savedItems = localStorage.getItem('shoppingItems');
      if (savedItems) {
        try {
          const parsedItems = JSON.parse(savedItems);
          const validItems = parsedItems.map((item: any) => ({
            ...item,
            date: new Date(item.date),
            quantity: item.quantity || 1,
            category: item.category || 'uncategorized'
          }));
          
          if (validItems.length > 0) {
            // Get existing history
            const savedHistory = localStorage.getItem('purchaseHistoryEntries');
            let history: PurchaseHistoryEntry[] = [];
            
            if (savedHistory) {
              try {
                history = JSON.parse(savedHistory).map((entry: any) => ({
                  ...entry,
                  date: new Date(entry.date),
                  items: entry.items.map((item: any) => ({
                    ...item,
                    date: new Date(item.date)
                  }))
                }));
              } catch (e) {
                console.error('Error parsing saved purchase history', e);
              }
            }
            
            // Create a new history entry with yesterday's date
            const lastDate = lastSavedDate ? new Date(lastSavedDate) : new Date();
            const historyEntry: PurchaseHistoryEntry = {
              id: crypto.randomUUID(),
              date: lastDate,
              items: validItems,
              totalAmount: validItems.reduce((total: number, item: ShoppingItem) => 
                total + (item.price * item.quantity), 0)
            };
            
            // Add to history and save
            history = [historyEntry, ...history];
            localStorage.setItem('purchaseHistoryEntries', JSON.stringify(history));
            
            // Clear current items for today
            localStorage.removeItem('shoppingItems');
          }
        } catch (e) {
          console.error('Error processing previous day items', e);
        }
      }
      
      // Update the last saved date to today
      updateLastSavedDate();
      return [];
    }
    
    // If it's still the same day, load items normally
    updateLastSavedDate();
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
  });

  const [sortOption, setSortOption] = useState<SortOption>('date');
  const [categories, setCategories] = useState<Record<string, string[]>>({});
  
  // Purchase history state
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseHistoryEntry[]>(() => {
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
  });
  
  // Budget management
  const [budget, setBudget] = useState<BudgetAlert>(() => {
    const savedBudget = localStorage.getItem('shoppingBudget');
    if (savedBudget) {
      try {
        return JSON.parse(savedBudget);
      } catch (e) {
        return { enabled: false, amount: 100, warningThreshold: 80 };
      }
    }
    return { enabled: false, amount: 100, warningThreshold: 80 };
  });

  // Common item patterns (for forgotten items suggestions)
  const [commonPatterns, setCommonPatterns] = useState<ShoppingPattern[]>(() => {
    const savedPatterns = localStorage.getItem('shoppingPatterns');
    if (savedPatterns) {
      try {
        return JSON.parse(savedPatterns);
      } catch (e) {
        return getDefaultPatterns();
      }
    }
    return getDefaultPatterns();
  });

  // Item purchase history for personalized suggestions
  const [purchaseHistoryLocal, setPurchaseHistoryLocal] = useState<Record<string, { frequency: number, lastBought: Date }>>(() => {
    const savedHistory = localStorage.getItem('purchaseHistory');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        // Convert string dates back to Date objects
        const converted: Record<string, { frequency: number, lastBought: Date }> = {};
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
  });

  // Save items to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('shoppingItems', JSON.stringify(items));
  }, [items]);

  // Save budget settings to localStorage
  useEffect(() => {
    localStorage.setItem('shoppingBudget', JSON.stringify(budget));
  }, [budget]);

  // Save patterns to localStorage
  useEffect(() => {
    localStorage.setItem('shoppingPatterns', JSON.stringify(commonPatterns));
  }, [commonPatterns]);

  // Save purchase history to localStorage
  useEffect(() => {
    localStorage.setItem('purchaseHistory', JSON.stringify(purchaseHistoryLocal));
  }, [purchaseHistoryLocal]);

  // Save purchase history entries to localStorage
  useEffect(() => {
    localStorage.setItem('purchaseHistoryEntries', JSON.stringify(purchaseHistory));
  }, [purchaseHistory]);

  // Categorize items when they change
  useEffect(() => {
    async function updateCategories() {
      if (items.length === 0) return;
      
      // Only categorize items that don't have a category yet
      const uncategorizedItems = items
        .filter(item => !item.category || item.category === 'uncategorized')
        .map(item => item.name);
      
      if (uncategorizedItems.length === 0) return;
      
      try {
        const result = await categorizeItems(uncategorizedItems);
        
        if (result?.categories) {
          setCategories(result.categories);
          
          // Update item categories
          setItems(prevItems => {
            const updatedItems = [...prevItems];
            
            // Map each item to its category
            for (const [category, categoryItems] of Object.entries(result.categories)) {
              for (const categoryItem of categoryItems) {
                // Find all items that match this name
                updatedItems.forEach((item, index) => {
                  if (item.name.toLowerCase() === categoryItem.toLowerCase()) {
                    updatedItems[index] = { ...item, category };
                  }
                });
              }
            }
            
            return updatedItems;
          });
        }
      } catch (error) {
        console.error('Error categorizing items:', error);
      }
    }
    
    updateCategories();
  }, [items.map(item => item.id).join(',')]);

  const addItem = (name: string, price: number, quantity: number = 1, category?: string) => {
    // Check if item with same name exists
    const existingItem = items.find(item => 
      item.name.toLowerCase() === name.toLowerCase() && !item.completed);
    
    if (existingItem) {
      // Update quantity instead of adding new item
      setItems(prevItems => prevItems.map(item => 
        item.id === existingItem.id 
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
      toast.success(`Cantidad actualizada: ${name} (${existingItem.quantity + quantity})`);
      
      // Check budget after updating quantity
      checkBudgetAfterAddingItem(existingItem.price * quantity);
      return;
    }
    
    const newItem: ShoppingItem = {
      id: crypto.randomUUID(),
      name,
      price,
      quantity,
      completed: false,
      date: new Date(),
      category: category || 'uncategorized',
    };
    
    setItems(prevItems => [...prevItems, newItem]);
    
    // Check for forgotten related items
    checkForForgottenItems(name);
    
    // Check budget after adding item
    checkBudgetAfterAddingItem(price * quantity);
  };

  // Function to clear the entire shopping list
  const clearAllItems = () => {
    // Save completed items to history before clearing
    const completedItems = items.filter(item => item.completed);
    
    if (completedItems.length > 0) {
      const historyEntry: PurchaseHistoryEntry = {
        id: crypto.randomUUID(),
        date: new Date(),
        items: completedItems,
        totalAmount: completedItems.reduce((total, item) => total + (item.price * item.quantity), 0)
      };
      
      setPurchaseHistory(prev => [historyEntry, ...prev]);
    }
    
    setItems([]);
    toast.success('Lista de compras eliminada');
  };

  const removeItem = (id: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const toggleItemCompletion = (id: string) => {
    setItems(prevItems => prevItems.map(item => {
      if (item.id === id) {
        const newCompletedState = !item.completed;
        
        // If marking as completed, update purchase history
        if (newCompletedState) {
          updatePurchaseHistory(item.name);
        }
        
        return { ...item, completed: newCompletedState };
      }
      return item;
    }));
  };

  const updateItemQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    
    setItems(prevItems => prevItems.map(item => 
      item.id === id ? { ...item, quantity } : item
    ));
  };

  // Function to restore a list from history
  const restoreListFromHistory = (historyEntryId: string) => {
    const historyEntry = purchaseHistory.find(entry => entry.id === historyEntryId);
    
    if (!historyEntry) return;
    
    const restoredItems = historyEntry.items.map(item => ({
      ...item,
      id: crypto.randomUUID(), // Generate new IDs for the restored items
      date: new Date(), // Set the date to now
      completed: false // Reset completion status
    }));
    
    // Add all items from the history entry to the current list
    setItems(prev => [...prev, ...restoredItems]);
    toast.success('Lista restaurada correctamente');
  };

  // Function to delete a history entry
  const deleteHistoryEntry = (historyEntryId: string) => {
    setPurchaseHistory(prev => prev.filter(entry => entry.id !== historyEntryId));
    toast.success('Lista eliminada del historial');
  };

  const getSortedItems = () => {
    return [...items].sort((a, b) => {
      switch (sortOption) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price-asc':
          return (a.price * a.quantity) - (b.price * b.quantity);
        case 'price-desc':
          return (b.price * b.quantity) - (a.price * a.quantity);
        case 'category':
          return (a.category || '').localeCompare(b.category || '');
        case 'date':
          return b.date.getTime() - a.date.getTime();
        default:
          return 0;
      }
    });
  };

  const getItemsByCategory = () => {
    const categorizedItems: Record<string, ShoppingItem[]> = {};
    
    getSortedItems().forEach(item => {
      const category = item.category || 'uncategorized';
      if (!categorizedItems[category]) {
        categorizedItems[category] = [];
      }
      categorizedItems[category].push(item);
    });
    
    return categorizedItems;
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => 
      !item.completed ? total + (item.price * item.quantity) : total, 0
    );
  };

  // Budget management functions
  const updateBudget = (newBudget: Partial<BudgetAlert>) => {
    setBudget(prev => ({ ...prev, ...newBudget }));
  };

  const checkBudgetAfterAddingItem = (itemTotal: number) => {
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
  };

  const getSavingSuggestions = () => {
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
  };

  const getPriorityItems = (maxBudget: number) => {
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
  };

  // Functions for forgotten items suggestions
  function getDefaultPatterns(): ShoppingPattern[] {
    return [
      { trigger: ['cereales'], suggestion: '¿Necesitas leche también?' },
      { trigger: ['pasta', 'espaguetis', 'macarrones'], suggestion: '¿Quieres añadir salsa de tomate?' },
      { trigger: ['harina', 'azúcar', 'levadura'], suggestion: '¿Estás horneando? ¿Necesitas huevos?' },
      { trigger: ['queso', 'jamón', 'pan de molde'], suggestion: '¿Vas a hacer sandwiches? ¿Necesitas mayonesa?' },
      { trigger: ['hamburguesa', 'salchichas'], suggestion: '¿Necesitas pan de hamburguesa?' },
      { trigger: ['pizza', 'base de pizza', 'masa de pizza'], suggestion: '¿Has incluido queso mozzarella?' }
    ];
  }

  function checkForForgottenItems(itemName: string) {
    const normalizedName = itemName.toLowerCase();
    
    // Check against predefined patterns
    for (const pattern of commonPatterns) {
      // Skip if suggestion was shown recently (in the last hour)
      if (pattern.lastShown && (new Date().getTime() - pattern.lastShown.getTime() < 3600000)) {
        continue;
      }
      
      // Check if the new item is in any trigger list
      if (pattern.trigger.some(trigger => normalizedName.includes(trigger.toLowerCase()))) {
        // Check if we already have any of the implied items
        if (!hasSuggestedItemsAlready(pattern, normalizedName)) {
          // Show suggestion toast
          toast('Sugerencia de lista', {
            description: pattern.suggestion,
            action: {
              label: "Cerrar",
              onClick: () => {}
            },
          });
          
          // Update the lastShown timestamp
          setCommonPatterns(prev => prev.map(p => 
            p.trigger.join(',') === pattern.trigger.join(',') 
              ? { ...p, lastShown: new Date() } 
              : p
          ));
          
          // Only show one suggestion at a time
          break;
        }
      }
    }
    
    // Also check personalized purchase patterns
    checkPersonalizedSuggestions(normalizedName);
  }

  function hasSuggestedItemsAlready(pattern: ShoppingPattern, excludeItem: string): boolean {
    // This is a simple check - in a real app, we'd use NLP to match related items
    const suggestion = pattern.suggestion.toLowerCase();
    
    // Extract item names from the suggestion
    const possibleItems = suggestion.match(/(?:añadir|necesitas|incluido)\s+([a-zñáéíóú\s]+?)(?:\?|$)/i);
    
    if (possibleItems && possibleItems[1]) {
      const suggestedItem = possibleItems[1].trim();
      
      // Check if we already have this item
      return items.some(item => 
        item.name.toLowerCase().includes(suggestedItem) && 
        !item.completed &&
        !item.name.toLowerCase().includes(excludeItem)
      );
    }
    
    return false;
  }

  function updatePurchaseHistory(itemName: string) {
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

  function checkPersonalizedSuggestions(newItemName: string) {
    // This implementation is simplified
    // In a real app, we'd use ML to identify correlated purchases
    
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
    
    // Suggest the most frequently co-purchased item
    if (relatedItems.length > 0) {
      toast('Basado en tus compras', {
        description: `Normalmente compras ${relatedItems[0][0]} junto con ${newItemName}. ¿Quieres añadirlo?`,
        action: {
          label: "Cerrar",
          onClick: () => {}
        },
      });
    }
  }

  return {
    items: getSortedItems(),
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
    getSavingSuggestions,
    getPriorityItems,
    // Pattern functions
    commonPatterns,
    setCommonPatterns,
    // History functions
    purchaseHistory,
    restoreListFromHistory,
    deleteHistoryEntry
  };
}
