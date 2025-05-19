
import { useState } from 'react';
import { Sparkles } from 'lucide-react';
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

      {/* Form and filter buttons */}
      <div className="filter-buttons-container max-w-xl mx-auto w-full">
        <AddItemForm onAddItem={handleAddItem} />
        
        <FilterButtons 
          onOpenBudget={() => setBudgetDialogOpen(true)} 
          onOpenHistory={() => setHistoryDialogOpen(true)} 
        />

        {/* Total Price Bar */}
        <TotalPriceBar totalPrice={totalPrice} />

        {/* Organize Buttons */}
        <OrganizeButtons 
          sortOption={sortOption}
          onSort={setSortOption}
          sortMenuOpen={sortMenuOpen}
          toggleSortMenu={() => setSortMenuOpen(!sortMenuOpen)}
          onOpenConfirmClear={() => setConfirmClearDialogOpen(true)}
        />
      </div>

      {/* Main content */}
      <div className="main-content-wrapper">
        <div className="shopping-list-container">
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
    </div>
  );
};

export default Index;
