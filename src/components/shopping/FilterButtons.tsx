
import React from 'react';
import { Calculator, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FilterButtonsProps {
  onOpenBudget: () => void;
  onOpenHistory: () => void;
}

export function FilterButtons({ onOpenBudget, onOpenHistory }: FilterButtonsProps) {
  return (
    <div className="flex gap-2 my-3 overflow-x-auto hide-scrollbar pb-1">
      <Button variant="outline" size="sm" className="filter-button" onClick={onOpenBudget}>
        <Calculator className="mr-1 h-4 w-4" />
        Presupuesto
      </Button>
      <Button variant="outline" size="sm" className="filter-button" onClick={onOpenHistory}>
        <Clock className="mr-1 h-4 w-4" />
        Historial
      </Button>
    </div>
  );
}
