
import { ShoppingItem } from '@/types/shopping';

// Productos fantasma que siempre estarán en la lista
export const phantomItems: ShoppingItem[] = [
  {
    id: 'phantom-1',
    name: '1',
    price: 0,
    quantity: 1,
    completed: false,
    date: new Date(),
    phantom: true
  },
  {
    id: 'phantom-2',
    name: '2',
    price: 0,
    quantity: 1,
    completed: false,
    date: new Date(),
    phantom: true
  },
  {
    id: 'phantom-3',
    name: '3',
    price: 0,
    quantity: 1,
    completed: false,
    date: new Date(),
    phantom: true
  },
  {
    id: 'phantom-4',
    name: '4',
    price: 0,
    quantity: 1,
    completed: false,
    date: new Date(),
    phantom: true
  },
  {
    id: 'phantom-5',
    name: '5',
    price: 0,
    quantity: 1,
    completed: false,
    date: new Date(),
    phantom: true
  }
];

// Función para asegurar que los productos fantasma siempre estén presentes
export const ensurePhantomItems = (currentItems: ShoppingItem[]): ShoppingItem[] => {
  const existingPhantomIds = new Set(currentItems.filter(item => item.phantom).map(item => item.id));
  
  // Add any missing phantom items
  const missingPhantomItems = phantomItems.filter(item => !existingPhantomIds.has(item.id));
  
  if (missingPhantomItems.length > 0) {
    return [...currentItems, ...missingPhantomItems];
  }
  
  return currentItems;
};
