
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
  EuroIcon,
  CalendarRange,
  ListTodo
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
    // Budget functions
    budget,
    updateBudget,
    getSavingSuggestions,
    getPriorityItems,
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
  const [budgetDialogOpen, setBudgetDialogOpen] = useState(false);
  const [priorityDialogOpen, setPriorityDialogOpen] = useState(false);

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
    <div className="app-layout">
      <header className="app-header" style={{"--app-header-height": "80px"} as any}>
        <div className="app-icon">
          <ShoppingCart size={24} />
        </div>
        <h1 className="text-2xl font-bold flex-1">ListAI</h1>
        <ThemeToggle />
      </header>

      <div className="px-4 max-w-xl mx-auto w-full">
        <div className="mb-6">
          <AddItemForm onAddItem={handleAddItem} />
        </div>
        
        <div className="fixed-actions">
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
            <Button 
              variant={viewMode === 'list' ? "default" : "outline"} 
              size="sm"
              className={`filter-button ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <ListTodo className="mr-2 h-4 w-4" />
              Nombre
            </Button>
            <Button 
              variant={viewMode === 'category' ? "default" : "outline"} 
              size="sm" 
              className={`filter-button ${viewMode === 'category' ? 'active' : ''}`}
              onClick={() => setViewMode('category')}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
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
              <History className="mr-2 h-4 w-4" />
              Historial
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="filter-button"
              onClick={() => setBudgetDialogOpen(true)}
            >
              <EuroIcon className="mr-2 h-4 w-4" />
              Presupuesto
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="filter-button"
              onClick={() => setPriorityDialogOpen(true)}
            >
              <CalendarRange className="mr-2 h-4 w-4" />
              Priorizar
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
            <div className="my-4">
              <SortButtons
                activeSort={sortOption}
                onSort={(option) => setSortOption(option as any)}
              />
            </div>
          )}
        </div>

        <div className="scrollable-content pt-4">
          {viewMode === 'list' ? (
            <div className="space-y-1">
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
            <div className="space-y-4">
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

      {/* Budget Dialog */}
      <Dialog open={budgetDialogOpen} onOpenChange={setBudgetDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Gestión de presupuesto</DialogTitle>
            <DialogDescription>
              Establece un límite de presupuesto para tu lista de compras.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="flex items-center justify-between mb-4">
              <span>Activar presupuesto</span>
              <Button 
                variant={budget.enabled ? "default" : "outline"}
                onClick={() => updateBudget({ enabled: !budget.enabled })}
              >
                {budget.enabled ? 'Activado' : 'Desactivado'}
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Cantidad (€)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    className="flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm"
                    value={budget.amount}
                    onChange={(e) => updateBudget({ amount: Number(e.target.value) })}
                    min={0}
                    disabled={!budget.enabled}
                  />
                  <span>€</span>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Aviso al (%)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    className="flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm"
                    value={budget.warningThreshold}
                    onChange={(e) => updateBudget({ warningThreshold: Number(e.target.value) })}
                    min={0}
                    max={100}
                    disabled={!budget.enabled}
                  />
                  <span>%</span>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="font-medium mb-2">Sugerencias de ahorro</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {getSavingSuggestions().length > 0 ? (
                  getSavingSuggestions().map((suggestion, i) => (
                    <div key={i} className="text-xs p-2 border border-border rounded-md">
                      Cambia <span className="font-medium">{suggestion.original.name}</span> por <span className="font-medium">{suggestion.alternative.name}</span> y ahorra un <span className="text-green-600">{suggestion.savings.toFixed(0)}%</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No hay sugerencias disponibles</p>
                )}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setBudgetDialogOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Priority Items Dialog */}
      <Dialog open={priorityDialogOpen} onOpenChange={setPriorityDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Priorizar productos</DialogTitle>
            <DialogDescription>
              Organiza tus compras según el presupuesto disponible.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="mb-4">
              <label className="text-sm font-medium">Presupuesto máximo (€)</label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="number"
                  className="flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm"
                  defaultValue={budget.amount}
                  min={0}
                  id="maxBudget"
                />
                <span>€</span>
              </div>
            </div>
            
            <Button 
              className="w-full mb-4" 
              onClick={() => {
                const maxBudget = Number((document.getElementById('maxBudget') as HTMLInputElement).value);
                const { withinBudget, outsideBudget } = getPriorityItems(maxBudget);
                
                // Update UI to show prioritized items
                document.getElementById('withinBudget')!.innerHTML = 
                  withinBudget.map(item => `
                    <div class="p-2 border border-border rounded-md flex justify-between">
                      <span>${item.name}</span>
                      <span>${formatPrice(item.price * item.quantity)}</span>
                    </div>
                  `).join('') || '<p class="text-sm text-muted-foreground">No hay productos dentro del presupuesto</p>';
                  
                document.getElementById('outsideBudget')!.innerHTML = 
                  outsideBudget.map(item => `
                    <div class="p-2 border border-border rounded-md flex justify-between">
                      <span>${item.name}</span>
                      <span>${formatPrice(item.price * item.quantity)}</span>
                    </div>
                  `).join('') || '<p class="text-sm text-muted-foreground">No hay productos fuera del presupuesto</p>';
              }}
            >
              Calcular prioridades
            </Button>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  Productos prioritarios
                </h3>
                <div id="withinBudget" className="mt-2 space-y-1 max-h-24 overflow-y-auto text-xs">
                  <p className="text-sm text-muted-foreground">Calcula las prioridades primero</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-red-500"></div>
                  Productos secundarios
                </h3>
                <div id="outsideBudget" className="mt-2 space-y-1 max-h-24 overflow-y-auto text-xs">
                  <p className="text-sm text-muted-foreground">Calcula las prioridades primero</p>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setPriorityDialogOpen(false)}>
              Cerrar
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
