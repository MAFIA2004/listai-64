
import React from 'react';
import { ShoppingItem } from '@/types/shopping';
import { ShoppingListItem } from '@/components/ShoppingListItem';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';

interface ShoppingListsProps {
  viewMode: 'list' | 'category';
  phantomItems: ShoppingItem[];
  regularItems: ShoppingItem[];
  itemsByCategory: Record<string, ShoppingItem[]>;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
}

export function ShoppingLists({
  viewMode,
  phantomItems,
  regularItems,
  itemsByCategory,
  onToggleComplete,
  onDelete,
  onUpdateQuantity
}: ShoppingListsProps) {
  const { t } = useLanguage();
  
  if (viewMode === 'list') {
    return (
      <div className="space-y-4">
        {/* Lista 1: Productos Fantasma (invisibles pero mantienen espacio) */}
        <div className="mb-2">
          <h2 className="text-sm font-medium text-primary mb-2">{t('app.quick_list')}</h2>
          <div className="space-y-2">
            {phantomItems.map(item => (
              <div key={item.id} data-phantom={item.phantom ? "true" : "false"} className="invisible">
                <ShoppingListItem 
                  item={item} 
                  onToggleComplete={onToggleComplete} 
                  onDelete={onDelete}
                  onUpdateQuantity={onUpdateQuantity}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Separador entre listas */}
        <Separator className="my-2 opacity-50 h-[0.5px]" />

        {/* Lista 2: Productos Regulares */}
        <div>
          <h2 className="text-sm font-medium text-primary mb-2">{t('app.my_products')}</h2>
          <div className="space-y-2">
            {regularItems.length > 0 ? (
              regularItems.map(item => (
                <div key={item.id}>
                  <ShoppingListItem 
                    item={item} 
                    onToggleComplete={onToggleComplete} 
                    onDelete={onDelete}
                    onUpdateQuantity={onUpdateQuantity}
                  />
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-muted-foreground rounded-md bg-card">
                <p>{t('app.empty_list')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className="space-y-4">
        {Object.entries(itemsByCategory).length > 0 ? (
          Object.entries(itemsByCategory).map(([category, categoryItems]) => (
            <div key={category} className="space-y-2">
              <h2 className="text-sm font-medium capitalize mb-2">{category}</h2>
              {categoryItems.filter(item => !item.phantom).map(item => (
                <div key={item.id} data-phantom={item.phantom ? "true" : "false"}>
                  <ShoppingListItem 
                    key={item.id} 
                    item={item} 
                    onToggleComplete={onToggleComplete} 
                    onDelete={onDelete}
                    onUpdateQuantity={onUpdateQuantity}
                  />
                </div>
              ))}
            </div>
          ))
        ) : (
          <div className="py-12 text-center text-muted-foreground rounded-md bg-card">
            <ShoppingCart className="mx-auto mb-3 opacity-30" size={32} />
            <p>{t('app.empty_category')}</p>
          </div>
        )}
      </div>
    );
  }
}
