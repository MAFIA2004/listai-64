import { useState, useEffect } from 'react';
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
  
  // State for language and theme selection dialog
  const [languageThemeDialogOpen, setLanguageThemeDialogOpen] = useState(false);
  
  // Check if it's the first time the app is opened
  useEffect(() => {
    const isFirstTime = localStorage.getItem('app_first_launch') !== 'done';
    if (isFirstTime) {
      setLanguageThemeDialogOpen(true);
    }
  }, []);
  
  // Comprobar si el presupuesto se ha superado cada vez que cambia el precio total
  useEffect(() => {
    if (budget.enabled && totalPrice > budget.amount) {
      setBudgetAlertOpen(true);
    }
  }, [budget.enabled, budget.amount, totalPrice]);
  
  const handleClearAllItems = () => {
    // Modified: Save the list to history if the total is more than 2€ (instead of 10€)
    if (totalPrice > 2) {
      saveCurrentListToHistory();
      toast.success(t('message.saved'));
    }
    
    clearAllItems();
    setConfirmClearDialogOpen(false);
    toast.success(t('message.deleted'));
  };
  
  const handleAddItem = (name: string, price: number, quantity: number = 1) => {
    addItem(name, price, quantity);
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

      {/* Language and Theme Selection Dialog */}
      <LanguageThemeDialog
        open={languageThemeDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            // Mark as completed the first time
            localStorage.setItem('app_first_launch', 'done');
          }
          setLanguageThemeDialogOpen(open);
        }}
      />
    </div>
  );
};

export default Index;
