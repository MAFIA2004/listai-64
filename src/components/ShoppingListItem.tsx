
import { useState } from 'react';
import { Trash2, Check, X, Plus, Minus } from 'lucide-react';
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
      <div className={cn('shopping-item p-3 bg-card border rounded-lg', 
        item.completed ? 'opacity-60' : ''
      )}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xl" role="img" aria-label={`Emoji for ${item.name}`}>
              {emoji}
            </span>
            <div>
              <div className="flex items-center gap-1">
                <p className={cn(
                  "item-name text-left font-medium", 
                  item.completed && "line-through text-muted-foreground"
                )}>
                  {item.name}
                </p>
                {item.category && (
                  <span className="text-xs px-1 py-0.5 bg-muted rounded text-muted-foreground">
                    {item.category}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  {onUpdateQuantity && (
                    <>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-5 w-5 p-0" 
                        onClick={handleDecrementQuantity}
                        disabled={item.quantity <= 1 || item.completed}
                      >
                        <Minus size={12} />
                      </Button>
                      <span className="w-4 text-center">{item.quantity}</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-5 w-5 p-0"
                        onClick={handleIncrementQuantity}
                        disabled={item.completed}
                      >
                        <Plus size={12} />
                      </Button>
                    </>
                  )}
                  {!onUpdateQuantity && <span>x{item.quantity}</span>}
                </div>
                <span className="ml-1">
                  {formatPrice(item.price)} c/u
                </span>
                <span className="font-medium">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="sm"
              className="size-8 p-0 text-muted-foreground hover:text-foreground"
              onClick={() => onToggleComplete(item.id)}
            >
              {item.completed ? <X size={16} /> : <Check size={16} />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="size-8 p-0 text-muted-foreground hover:text-destructive"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 size={16} />
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
