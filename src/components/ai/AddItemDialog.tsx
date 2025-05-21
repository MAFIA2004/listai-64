
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { getItemEmoji } from '@/lib/utils';
import { useLanguage } from '@/hooks/use-language';
import { AddItemForm } from './AddItemForm';
import { RecipeSuggestion, ItemFormValues } from '@/types/ai-suggestions';

interface AddItemDialogProps {
  selectedItem: RecipeSuggestion | null;
  onClose: () => void;
  onAddItem: (values: ItemFormValues) => void;
}

export function AddItemDialog({ selectedItem, onClose, onAddItem }: AddItemDialogProps) {
  const { language } = useLanguage();

  return (
    <Dialog open={!!selectedItem} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[350px] backdrop-blur-md bg-background/60 border border-primary/20">
        <DialogHeader>
          <DialogTitle>{language === 'es' ? 'Añadir a la lista' : 'Add to list'}</DialogTitle>
          <DialogDescription>
            {selectedItem && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-lg">{getItemEmoji(selectedItem.name)}</span>
                <span>{selectedItem.name}</span>
              </div>
            )}
          </DialogDescription>
        </DialogHeader>

        <AddItemForm
          selectedItem={selectedItem}
          onCancel={onClose}
          onAddItem={onAddItem}
        />
      </DialogContent>
    </Dialog>
  );
}
