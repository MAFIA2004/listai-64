
import { PurchaseHistoryEntry } from '@/types/shopping';
import { formatPrice } from '@/lib/utils';
import { RefreshCw, Trash2, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';

interface HistoryEntryDetailProps {
  selectedEntry: PurchaseHistoryEntry;
  onBack: () => void;
  onRestore: () => void;
  onDelete: () => void;
}

export function HistoryEntryDetail({ 
  selectedEntry, 
  onBack, 
  onRestore, 
  onDelete 
}: HistoryEntryDetailProps) {
  return (
    <div className="py-4">
      <div className="mb-4 text-sm">
        <div className="flex justify-between mb-2">
          <span className="text-muted-foreground">Fecha:</span>
          <span className="font-medium">{format(selectedEntry.date, 'PPP HH:mm', { locale: es })}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Total:</span>
          <span className="font-medium">{formatPrice(selectedEntry.totalAmount)}</span>
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="font-medium mb-2">Artículos comprados:</h3>
        <ScrollArea className="h-[220px] pr-4">
          <div className="space-y-2">
            {selectedEntry.items.map((item) => (
              <div 
                key={item.id} 
                className="flex justify-between items-center border-b pb-2"
              >
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.quantity > 1 && `${item.quantity}x `}{formatPrice(item.price)}
                  </p>
                </div>
                <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
      
      <div className="flex justify-between mt-4">
        <Button 
          variant="outline" 
          onClick={onDelete}
          className="text-destructive hover:text-destructive border-destructive/30 hover:border-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Eliminar
        </Button>
        
        <Button onClick={onRestore}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Restaurar lista
        </Button>
      </div>
    </div>
  );
}
