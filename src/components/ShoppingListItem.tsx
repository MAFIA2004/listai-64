
import { useState } from 'react';
import { Trash2, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn, getItemEmoji, formatPrice } from '@/lib/utils';
import { ShoppingItem } from '@/hooks/use-shopping-list';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ShoppingListItemProps {
  item: ShoppingItem;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateQuantity?: (id: string, quantity: number) => void;
}

export function ShoppingListItem({ item, onToggleComplete, onDelete, onUpdateQuantity }: ShoppingListItemProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const emoji = getItemEmoji(item.name);
  
  const handleIncrementQuantity = () => {
    if (onUpdateQuantity) {
      onUpdateQuantity(item.id, item.quantity + 1);
    }
  };
  
  const handleDecrementQuantity = () => {
    if (onUpdateQuantity && item.quantity > 1) {
      onUpdateQuantity(item.id, item.quantity - 1);
    }
  };

  return (
    <>
      <div 
        className={cn(
          'shopping-item relative overflow-hidden rounded-2xl p-3 transition-all duration-200', 
          item.completed ? 'completed bg-opacity-60' : 'bg-card/80 backdrop-blur-sm',
          item.phantom ? 'invisible' : ''
        )}
        onClick={() => onToggleComplete(item.id)}
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center">
            <div 
              className="mr-3 rounded-xl bg-gradient-to-tr from-blue-100/80 to-blue-200/80 size-11 flex items-center justify-center shadow-sm"
              role="img" 
              aria-label={`Emoji for ${item.name}`}
            >
              <span className="text-xl">{emoji}</span>
            </div>
            <div>
              <p className="font-medium text-base">{item.name}</p>
              <div className="text-xs text-primary/80">
                {item.quantity} unid. · <span className="text-sm font-medium">{formatPrice(item.price)}/unid.</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="quantity-control bg-card/60 backdrop-blur-sm rounded-full shadow-sm border border-border/10 px-1">
              <Button 
                variant="ghost" 
                size="sm"
                className="h-6 w-6 p-0 rounded-full" 
                onClick={(e) => {
                  e.stopPropagation(); 
                  handleDecrementQuantity();
                }}
                disabled={item.quantity <= 1 || item.completed}
              >
                <Minus size={14} />
              </Button>
              <span className="text-sm font-medium mx-1">{item.quantity}</span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0 rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  handleIncrementQuantity();
                }}
                disabled={item.completed}
              >
                <Plus size={14} />
              </Button>
            </div>
            
            {!item.phantom && (
              <Button
                variant="ghost"
                size="sm"
                className="delete-button h-7 w-7 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteDialog(true);
                }}
              >
                <Trash2 size={15} />
              </Button>
            )}
          </div>
        </div>
        
        {/* Línea decorativa al completar el item */}
        {item.completed && (
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-primary opacity-20"></div>
          </div>
        )}
      </div>

      {!item.phantom && (
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent className="rounded-2xl border-none shadow-xl bg-card/95 backdrop-blur-md">
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar artículo?</AlertDialogTitle>
              <AlertDialogDescription>
                ¿Estás seguro de que deseas eliminar "{item.name}" de tu lista de compras?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
                onClick={() => onDelete(item.id)}
              >
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
