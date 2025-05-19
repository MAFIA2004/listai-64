
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';

interface BudgetAlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budgetAmount: number;
  totalPrice: number;
}

export function BudgetAlertDialog({ open, onOpenChange, budgetAmount, totalPrice }: BudgetAlertDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md ai-dialog">
        <DialogHeader>
          <DialogTitle className="text-destructive flex items-center gap-2">
            <span>¡Presupuesto excedido!</span>
          </DialogTitle>
          <DialogDescription>
            Has superado el presupuesto de {formatPrice(budgetAmount)}. 
            Actualmente tu lista suma {formatPrice(totalPrice)}.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-2">
          <Alert variant="destructive" className="mb-4">
            <AlertDescription className="flex justify-between items-center">
              <span>Has superado tu presupuesto por {formatPrice(totalPrice - budgetAmount)}</span>
            </AlertDescription>
          </Alert>
        </div>
        
        <DialogFooter className="sm:justify-end">
          <Button onClick={() => onOpenChange(false)}>
            Continuar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
