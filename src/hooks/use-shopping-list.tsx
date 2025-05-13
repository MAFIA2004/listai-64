
import { useState, useEffect } from 'react';

export interface ShoppingItem {
  id: string;
  name: string;
  price: number;
  completed: boolean;
  date: Date;
}

type SortOption = 'name' | 'price-asc' | 'price-desc' | 'date';

export function useShoppingList() {
  const [items, setItems] = useState<ShoppingItem[]>(() => {
    const savedItems = localStorage.getItem('shoppingItems');
    if (savedItems) {
      try {
        const parsedItems = JSON.parse(savedItems);
        return parsedItems.map((item: any) => ({
          ...item,
          date: new Date(item.date),
        }));
      } catch (e) {
        console.error('Error parsing saved items', e);
        return [];
      }
    }
    return [];
  });

  const [sortOption, setSortOption] = useState<SortOption>('date');

  // Save items to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('shoppingItems', JSON.stringify(items));
  }, [items]);

  const addItem = (name: string, price: number) => {
    const newItem: ShoppingItem = {
      id: crypto.randomUUID(),
      name,
      price,
      completed: false,
      date: new Date(),
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

  const getSortedItems = () => {
    return [...items].sort((a, b) => {
      switch (sortOption) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'date':
          return b.date.getTime() - a.date.getTime();
        default:
          return 0;
      }
    });
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => 
      !item.completed ? total + item.price : total, 0
    );
  };

  return {
    items: getSortedItems(),
    addItem,
    removeItem,
    toggleItemCompletion,
    sortOption,
    setSortOption,
    totalPrice: calculateTotal()
  };
}
