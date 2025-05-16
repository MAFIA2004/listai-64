
import { useState } from 'react';
import { ShoppingListItem } from '@/components/ShoppingListItem';
import { AddItemForm } from '@/components/AddItemForm';
import { SortButtons } from '@/components/SortButtons';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AISuggestionDialog } from '@/components/AISuggestionDialog';
import { HistoryDialog } from '@/components/HistoryDialog';
import { formatPrice } from '@/lib/utils';
import { useShoppingList } from '@/hooks/use-shopping-list';
import { 
  ShoppingCart, 
  Clock,
  ArrowUpDown,
  Sparkles,
  Trash2,
  History,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';

const Index = () => {
  const { 
    items, 
    itemsByCategory,
    addItem, 
    removeItem, 
    clearAllItems,
    toggleItemCompletion,
    updateItemQuantity,
    sortOption,
    setSortOption,
    totalPrice,
    // History features
    purchaseHistory,
    restoreListFromHistory,
    deleteHistoryEntry,
    // Auto save to history
    saveCurrentListToHistory
  } = useShoppingList();

  const [viewMode, setViewMode] = useState<'list' | 'category'>('list');
  const [aiSuggestionDialogOpen, setAiSuggestionDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [confirmClearDialogOpen, setConfirmClearDialogOpen] = useState(false);
  const [sortMenuOpen, setSortMenuOpen] = useState(false);

  const handleClearAllItems = () => {
    clearAllItems();
    setConfirmClearDialogOpen(false);
  };

  // Open AI suggestions dialog directly
  const handleAiButtonClick = () => {
    setAiSuggestionDialogOpen(true);
  };

  // Check if the total price is over 15 euros and save to history if needed
  const handleAddItem = (name: string, price: number, quantity: number = 1) => {
    addItem(name, price, quantity);
    
    // Check if the total is now over 15 euros after adding the item
    setTimeout(() => {
      if (totalPrice + (price * quantity) > 15) {
        saveCurrentListToHistory();
        toast.info("Lista guardada en el historial (supera los 15€)");
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      <header className="app-header">
        <div className="app-icon">
          <ShoppingCart size={24} />
        </div>
        <h1 className="text-2xl font-bold flex-1">ListAI</h1>
        <ThemeToggle />
      </header>

      <div className="px-4 max-w-xl mx-auto">
        <AddItemForm onAddItem={handleAddItem} />
        
        <div className="flex gap-2 my-4 overflow-x-auto hide-scrollbar pb-1">
          <Button 
            variant={viewMode === 'list' ? "default" : "outline"} 
            size="sm"
            className={`filter-button ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            Nombre
          </Button>
          <Button 
            variant={viewMode === 'category' ? "default" : "outline"} 
            size="sm" 
            className={`filter-button ${viewMode === 'category' ? 'active' : ''}`}
            onClick={() => setViewMode('category')}
          >
            Categorías
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="filter-button"
            onClick={() => setSortMenuOpen(!sortMenuOpen)}
          >
            <ArrowUpDown className="mr-2 h-4 w-4" />
            Ordenar
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="filter-button"
            onClick={() => setHistoryDialogOpen(true)}
          >
            <Clock className="mr-2 h-4 w-4" />
            Fecha
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="filter-button text-destructive border-destructive/30"
            onClick={() => setConfirmClearDialogOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar todo
          </Button>
        </div>
        
        {sortMenuOpen && (
          <div className="mb-4">
            <SortButtons
              activeSort={sortOption}
              onSort={(option) => setSortOption(option as any)}
            />
          </div>
        )}

        {viewMode === 'list' ? (
          <div className="space-y-1 mt-6">
            {items.length > 0 ? (
              items.map(item => (
                <ShoppingListItem
                  key={item.id}
                  item={item}
                  onToggleComplete={toggleItemCompletion}
                  onDelete={removeItem}
                  onUpdateQuantity={updateItemQuantity}
                />
              ))
            ) : (
              <div className="py-12 text-center text-muted-foreground rounded-md bg-card">
                <ShoppingCart className="mx-auto mb-3 opacity-30" size={32} />
                <p>Tu lista está vacía</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4 mt-6">
            {Object.entries(itemsByCategory).length > 0 ? (
              Object.entries(itemsByCategory).map(([category, categoryItems]) => (
                <div key={category} className="space-y-1">
                  <h2 className="text-sm font-medium capitalize mb-2">{category}</h2>
                  {categoryItems.map(item => (
                    <ShoppingListItem
                      key={item.id}
                      item={item}
                      onToggleComplete={toggleItemCompletion}
                      onDelete={removeItem}
                      onUpdateQuantity={updateItemQuantity}
                    />
                  ))}
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-muted-foreground rounded-md bg-card">
                <ShoppingCart className="mx-auto mb-3 opacity-30" size={32} />
                <p>Tu lista está vacía</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating AI Button */}
      <Button
        onClick={handleAiButtonClick}
        className="floating-button"
      >
        <Sparkles className="h-6 w-6" />
        <span className="sr-only">Asistente IA</span>
      </Button>

      {/* Fixed Total Bar */}
      <div className="fixed-total">
        <span className="text-xl font-medium">Total a pagar:</span>
        <span className="text-2xl font-bold">{formatPrice(totalPrice)}</span>
      </div>

      {/* Confirm Clear All Dialog */}
      <Dialog open={confirmClearDialogOpen} onOpenChange={setConfirmClearDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>¿Borrar toda la lista?</DialogTitle>
            <DialogDescription>
              Esta acción eliminará todos los artículos de tu lista de compras.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="sm:justify-between">
            <Button variant="outline" onClick={() => setConfirmClearDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleClearAllItems}>
              <Trash2 className="mr-2 h-4 w-4" />
              Borrar todo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Recipe Suggestions Dialog */}
      <AISuggestionDialog 
        open={aiSuggestionDialogOpen} 
        onOpenChange={setAiSuggestionDialogOpen}
        onAddItem={handleAddItem}
      />

      {/* Purchase History Dialog */}
      <HistoryDialog 
        open={historyDialogOpen}
        onOpenChange={setHistoryDialogOpen}
        purchaseHistory={purchaseHistory}
        onRestoreList={restoreListFromHistory}
        onDeleteList={deleteHistoryEntry}
      />
    </div>
  );
};

export default Index;
