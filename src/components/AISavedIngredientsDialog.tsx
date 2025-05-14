
import { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Pencil, Tag, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { formatPrice } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface AISavedIngredientsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddItem: (name: string, price: number, quantity?: number) => void;
}

interface SavedIngredient {
  id: string;
  name: string;
  price: number;
  quantity: number;
  recipe: string;
  date: Date;
}

export function AISavedIngredientsDialog({ open, onOpenChange, onAddItem }: AISavedIngredientsDialogProps) {
  const [savedIngredients, setSavedIngredients] = useState<SavedIngredient[]>([]);
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<number>(0);
  
  // Cargar ingredientes guardados al abrir el diálogo
  useEffect(() => {
    if (open) {
      loadSavedIngredients();
    }
  }, [open]);
  
  const loadSavedIngredients = () => {
    const storedIngredients = localStorage.getItem('aiSuggestedIngredients');
    if (storedIngredients) {
      try {
        const parsed = JSON.parse(storedIngredients);
        // Convertir fechas de string a Date
        const ingredients = parsed.map((ing: any) => ({
          ...ing,
          date: new Date(ing.date)
        }));
        setSavedIngredients(ingredients);
      } catch (e) {
        console.error('Error loading saved ingredients', e);
        setSavedIngredients([]);
      }
    }
  };

  const handleEditPrice = (id: string, currentPrice: number) => {
    setEditingPriceId(id);
    setTempPrice(currentPrice);
  };
  
  const handleSavePrice = (ingredient: SavedIngredient) => {
    // Actualizar el precio en el almacenamiento local
    const updatedIngredients = savedIngredients.map(ing => 
      ing.id === ingredient.id ? { ...ing, price: tempPrice } : ing
    );
    
    setSavedIngredients(updatedIngredients);
    localStorage.setItem('aiSuggestedIngredients', JSON.stringify(updatedIngredients));
    setEditingPriceId(null);
    toast.success(`Precio actualizado: ${formatPrice(tempPrice)}`);
  };
  
  const handleAddToList = (ingredient: SavedIngredient) => {
    onAddItem(ingredient.name, ingredient.price, ingredient.quantity);
    toast.success(`${ingredient.name} añadido a la lista`);
    
    // Opcional: eliminar el ingrediente de los guardados después de añadirlo
    const updatedIngredients = savedIngredients.filter(ing => ing.id !== ingredient.id);
    setSavedIngredients(updatedIngredients);
    localStorage.setItem('aiSuggestedIngredients', JSON.stringify(updatedIngredients));
  };
  
  // Agrupar ingredientes por receta
  const ingredientsByRecipe = savedIngredients.reduce<Record<string, SavedIngredient[]>>((acc, ingredient) => {
    if (!acc[ingredient.recipe]) {
      acc[ingredient.recipe] = [];
    }
    acc[ingredient.recipe].push(ingredient);
    return acc;
  }, {});

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md glass-card border-0">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <ShoppingCart className="h-5 w-5 text-primary" />
            Ingredientes Guardados
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4 max-h-[400px] overflow-y-auto">
          {Object.keys(ingredientsByRecipe).length > 0 ? (
            Object.entries(ingredientsByRecipe).map(([recipe, ingredients]) => (
              <div key={recipe} className="mb-6 last:mb-0">
                <div className="category-header">
                  <Tag className="h-4 w-4 text-primary" />
                  <h3 className="font-medium">{recipe}</h3>
                </div>
                <div className="space-y-3">
                  {ingredients.map(ingredient => (
                    <div 
                      key={ingredient.id}
                      className="glass-card p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex flex-col">
                          <span className="font-medium">{ingredient.name}</span>
                          {ingredient.quantity > 1 && (
                            <Badge variant="outline" className="mt-1 w-fit fancy-badge">
                              Cantidad: {ingredient.quantity}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {editingPriceId === ingredient.id ? (
                        <div className="flex items-center gap-2 mt-3">
                          <Input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={tempPrice}
                            onChange={(e) => setTempPrice(parseFloat(e.target.value) || 0)}
                            className="flex-1 glass-effect"
                          />
                          <Button 
                            size="sm" 
                            onClick={() => handleSavePrice(ingredient)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between mt-3">
                          <Button 
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditPrice(ingredient.id, ingredient.price)}
                            className="frost"
                          >
                            <Pencil className="mr-1 h-3.5 w-3.5" />
                            {formatPrice(ingredient.price)}
                          </Button>
                          
                          <Button 
                            size="sm"
                            onClick={() => handleAddToList(ingredient)}
                          >
                            <Plus className="mr-1 h-4 w-4" />
                            Añadir
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-muted-foreground glass-card p-8">
              <ShoppingCart className="mx-auto mb-3 opacity-30" size={40} />
              <p>No hay ingredientes guardados</p>
              <p className="text-sm mt-2">Usa el asistente IA para sugerir ingredientes</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
