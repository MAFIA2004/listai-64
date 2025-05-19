
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import { useLanguage } from '@/hooks/use-language';

interface BudgetAlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budgetAmount: number;
  totalPrice: number;
}

export function BudgetAlertDialog({ open, onOpenChange, budgetAmount, totalPrice }: BudgetAlertDialogProps) {
  const { t } = useLanguage();
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md ai-dialog">
        <DialogHeader>
          <DialogTitle className="text-destructive flex items-center gap-2">
            <span>{t('budget.exceeded')}</span>
          </DialogTitle>
          <DialogDescription>
            {t('budget.exceeded_description')
              .replace('{amount}', formatPrice(budgetAmount))
              .replace('{total}', formatPrice(totalPrice))}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-2">
          <Alert variant="destructive" className="mb-4">
            <AlertDescription className="flex justify-between items-center">
              <span>
                {t('budget.exceeded_by').replace('{amount}', formatPrice(totalPrice - budgetAmount))}
              </span>
            </AlertDescription>
          </Alert>
        </div>
        
        <DialogFooter className="sm:justify-end">
          <Button onClick={() => onOpenChange(false)}>
            {t('button.continue')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
