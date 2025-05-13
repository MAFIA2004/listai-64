
import { ShoppingListItem } from '@/components/ShoppingListItem';
import { AddItemForm } from '@/components/AddItemForm';
import { SortButtons } from '@/components/SortButtons';
import { ThemeToggle } from '@/components/ThemeToggle';
import { formatPrice } from '@/lib/utils';
import { useShoppingList } from '@/hooks/use-shopping-list';
import { ShoppingCart } from 'lucide-react';

const Index = () => {
  const { 
    items, 
    addItem, 
    removeItem, 
    toggleItemCompletion,
    sortOption,
    setSortOption,
    totalPrice
  } = useShoppingList();

  return (
    <div className="min-h-screen bg-background text-foreground pt-8 pb-20">
      <div className="container max-w-md mx-auto px-4">
        <header className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-primary">Lista de Compras</h1>
            <ThemeToggle />
          </div>
          <div className="h-1 w-full bg-primary/20 rounded-full overflow-hidden">
            <div className="h-full bg-primary w-1/3 animate-pulse"></div>
          </div>
        </header>

        <AddItemForm onAddItem={addItem} />

        <div className="mb-4">
          <SortButtons
            activeSort={sortOption}
            onSort={(option) => setSortOption(option as any)}
          />
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between py-3 px-4 bg-card rounded-lg border shadow-sm">
            <div className="flex items-center gap-2">
              <ShoppingCart className="text-primary" size={20} />
              <span className="font-medium">Total pendiente:</span>
            </div>
            <span className="text-lg font-bold">{formatPrice(totalPrice)}</span>
          </div>
        </div>

        <div className="space-y-1">
          {items.length > 0 ? (
            items.map(item => (
              <ShoppingListItem
                key={item.id}
                item={item}
                onToggleComplete={toggleItemCompletion}
                onDelete={removeItem}
              />
            ))
          ) : (
            <div className="py-10 text-center text-muted-foreground animate-fade-in">
              <ShoppingCart className="mx-auto mb-3 opacity-30" size={40} />
              <p>Tu lista está vacía. ¡Añade algo!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
