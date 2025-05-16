
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
  PiggyBank, 
  AlertCircle, 
  ArrowDown, 
  Sparkles,
  Trash2,
  History,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
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
    categories,
    // Budget features
    budget,
    updateBudget,
    getPriorityItems,
    // History features
    purchaseHistory,
    restoreListFromHistory,
    deleteHistoryEntry,
    // Auto save to history
    saveCurrentListToHistory
  } = useShoppingList();

  const [viewMode, setViewMode] = useState<'list' | 'category'>('list');
  const [budgetDialogOpen, setBudgetDialogOpen] = useState(false);
  const [tempBudget, setTempBudget] = useState(budget);
  const [priorityDialogOpen, setPriorityDialogOpen] = useState(false);
  const [aiSuggestionDialogOpen, setAiSuggestionDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [confirmClearDialogOpen, setConfirmClearDialogOpen] = useState(false);

  // Calculate budget status percentage
  const budgetPercentage = budget.enabled ? Math.min((totalPrice / budget.amount) * 100, 100) : 0;
  const isOverBudget = budget.enabled && totalPrice > budget.amount;
  
  // Get priority items based on budget
  const { withinBudget, outsideBudget } = budget.enabled ? 
    getPriorityItems(budget.amount) : { withinBudget: [], outsideBudget: [] };

  const handleBudgetSave = () => {
    updateBudget(tempBudget);
    setBudgetDialogOpen(false);
    toast.success("Presupuesto actualizado");
  };

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
    <div className="min-h-screen bg-background text-foreground">
      <div className="minimal-container">
        <header className="minimal-header">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl font-medium">Mi Lista de Compras</h1>
            <div className="flex gap-1">
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setHistoryDialogOpen(true)}
                title="Historial de compras"
                className="h-8 w-8"
              >
                <History className="h-4 w-4" />
              </Button>
              <ThemeToggle />
            </div>
          </div>
          
          {budget.enabled && (
            <div className="mt-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm">Presupuesto: {formatPrice(budget.amount)}</span>
                <span 
                  className={`text-sm font-medium ${isOverBudget ? 'text-destructive' : ''}`}
                >
                  {formatPrice(totalPrice)}
                </span>
              </div>
              <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                <div 
                  className={`h-full ${isOverBudget ? 'bg-destructive' : 'bg-primary'}`}
                  style={{ width: `${budgetPercentage}%` }}
                ></div>
              </div>
            </div>
          )}

          <div className="flex gap-2 mt-3">
            <Button 
              variant="outline" 
              size="sm"
              className="flex-1 text-xs"
              onClick={() => setBudgetDialogOpen(true)}
            >
              <PiggyBank className="mr-1 h-3.5 w-3.5" />
              {budget.enabled ? 'Editar Presupuesto' : 'Añadir Presupuesto'}
            </Button>
            
            {budget.enabled && (
              <Button 
                variant="outline" 
                size="sm"
                className="flex-1 text-xs"
                onClick={() => setPriorityDialogOpen(true)}
                disabled={outsideBudget.length === 0}
              >
                <AlertCircle className="mr-1 h-3.5 w-3.5" />
                Priorizar
              </Button>
            )}
            
            <Button 
              variant="outline" 
              size="sm"
              className="flex-1 text-xs text-destructive"
              onClick={() => setConfirmClearDialogOpen(true)}
            >
              <Trash2 className="mr-1 h-3.5 w-3.5" />
              Borrar
            </Button>
          </div>
        </header>

        <AddItemForm onAddItem={handleAddItem} />

        <div className="mb-4">
          <div className="flex gap-2 mb-2">
            <Button 
              variant={viewMode === 'list' ? 'default' : 'outline'} 
              size="sm"
              className="flex-1"
              onClick={() => setViewMode('list')}
            >
              Lista
            </Button>
            <Button 
              variant={viewMode === 'category' ? 'default' : 'outline'} 
              size="sm"
              className="flex-1"
              onClick={() => setViewMode('category')}
            >
              Categorías
            </Button>
          </div>

          <SortButtons
            activeSort={sortOption}
            onSort={(option) => setSortOption(option as any)}
          />
        </div>

        <div className="mb-3">
          <div className="flex items-center justify-between py-2 px-3 bg-card rounded-md">
            <div className="flex items-center gap-2">
              <ShoppingCart className="text-primary" size={18} />
              <span className="text-sm">Total:</span>
            </div>
            <span className="font-medium">{formatPrice(totalPrice)}</span>
          </div>
        </div>

        {viewMode === 'list' ? (
          <div className="space-y-2">
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
              <div className="py-8 text-center text-muted-foreground rounded-md bg-card">
                <ShoppingCart className="mx-auto mb-2 opacity-30" size={24} />
                <p className="text-sm">Tu lista está vacía</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(itemsByCategory).length > 0 ? (
              Object.entries(itemsByCategory).map(([category, categoryItems]) => (
                <div key={category} className="space-y-2">
                  <h2 className="text-sm font-medium capitalize">{category}</h2>
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
              <div className="py-8 text-center text-muted-foreground rounded-md bg-card">
                <ShoppingCart className="mx-auto mb-2 opacity-30" size={24} />
                <p className="text-sm">Tu lista está vacía</p>
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
        <Sparkles className="h-5 w-5" />
        <span className="sr-only">Asistente IA</span>
      </Button>

      {/* Budget Dialog */}
      <Dialog open={budgetDialogOpen} onOpenChange={setBudgetDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Gestión de Presupuesto</DialogTitle>
            <DialogDescription>
              Establece un límite de gasto para tu lista de compras.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex items-center space-x-2 py-4">
            <Switch 
              id="budget-enabled"
              checked={tempBudget.enabled}
              onCheckedChange={(checked) => setTempBudget(prev => ({ ...prev, enabled: checked }))}
            />
            <label htmlFor="budget-enabled" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Activar presupuesto
            </label>
          </div>
          
          {tempBudget.enabled && (
            <div className="grid gap-4 py-2">
              <div>
                <label className="text-sm font-medium mb-1 block">Cantidad (€)</label>
                <Input 
                  type="number" 
                  min="1" 
                  step="any"
                  value={tempBudget.amount} 
                  onChange={(e) => setTempBudget(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Aviso cuando llegue al (%)</label>
                <Input 
                  type="number" 
                  min="1" 
                  max="99"
                  value={tempBudget.warningThreshold} 
                  onChange={(e) => setTempBudget(prev => ({ ...prev, warningThreshold: Math.min(Math.max(parseInt(e.target.value) || 0, 1), 99) }))}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setBudgetDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleBudgetSave}>
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Priority Items Dialog */}
      <Dialog open={priorityDialogOpen} onOpenChange={setPriorityDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Priorizar Artículos</DialogTitle>
            <DialogDescription>
              Estos artículos superan tu presupuesto de {formatPrice(budget.amount)}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {outsideBudget.length > 0 ? (
              <div className="space-y-4">
                <p className="text-sm">Artículos que exceden tu presupuesto:</p>
                
                {outsideBudget.map(item => (
                  <div key={item.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.quantity}x {formatPrice(item.price)} = {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                    <Badge variant="outline" className="ml-2">{item.category}</Badge>
                  </div>
                ))}
                
                <Alert>
                  <ArrowDown className="h-4 w-4" />
                  <AlertTitle>Recomendación</AlertTitle>
                  <AlertDescription>
                    Considera eliminar estos {outsideBudget.length} artículos para ajustarte a tu presupuesto.
                  </AlertDescription>
                </Alert>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">
                ¡Genial! Todos tus artículos están dentro del presupuesto.
              </p>
            )}
          </div>
          
          <DialogFooter>
            <Button onClick={() => setPriorityDialogOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
