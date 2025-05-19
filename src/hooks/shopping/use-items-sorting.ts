
import { ShoppingItem, SortOption } from '@/types/shopping';

export function useItemsSorting(items: ShoppingItem[], sortOption: SortOption) {
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
          // Put phantom items at the end when sorting by date
          if (a.phantom && !b.phantom) return 1;
          if (!a.phantom && b.phantom) return -1;
          return b.date.getTime() - a.date.getTime();
        default:
          return 0;
      }
    });
  };

  // Function to get only the phantom items
  const getPhantomItems = () => {
    return items.filter(item => item.phantom);
  };

  // Function to get only the regular items (always filter out phantom items)
  const getRegularItems = () => {
    const regularItems = items.filter(item => !item.phantom);
    return regularItems.sort((a, b) => {
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
    // Categorize items without including phantoms
    const categorizedItems: Record<string, ShoppingItem[]> = {};
    
    // Only include non-phantom products in the category view
    items.filter(item => !item.phantom).forEach(item => {
      const category = item.category || 'uncategorized';
      if (!categorizedItems[category]) {
        categorizedItems[category] = [];
      }
      categorizedItems[category].push(item);
    });
    
    // Sort each category according to the selected option
    Object.keys(categorizedItems).forEach(category => {
      categorizedItems[category].sort((a, b) => {
        switch (sortOption) {
          case 'name':
            return a.name.localeCompare(b.name);
          case 'price-asc':
            return (a.price * a.quantity) - (b.price * b.quantity);
          case 'price-desc':
            return (b.price * b.quantity) - (a.price * a.quantity);
          case 'date':
            return b.date.getTime() - a.date.getTime();
          default:
            return 0;
        }
      });
    });
    
    return categorizedItems;
  };

  const calculateTotal = (itemsToCalculate = items) => {
    return itemsToCalculate.reduce((total, item) => 
      (!item.completed && !item.phantom) ? total + (item.price * item.quantity) : total, 0
    );
  };

  return {
    getSortedItems,
    getPhantomItems,
    getRegularItems,
    getItemsByCategory,
    calculateTotal
  };
}
