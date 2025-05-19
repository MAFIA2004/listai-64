
import { PurchaseHistoryEntry } from '@/types/shopping';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { HistoryListItem } from './HistoryListItem';

interface HistoryDateGroupProps {
  dateKey: string;
  entries: PurchaseHistoryEntry[];
  onSelectEntry: (entry: PurchaseHistoryEntry) => void;
}

export function HistoryDateGroup({ dateKey, entries, onSelectEntry }: HistoryDateGroupProps) {
  return (
    <div className="space-y-2">
      <h3 className="font-medium flex items-center gap-2 text-primary">
        <Calendar className="h-4 w-4" />
        {format(new Date(dateKey), 'PPPP', { locale: es })}
      </h3>
      
      {entries
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .map(entry => (
          <HistoryListItem
            key={entry.id}
            entry={entry}
            onClick={() => onSelectEntry(entry)}
          />
        ))}
    </div>
  );
}
