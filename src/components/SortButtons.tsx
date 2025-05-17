
import { SortAsc, ArrowUp, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SortButtonsProps {
  activeSort: string;
  onSort: (sortOption: string) => void;
}

export function SortButtons({ activeSort, onSort }: SortButtonsProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <button 
        className={cn('btn-sort', activeSort === 'price-asc' && 'active')}
        onClick={() => onSort('price-asc')}
        aria-label="Ordenar por precio ascendente"
        title="Ordenar por precio (menor a mayor)"
      >
        <SortAsc size={18} />
        <span className="ml-2 hidden sm:inline">Precio ↑</span>
      </button>
      
      <button 
        className={cn('btn-sort', activeSort === 'price-desc' && 'active')}
        onClick={() => onSort('price-desc')}
        aria-label="Ordenar por precio descendente"
        title="Ordenar por precio (mayor a menor)"
      >
        <ArrowUp size={18} />
        <span className="ml-2 hidden sm:inline">Precio ↓</span>
      </button>
      
      <button 
        className={cn('btn-sort', activeSort === 'date' && 'active')}
        onClick={() => onSort('date')}
        aria-label="Ordenar por fecha"
        title="Ordenar por fecha (más recientes primero)"
      >
        <Clock size={18} />
        <span className="ml-2 hidden sm:inline">Recientes</span>
      </button>
    </div>
  );
}
