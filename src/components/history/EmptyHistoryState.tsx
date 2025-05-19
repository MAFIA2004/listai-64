
import { History } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';

export function EmptyHistoryState() {
  const { t } = useLanguage();
  
  return (
    <div className="py-8 text-center text-muted-foreground">
      <History className="mx-auto mb-3 opacity-30" size={40} />
      <p>{t('history.no_history')}</p>
    </div>
  );
}
