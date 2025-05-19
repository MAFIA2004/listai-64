
import { useState, useEffect } from 'react';
import { Sparkles, ShoppingBag } from 'lucide-react';
import { AddItemForm } from '@/components/AddItemForm';
import { AISuggestionDialog } from '@/components/AISuggestionDialog';
import { HistoryDialog } from '@/components/HistoryDialog';
import { useShoppingList } from '@/hooks/use-shopping-list';
import { toast } from 'sonner';
import { ShoppingHeader } from '@/components/shopping/ShoppingHeader';
import { FilterButtons } from '@/components/shopping/FilterButtons';
import { TotalPriceBar } from '@/components/shopping/TotalPriceBar';
import { OrganizeButtons } from '@/components/shopping/OrganizeButtons';
import { ShoppingLists } from '@/components/shopping/ShoppingLists';
import { FloatingAIButton } from '@/components/shopping/FloatingAIButton';
import { BudgetDialog } from '@/components/budget/BudgetDialog';
import { BudgetAlertDialog } from '@/components/budget/BudgetAlertDialog';
import { ConfirmClearDialog } from '@/components/shopping/ConfirmClearDialog';
import { LanguageThemeDialog } from '@/components/settings/LanguageThemeDialog';
import { useLanguage } from '@/hooks/use-language';

const Index = () => {
  const { t } = useLanguage();
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
  
  // Estado para controlar el diálogo de selección de idioma y tema
  const [languageThemeDialogOpen, setLanguageThemeDialogOpen] = useState(false);
  
  // Comprobar si es la primera vez que se abre la app
  useEffect(() => {
    const isFirstTime = localStorage.getItem('app_first_launch') !== 'done';
    if (isFirstTime) {
      setLanguageThemeDialogOpen(true);
    }
  }, []);
  
  const handleClearAllItems = () => {
    // Modificado: Guardar la lista en el historial si el total es superior a 2€ (en lugar de 10€)
    if (totalPrice > 2) {
      saveCurrentListToHistory();
      toast.success('Lista guardada en el historial');
    }
    
    clearAllItems();
    setConfirmClearDialogOpen(false);
    toast.success('Lista eliminada');
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

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <ShoppingHeader />

      {/* Welcome panel - Rediseñado para ser más moderno */}
      <div className="welcome-panel bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl mx-4 my-4 p-5 shadow-sm border border-primary/10">
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-primary/10 p-2 rounded-xl">
            <ShoppingBag className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-lg font-medium bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500">
            {t('app.welcome_message') || 'Bienvenido a tu Lista de Compras'}
          </h2>
        </div>
        
        <AddItemForm onAddItem={handleAddItem} />
        
        <FilterButtons 
          onOpenBudget={() => setBudgetDialogOpen(true)} 
          onOpenHistory={() => setHistoryDialogOpen(true)} 
        />
      </div>

      {/* Total Price Bar - Estilo modernizado */}
      <TotalPriceBar totalPrice={totalPrice} />

      {/* Organize Buttons - Estilo actualizado */}
      <div className="mx-4 mb-4">
        <OrganizeButtons 
          sortOption={sortOption}
          onSort={setSortOption}
          sortMenuOpen={sortMenuOpen}
          toggleSortMenu={() => setSortMenuOpen(!sortMenuOpen)}
          onOpenConfirmClear={() => setConfirmClearDialogOpen(true)}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 mx-4 mb-16 mt-2 overflow-hidden">
        <div className="h-full overflow-y-auto rounded-2xl bg-background/50 backdrop-blur-sm shadow-sm border border-border/10 p-4">
          <ShoppingLists 
            viewMode={viewMode}
            phantomItems={phantomItems}
            regularItems={regularItems}
            itemsByCategory={itemsByCategory}
            onToggleComplete={toggleItemCompletion}
            onDelete={removeItem}
            onUpdateQuantity={updateItemQuantity}
          />
        </div>
      </div>

      {/* Floating AI Button */}
      <FloatingAIButton onClick={() => setAiSuggestionDialogOpen(true)} />

      {/* Dialogs */}
      <BudgetDialog 
        open={budgetDialogOpen}
        onOpenChange={setBudgetDialogOpen}
        budget={budget}
        updateBudget={updateBudget}
      />

      <BudgetAlertDialog 
        open={budgetAlertOpen}
        onOpenChange={setBudgetAlertOpen}
        budgetAmount={budget.amount}
        totalPrice={totalPrice}
      />

      <ConfirmClearDialog 
        open={confirmClearDialogOpen}
        onOpenChange={setConfirmClearDialogOpen}
        onConfirm={handleClearAllItems}
      />

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
        onDeleteAllHistory={deleteAllHistory} 
      />

      {/* Diálogo de selección de idioma y tema */}
      <LanguageThemeDialog
        open={languageThemeDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            // Marcar como completado la primera vez
            localStorage.setItem('app_first_launch', 'done');
          }
          setLanguageThemeDialogOpen(open);
        }}
      />
    </div>
  );
};

export default Index;
