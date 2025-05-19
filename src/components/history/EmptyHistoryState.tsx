
import { History } from 'lucide-react';

export function EmptyHistoryState() {
  return (
    <div className="py-8 text-center text-muted-foreground">
      <History className="mx-auto mb-3 opacity-30" size={40} />
      <p>No hay historial de compras</p>
    </div>
  );
}
