
import React from 'react';
import { Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { BudgetAlert } from '@/types/shopping';
import { useLanguage } from '@/hooks/use-language';

interface BudgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budget: BudgetAlert;
  updateBudget: (budget: Partial<BudgetAlert>) => void;
}

export function BudgetDialog({ open, onOpenChange, budget, updateBudget }: BudgetDialogProps) {
  const { t } = useLanguage();
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md ai-dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            <span className="gradient-text">{t('budget.title')}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <div className="flex items-center justify-between mb-4">
            <span>{t('budget.enable')}</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={budget.enabled}
                onChange={() => updateBudget({
                  enabled: !budget.enabled
                })}
              />
              <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
          
          {budget.enabled && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  {t('budget.max_amount')}
                </label>
                <input
                  type="number"
                  className="w-full p-2 border border-border bg-background text-foreground rounded-lg"
                  value={budget.amount}
                  onChange={(e) => updateBudget({
                    amount: Number(e.target.value)
                  })}
                  min="1"
                  step="1"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  {t('budget.warning')}
                </label>
                <input
                  type="range"
                  className="w-full accent-primary"
                  min="10"
                  max="100"
                  step="5"
                  value={budget.warningThreshold}
                  onChange={(e) => updateBudget({
                    warningThreshold: Number(e.target.value)
                  })}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>10%</span>
                  <span>{budget.warningThreshold}%</span>
                  <span>100%</span>
                </div>
              </div>
            </>
          )}
        </div>
        
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>
            {t('button.accept')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
