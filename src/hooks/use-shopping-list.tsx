
import { useState, useEffect } from 'react';
import { categorizeItems } from '@/lib/gemini-service';
import { toast } from 'sonner';

export interface ShoppingItem {
  id: string;
  name: string;
  price: number;
  completed: boolean;
  date: Date;
  category?: string;
  quantity: number;
}

type SortOption = 'name' | 'price-asc' | 'price-desc' | 'date' | 'category';

export function useShoppingList() {
  const [items, setItems] = useState<ShoppingItem[]>(() => {
    const savedItems = localStorage.getItem('shoppingItems');
    if (savedItems) {
      try {
        const parsedItems = JSON.parse(savedItems);
        return parsedItems.map((item: any) => ({
          ...item,
          date: new Date(item.date),
          quantity: item.quantity || 1, // Ensure quantity exists
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

  // Save items to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('shoppingItems', JSON.stringify(items));
  }, [items]);

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
  };

  const removeItem = (id: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const toggleItemCompletion = (id: string) => {
    setItems(prevItems => prevItems.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
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

  return {
    items: getSortedItems(),
    itemsByCategory: getItemsByCategory(),
    addItem,
    removeItem,
    toggleItemCompletion,
    updateItemQuantity,
    sortOption,
    setSortOption,
    totalPrice: calculateTotal(),
    categories: Object.keys(getItemsByCategory())
  };
}
