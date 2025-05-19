
import React from 'react';
import { ArrowUpDown, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SortButtons } from '@/components/SortButtons';
import { SortOption } from '@/types/shopping';

interface OrganizeButtonsProps {
  sortOption: SortOption;
  onSort: (option: SortOption) => void;
  sortMenuOpen: boolean;
  toggleSortMenu: () => void;
  onOpenConfirmClear: () => void;
}

export function OrganizeButtons({
  sortOption,
  onSort,
  sortMenuOpen,
  toggleSortMenu,
  onOpenConfirmClear
}: OrganizeButtonsProps) {
  return (
    <>
      <div className="organize-buttons-container flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="rounded-full flex items-center" 
            onClick={toggleSortMenu}
          >
            <ArrowUpDown className="h-4 w-4 mr-1" />
            <span className="text-sm">Organizar</span>
          </Button>
        </div>
        <Button variant="ghost" size="sm" onClick={onOpenConfirmClear} className="delete-all-button">
          <Trash2 className="h-4 w-4 mr-1" />
          <span className="text-sm">Eliminar todo</span>
        </Button>
      </div>
      
      {sortMenuOpen && (
        <div className="mb-3">
          <SortButtons activeSort={sortOption} onSort={(option) => onSort(option as SortOption)} />
        </div>
      )}
    </>
  );
}
