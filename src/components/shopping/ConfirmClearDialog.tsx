
import React from 'react';
import { Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ConfirmClearDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function ConfirmClearDialog({ open, onOpenChange, onConfirm }: ConfirmClearDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md ai-dialog">
        <DialogHeader>
          <DialogTitle className="gradient-text">¿Borrar toda la lista?</DialogTitle>
          <DialogDescription>
            Esta acción eliminará todos los artículos de tu lista de compras.
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            <Trash2 className="mr-2 h-4 w-4" />
            Borrar todo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
