
import { useState } from 'react';
import { Trash2, Check, X } from 'lucide-react';
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
}

export function ShoppingListItem({ item, onToggleComplete, onDelete }: ShoppingListItemProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const emoji = getItemEmoji(item.name);

  return (
    <>
      <div className={cn('shopping-item', item.completed && 'completed')}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xl" role="img" aria-label={`Emoji for ${item.name}`}>
              {emoji}
            </span>
            <div>
              <p className="item-name text-left font-medium">
                {item.name}
              </p>
              <p className="text-sm text-muted-foreground text-left">
                {formatPrice(item.price)}
              </p>
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
