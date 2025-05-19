
import { useState } from 'react';
import { ShoppingListItem } from '@/components/ShoppingListItem';
import { AddItemForm } from '@/components/AddItemForm';
import { SortButtons } from '@/components/SortButtons';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AISuggestionDialog } from '@/components/AISuggestionDialog';
import { HistoryDialog } from '@/components/HistoryDialog';
import { formatPrice } from '@/lib/utils';
import { useShoppingList } from '@/hooks/use-shopping-list';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ShoppingCart, ArrowUpDown, Sparkles, Trash2, Clock, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { X } from 'lucide-react';

const Index = () => {
  const {
    phantomItems,
    regularItems,
    itemsByCategory,
    addItem,
    removeItem,
    clearAllItems,
    toggleItemCompletion,
    updateItemQuantity,
    sortOption,
    setSortOption,
    totalPrice,
    // Budget features
    budget,
    updateBudget,
    getSavingSuggestions,
    getPriorityItems,
    // History features
    purchaseHistory,
    restoreListFromHistory,
    deleteHistoryEntry,
    deleteAllHistory,
    // Auto save to history
    saveCurrentListToHistory
  } = useShoppingList();
  const [viewMode, setViewMode] = useState<'list' | 'category'>('list');
  const [aiSuggestionDialogOpen, setAiSuggestionDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [confirmClearDialogOpen, setConfirmClearDialogOpen] = useState(false);
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [budgetDialogOpen, setBudgetDialogOpen] = useState(false);
  const [budgetAlertOpen, setBudgetAlertOpen] = useState(false);
  
  const handleClearAllItems = () => {
    // Solo guardar la lista en el historial si el total es superior a 10€
    if (totalPrice > 10) {
      saveCurrentListToHistory();
      toast.success('Lista guardada en el historial');
    }
    
    clearAllItems();
    setConfirmClearDialogOpen(false);
    toast.success('Lista eliminada');
  };
  
  const handleAiButtonClick = () => {
    setAiSuggestionDialogOpen(true);
  };
  
  const handleAddItem = (name: string, price: number, quantity: number = 1) => {
    addItem(name, price, quantity);
    
    // Comprobar si se supera el presupuesto después de agregar el item
    setTimeout(() => {
      if (budget.enabled && totalPrice > budget.amount) {
        setBudgetAlertOpen(true);
      }
    }, 100);
  };
  
  return <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header - Fixed position */}
      <header className="app-header">
        <div className="app-icon">
          <ShoppingCart size={18} />
        </div>
        <h1 className="text-lg font-bold flex-1">ListAI</h1>
        <ThemeToggle />
      </header>

      {/* Form and filter buttons */}
      <div className="filter-buttons-container max-w-xl mx-auto w-full">
        <AddItemForm onAddItem={handleAddItem} />
        
        <div className="flex gap-2 my-3 overflow-x-auto hide-scrollbar pb-1">
          <Button variant="outline" size="sm" className="filter-button" onClick={() => setBudgetDialogOpen(true)}>
            <Calculator className="mr-1 h-4 w-4" />
            Presupuesto
          </Button>
          <Button variant="outline" size="sm" className="filter-button" onClick={() => setHistoryDialogOpen(true)}>
            <Clock className="mr-1 h-4 w-4" />
            Histori
          </Button>
        </div>

        {/* Total Price Bar - Moved just before the delete button */}
        <div className="total-price-bar">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Total a pagar:</span>
            <span className="text-lg font-bold">{formatPrice(totalPrice)}</span>
          </div>
        </div>

        {/* Organizar y Eliminar buttons */}
        <div className="organize-buttons-container flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="rounded-full flex items-center" onClick={() => setSortMenuOpen(!sortMenuOpen)}>
              <ArrowUpDown className="h-4 w-4 mr-1" />
              <span className="text-sm">Organizar</span>
            </Button>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setConfirmClearDialogOpen(true)} className="delete-all-button">
            <Trash2 className="h-4 w-4 mr-1" />
            <span className="text-sm">Eliminar todo</span>
          </Button>
        </div>
        
        {sortMenuOpen && <div className="mb-3">
            <SortButtons activeSort={sortOption} onSort={option => setSortOption(option as any)} />
          </div>}
      </div>

      {/* Main content */}
      <div className="main-content-wrapper">
        <div className="shopping-list-container">
          {viewMode === 'list' ? <div className="space-y-4">
              {/* Lista 1: Productos Fantasma */}
              <div className="mb-2">
                <h2 className="text-sm font-medium text-primary mb-2">Lista Rápida</h2>
                <div className="space-y-2">
                  {phantomItems.map(item => <div key={item.id} data-phantom={item.phantom ? "true" : "false"}>
                      <ShoppingListItem item={item} onToggleComplete={toggleItemCompletion} onDelete={removeItem} onUpdateQuantity={updateItemQuantity} />
                    </div>)}
                </div>
              </div>

              {/* Separador entre listas - REDUCIDO 50% */}
              <Separator className="my-2 opacity-50 h-[0.5px]" />

              {/* Lista 2: Productos Regulares */}
              <div>
                <h2 className="elimina el estacion y las letras ">Mis Productos</h2>
                <div className="space-y-2">
                  {regularItems.length > 0 ? regularItems.map(item => <div key={item.id}>
                        <ShoppingListItem item={item} onToggleComplete={toggleItemCompletion} onDelete={removeItem} onUpdateQuantity={updateItemQuantity} />
                      </div>) : <div className="py-6 text-center text-muted-foreground rounded-md bg-card">
                      <p>No hay productos en tu lista</p>
                    </div>}
                </div>
              </div>
            </div> : <div className="space-y-4">
              {Object.entries(itemsByCategory).length > 0 ? Object.entries(itemsByCategory).map(([category, categoryItems]) => <div key={category} className="space-y-2">
                    <h2 className="text-sm font-medium capitalize mb-2">{category}</h2>
                    {categoryItems.filter(item => !item.phantom).map(item => <div key={item.id} data-phantom={item.phantom ? "true" : "false"}>
                        <ShoppingListItem key={item.id} item={item} onToggleComplete={toggleItemCompletion} onDelete={removeItem} onUpdateQuantity={updateItemQuantity} />
                      </div>)}
                  </div>) : <div className="py-12 text-center text-muted-foreground rounded-md bg-card">
                  <ShoppingCart className="mx-auto mb-3 opacity-30" size={32} />
                  <p>Tu lista está vacía</p>
                </div>}
            </div>}
        </div>
      </div>

      {/* Floating AI Button */}
      <Button onClick={handleAiButtonClick} className="floating-button">
        <Sparkles className="h-5 w-5" />
        <span className="sr-only">Asistente IA</span>
      </Button>

      {/* Budget Dialog */}
      <Dialog open={budgetDialogOpen} onOpenChange={setBudgetDialogOpen}>
        <DialogContent className="sm:max-w-md ai-dialog">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              <span className="gradient-text">Configurar Presupuesto</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <div className="flex items-center justify-between mb-4">
              <span>Activar presupuesto</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={budget.enabled} onChange={() => updateBudget({
                enabled: !budget.enabled
              })} />
                <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            
            {budget.enabled && <>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">
                    Cantidad máxima (€)
                  </label>
                  <input type="number" className="w-full p-2 border border-border bg-background text-foreground rounded-lg" value={budget.amount} onChange={e => updateBudget({
                amount: Number(e.target.value)
              })} min="1" step="1" />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">
                    Aviso al alcanzar % del presupuesto
                  </label>
                  <input type="range" className="w-full accent-primary" min="10" max="100" step="5" value={budget.warningThreshold} onChange={e => updateBudget({
                warningThreshold: Number(e.target.value)
              })} />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>10%</span>
                    <span>{budget.warningThreshold}%</span>
                    <span>100%</span>
                  </div>
                </div>
              </>}
          </div>
          
          <DialogFooter>
            <Button onClick={() => setBudgetDialogOpen(false)}>
              Aceptar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Clear All Dialog */}
      <Dialog open={confirmClearDialogOpen} onOpenChange={setConfirmClearDialogOpen}>
        <DialogContent className="sm:max-w-md ai-dialog">
          <DialogHeader>
            <DialogTitle className="gradient-text">¿Borrar toda la lista?</DialogTitle>
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
      <AISuggestionDialog open={aiSuggestionDialogOpen} onOpenChange={setAiSuggestionDialogOpen} onAddItem={handleAddItem} />

      {/* Purchase History Dialog */}
      <HistoryDialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen} purchaseHistory={purchaseHistory} onRestoreList={restoreListFromHistory} onDeleteList={deleteHistoryEntry} onDeleteAllHistory={deleteAllHistory} />
      
      {/* Budget Exceeded Alert Dialog */}
      <Dialog open={budgetAlertOpen} onOpenChange={setBudgetAlertOpen}>
        <DialogContent className="sm:max-w-md ai-dialog">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <span>¡Presupuesto excedido!</span>
            </DialogTitle>
            <DialogDescription>
              Has superado el presupuesto de {formatPrice(budget.amount)}. 
              Actualmente tu lista suma {formatPrice(totalPrice)}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-2">
            <Alert variant="destructive" className="mb-4">
              <AlertDescription className="flex justify-between items-center">
                <span>Has superado tu presupuesto por {formatPrice(totalPrice - budget.amount)}</span>
              </AlertDescription>
            </Alert>
          </div>
          
          <DialogFooter className="sm:justify-end">
            <Button onClick={() => setBudgetAlertOpen(false)}>
              Continuar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>;
};
export default Index;
