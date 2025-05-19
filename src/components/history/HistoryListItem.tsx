
import { PurchaseHistoryEntry } from '@/types/shopping';
import { formatPrice } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface HistoryListItemProps {
  entry: PurchaseHistoryEntry;
  onClick: () => void;
}

export function HistoryListItem({ entry, onClick }: HistoryListItemProps) {
  return (
    <div 
      onClick={onClick}
      className="history-card flex justify-between items-center cursor-pointer"
    >
      <div>
        <p className="font-medium">{format(entry.date, 'HH:mm', { locale: es })}</p>
        <p className="text-xs text-muted-foreground">{entry.items.length} artículos</p>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-medium">{formatPrice(entry.totalAmount)}</span>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </div>
    </div>
  );
}
