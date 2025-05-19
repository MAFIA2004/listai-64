
import { PurchaseHistoryEntry } from '@/types/shopping';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import { HistoryListItem } from './HistoryListItem';
import { useLanguage } from '@/hooks/use-language';

interface HistoryDateGroupProps {
  dateKey: string;
  entries: PurchaseHistoryEntry[];
  onSelectEntry: (entry: PurchaseHistoryEntry) => void;
}

export function HistoryDateGroup({ dateKey, entries, onSelectEntry }: HistoryDateGroupProps) {
  const { language } = useLanguage();
  const locale = language === 'es' ? es : enUS;
  
  return (
    <div className="space-y-2">
      <h3 className="font-medium flex items-center gap-2 text-primary">
        <Calendar className="h-4 w-4" />
        {format(new Date(dateKey), 'PPPP', { locale })}
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
