
import { useState } from 'react';
import { ShoppingListItem } from '@/components/ShoppingListItem';
import { AddItemForm } from '@/components/AddItemForm';
import { SortButtons } from '@/components/SortButtons';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AISuggestionDialog } from '@/components/AISuggestionDialog';
import { HistoryDialog } from '@/components/HistoryDialog';
import { AISavedIngredientsDialog } from '@/components/AISavedIngredientsDialog';
import { formatPrice } from '@/lib/utils';
import { useShoppingList } from '@/hooks/use-shopping-list';
import { 
  ShoppingCart, 
  PieChart, 
  AlertCircle, 
  PiggyBank, 
  ArrowDown, 
  Sparkles,
  Trash2,
  History
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
    deleteHistoryEntry
  } = useShoppingList();

  const [viewMode, setViewMode] = useState<'list' | 'category'>('list');
  const [budgetDialogOpen, setBudgetDialogOpen] = useState(false);
  const [tempBudget, setTempBudget] = useState(budget);
  const [priorityDialogOpen, setPriorityDialogOpen] = useState(false);
  const [aiDialogMode, setAiDialogMode] = useState<'suggestions' | 'savedIngredients'>('suggestions');
  const [aiSuggestionDialogOpen, setAiSuggestionDialogOpen] = useState(false);
  const [aiSavedIngredientsDialogOpen, setAiSavedIngredientsDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [confirmClearDialogOpen, setConfirmClearDialogOpen] = useState(false);
  const [aiMenuDialogOpen, setAiMenuDialogOpen] = useState(false);

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

  const handleAiMenuClick = () => {
    setAiMenuDialogOpen(true);
  };

  const handleAiOptionSelect = (option: 'suggestions' | 'savedIngredients') => {
    setAiDialogMode(option);
    setAiMenuDialogOpen(false);
    
    if (option === 'suggestions') {
      setAiSuggestionDialogOpen(true);
    } else {
      setAiSavedIngredientsDialogOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/80 text-foreground pt-8 pb-20">
      <div className="container max-w-md mx-auto px-4">
        <header className="mb-6 backdrop-blur-md bg-background/40 p-4 rounded-lg border border-border/20 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500">Lista de Compras</h1>
            <div className="flex gap-1">
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setHistoryDialogOpen(true)}
                title="Historial de compras"
                className="border-primary/20 bg-background/60"
              >
                <History className="h-4 w-4 text-primary" />
              </Button>
              <ThemeToggle />
            </div>
          </div>
          
          {budget.enabled && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">Presupuesto: {formatPrice(budget.amount)}</span>
                <span 
                  className={`text-sm font-bold ${isOverBudget ? 'text-destructive' : 'text-primary'}`}
                >
                  {formatPrice(totalPrice)} ({budgetPercentage.toFixed(0)}%)
                </span>
              </div>
              <div className="h-2 w-full bg-secondary/30 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${isOverBudget ? 'bg-destructive' : 'bg-primary'}`}
                  style={{ width: `${budgetPercentage}%` }}
                ></div>
              </div>
            </div>
          )}

          <div className="flex gap-2 my-2">
            <Button 
              variant="outline" 
              size="sm"
              className="flex-1 text-xs border-primary/20 bg-background/60"
              onClick={() => setBudgetDialogOpen(true)}
            >
              <PiggyBank className="mr-1 h-3.5 w-3.5 text-primary" />
              {budget.enabled ? 'Editar Presupuesto' : 'Añadir Presupuesto'}
            </Button>
            
            {budget.enabled && (
              <Button 
                variant="outline" 
                size="sm"
                className="flex-1 text-xs border-primary/20 bg-background/60"
                onClick={() => setPriorityDialogOpen(true)}
                disabled={outsideBudget.length === 0}
              >
                <AlertCircle className="mr-1 h-3.5 w-3.5 text-primary" />
                Priorizar
              </Button>
            )}
            
            <Button 
              variant="outline" 
              size="sm"
              className="flex-1 text-xs border-destructive/20 bg-background/60 text-destructive hover:text-destructive hover:border-destructive/40"
              onClick={() => setConfirmClearDialogOpen(true)}
            >
              <Trash2 className="mr-1 h-3.5 w-3.5" />
              Borrar Todo
            </Button>
          </div>
        </header>

        <AddItemForm onAddItem={addItem} />

        <div className="mb-4 flex flex-col gap-2">
          <div className="flex gap-2 mb-2">
            <Button 
              variant={viewMode === 'list' ? 'default' : 'outline'} 
              size="sm"
              className={`flex-1 ${viewMode !== 'list' ? 'border-primary/20 bg-background/60' : 'bg-gradient-to-r from-primary to-primary/80'}`}
              onClick={() => setViewMode('list')}
            >
              Lista
            </Button>
            <Button 
              variant={viewMode === 'category' ? 'default' : 'outline'} 
              size="sm"
              className={`flex-1 ${viewMode !== 'category' ? 'border-primary/20 bg-background/60' : 'bg-gradient-to-r from-primary to-primary/80'}`}
              onClick={() => setViewMode('category')}
            >
              Por Categorías
            </Button>
          </div>

          <SortButtons
            activeSort={sortOption}
            onSort={(option) => setSortOption(option as any)}
          />
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between py-3 px-4 bg-card/30 backdrop-blur-sm rounded-lg border border-border/40 shadow-sm">
            <div className="flex items-center gap-2">
              <ShoppingCart className="text-primary" size={20} />
              <span className="font-medium">Total pendiente:</span>
            </div>
            <span className="text-lg font-bold">{formatPrice(totalPrice)}</span>
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
              <div className="py-10 text-center text-muted-foreground animate-fade-in backdrop-blur-sm bg-card/20 rounded-lg border border-border/10 p-4">
                <ShoppingCart className="mx-auto mb-3 opacity-30" size={40} />
                <p>Tu lista está vacía. ¡Añade algo!</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(itemsByCategory).length > 0 ? (
              Object.entries(itemsByCategory).map(([category, categoryItems]) => (
                <div key={category} className="space-y-2">
                  <h2 className="font-bold text-lg capitalize text-primary">{category}</h2>
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
              <div className="py-10 text-center text-muted-foreground animate-fade-in backdrop-blur-sm bg-card/20 rounded-lg border border-border/10 p-4">
                <ShoppingCart className="mx-auto mb-3 opacity-30" size={40} />
                <p>Tu lista está vacía. ¡Añade algo!</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating AI Button - Ahora abre el menú */}
      <Button
        onClick={handleAiMenuClick}
        className="fixed bottom-6 right-6 shadow-lg h-14 w-14 rounded-full p-0 animate-pulse hover:animate-none bg-gradient-to-r from-primary to-blue-500"
      >
        <Sparkles className="h-6 w-6" />
        <span className="sr-only">Asistente IA</span>
      </Button>

      {/* AI Menu Dialog */}
      <Dialog open={aiMenuDialogOpen} onOpenChange={setAiMenuDialogOpen}>
        <DialogContent className="sm:max-w-xs p-0 backdrop-blur-2xl bg-background/60 border border-primary/20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background/0 to-blue-500/5 pointer-events-none" />
          
          <div className="flex flex-col relative z-10">
            <Button
              variant="ghost" 
              className="justify-start rounded-none py-8 text-lg hover:bg-primary/10 group transition-all relative overflow-hidden"
              onClick={() => handleAiOptionSelect('suggestions')}
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-[shimmer_2s_infinite] z-0" style={{ backgroundSize: '200% 100%' }}></span>
              <div className="relative z-10 flex items-center">
                <div className="mr-4 relative">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <div className="absolute inset-0 h-5 w-5 bg-primary blur-sm rounded-full opacity-30 animate-pulse"></div>
                </div>
                <div>
                  <span className="font-medium bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500">Sugerir ingredientes</span>
                  <p className="text-xs text-muted-foreground">Genera ingredientes para una receta</p>
                </div>
              </div>
            </Button>
            <Button 
              variant="ghost" 
              className="justify-start rounded-none py-8 text-lg hover:bg-primary/10 group transition-all relative overflow-hidden"
              onClick={() => handleAiOptionSelect('savedIngredients')}
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-[shimmer_2s_infinite] z-0" style={{ backgroundSize: '200% 100%' }}></span>
              <div className="relative z-10 flex items-center">
                <div className="mr-4 relative">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                  <div className="absolute inset-0 h-5 w-5 bg-primary blur-sm rounded-full opacity-30 animate-pulse"></div>
                </div>
                <div>
                  <span className="font-medium bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500">Lista de ingredientes IA</span>
                  <p className="text-xs text-muted-foreground">Ver ingredientes guardados</p>
                </div>
              </div>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Budget Dialog */}
      <Dialog open={budgetDialogOpen} onOpenChange={setBudgetDialogOpen}>
        <DialogContent className="sm:max-w-md backdrop-blur-md bg-background/60 border border-border/50">
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
                  className="bg-background/60"
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
                  className="bg-background/60"
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setBudgetDialogOpen(false)} className="border-primary/20">
              Cancelar
            </Button>
            <Button onClick={handleBudgetSave} className="bg-gradient-to-r from-primary to-primary/80">
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Priority Items Dialog */}
      <Dialog open={priorityDialogOpen} onOpenChange={setPriorityDialogOpen}>
        <DialogContent className="sm:max-w-md backdrop-blur-md bg-background/60 border border-border/50">
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
                    <Badge variant="outline" className="ml-2 border-primary/20">{item.category}</Badge>
                  </div>
                ))}
                
                <Alert className="bg-background/60 border-primary/20">
                  <ArrowDown className="h-4 w-4 text-primary" />
                  <AlertTitle>Recomendación</AlertTitle>
                  <AlertDescription>
                    Considera eliminar estos {outsideBudget.length} artículos para ajustarte a tu presupuesto de {formatPrice(budget.amount)}.
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
            <Button onClick={() => setPriorityDialogOpen(false)} className="bg-gradient-to-r from-primary to-primary/80">
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Clear All Dialog */}
      <Dialog open={confirmClearDialogOpen} onOpenChange={setConfirmClearDialogOpen}>
        <DialogContent className="sm:max-w-md backdrop-blur-md bg-background/60 border border-border/50">
          <DialogHeader>
            <DialogTitle>¿Borrar toda la lista?</DialogTitle>
            <DialogDescription>
              Esta acción eliminará todos los artículos de tu lista de compras.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="sm:justify-between">
            <Button variant="outline" onClick={() => setConfirmClearDialogOpen(false)} className="border-primary/20">
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
        onAddItem={addItem}
      />

      {/* AI Saved Ingredients Dialog */}
      <AISavedIngredientsDialog
        open={aiSavedIngredientsDialogOpen}
        onOpenChange={setAiSavedIngredientsDialogOpen}
        onAddItem={addItem}
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
