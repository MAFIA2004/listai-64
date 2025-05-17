
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
        className={cn('shopping-item', 
          item.completed ? 'completed' : ''
        )}
        onClick={() => onToggleComplete(item.id)}
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center">
            <div 
              className="mr-2 rounded-lg bg-blue-100 size-10 flex items-center justify-center"
              role="img" 
              aria-label={`Emoji for ${item.name}`}
            >
              <span className="text-xl">{emoji}</span>
            </div>
            <div>
              <p className="font-medium text-base">{item.name}</p>
              <div className="text-xs text-primary opacity-80">
                {item.quantity} unid. · <span className="text-sm">{formatPrice(item.price)}/unid.</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="quantity-control">
              <Button 
                variant="ghost" 
                size="sm"
                className="h-6 w-6 p-0" 
                onClick={(e) => {
                  e.stopPropagation(); 
                  handleDecrementQuantity();
                }}
                disabled={item.quantity <= 1 || item.completed}
              >
                <Minus size={14} />
              </Button>
              <span className="text-sm">{item.quantity}</span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  handleIncrementQuantity();
                }}
                disabled={item.completed}
              >
                <Plus size={14} />
              </Button>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              className="delete-button h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteDialog(true);
              }}
            >
              <Trash2 size={14} />
            </Button>
          </div>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar artículo?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar "{item.name}" de tu lista de compras?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => onDelete(item.id)}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
