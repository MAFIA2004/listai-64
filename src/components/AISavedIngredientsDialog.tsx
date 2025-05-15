
import { useState, useEffect } from 'react';
import { FilePlus, ChefHat, Sparkles, Calendar, Trash2, Plus, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

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
  recipeId?: string;
  date: string | Date;
}

// Función para agrupar ingredientes por receta
function groupIngredientsByRecipe(ingredients: SavedIngredient[]) {
  const recipes: Record<string, {
    name: string,
    date: Date,
    id: string,
    ingredients: SavedIngredient[]
  }> = {};

  ingredients.forEach(ingredient => {
    const recipeId = ingredient.recipeId || ingredient.recipe;
    const recipeName = ingredient.recipe;
    const date = new Date(ingredient.date);

    if (!recipes[recipeId]) {
      recipes[recipeId] = {
        name: recipeName,
        date: date,
        id: ingredient.recipeId || ingredient.id,
        ingredients: []
      };
    }
    
    recipes[recipeId].ingredients.push(ingredient);
  });

  // Convertir el objeto a un array y ordenarlo por fecha (más reciente primero)
  return Object.values(recipes).sort((a, b) => b.date.getTime() - a.date.getTime());
}

export function AISavedIngredientsDialog({ open, onOpenChange, onAddItem }: AISavedIngredientsDialogProps) {
  const [savedIngredients, setSavedIngredients] = useState<SavedIngredient[]>([]);
  const [groupedRecipes, setGroupedRecipes] = useState<any[]>([]);
  const [expandedRecipeId, setExpandedRecipeId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    if (open) {
      loadSavedIngredients();
    }
  }, [open]);
  
  useEffect(() => {
    const recipes = groupIngredientsByRecipe(savedIngredients);
    setGroupedRecipes(recipes);
  }, [savedIngredients]);
  
  const loadSavedIngredients = () => {
    try {
      const savedData = localStorage.getItem('aiSuggestedIngredients');
      if (savedData) {
        const parsed = JSON.parse(savedData);
        setSavedIngredients(parsed);
      }
    } catch (error) {
      console.error('Error loading saved ingredients:', error);
      toast.error('Error al cargar ingredientes guardados');
    }
  };
  
  const handleDeleteRecipe = (recipeId: string) => {
    const updatedIngredients = savedIngredients.filter(ingredient => 
      ingredient.recipeId !== recipeId && 
      // En caso de que no exista recipeId, verifica por recipe como identificador
      !(ingredient.recipeId === undefined && ingredient.recipe === recipeId)
    );
    
    localStorage.setItem('aiSuggestedIngredients', JSON.stringify(updatedIngredients));
    setSavedIngredients(updatedIngredients);
    toast.success('Receta eliminada');
    
    if (expandedRecipeId === recipeId) {
      setExpandedRecipeId(null);
    }
  };
  
  const handleAddToList = (ingredients: SavedIngredient[]) => {
    ingredients.forEach(ingredient => {
      onAddItem(ingredient.name, 1.0, ingredient.quantity);
    });
    
    toast.success(`${ingredients.length} ingredientes añadidos a la lista`);
    onOpenChange(false);
  };
  
  const toggleExpandRecipe = (recipeId: string) => {
    setExpandedRecipeId(expandedRecipeId === recipeId ? null : recipeId);
  };
  
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true, locale: es });
  };

  const filteredRecipes = searchTerm.trim() 
    ? groupedRecipes.filter(recipe => 
        recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.ingredients.some((ing: SavedIngredient) => 
          ing.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    : groupedRecipes;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md backdrop-blur-2xl border border-primary/20 bg-background/60 shadow-lg shadow-primary/5">
        <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary/5 to-background/0 pointer-events-none" />
        
        <DialogHeader className="relative z-10">
          <DialogTitle className="flex items-center gap-2">
            <div className="relative">
              <ChefHat className="h-5 w-5 text-primary" />
              <div className="absolute inset-0 h-5 w-5 bg-primary blur-sm rounded-full opacity-30" />
            </div>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500">
              Recetas guardadas
            </span>
          </DialogTitle>
          <DialogDescription>
            Recetas e ingredientes generados por IA.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 relative z-10">
          <div className="mb-4">
            <Input
              placeholder="Buscar recetas o ingredientes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-background/60 border-primary/20"
            />
          </div>
          
          {filteredRecipes.length > 0 ? (
            <ScrollArea className="max-h-[350px] pr-4">
              <div className="space-y-3">
                {filteredRecipes.map((recipe) => (
                  <div key={recipe.id} className="border border-border/40 rounded-md overflow-hidden bg-card/30 backdrop-blur-sm">
                    <div 
                      className="p-3 cursor-pointer flex items-center justify-between hover:bg-primary/5 transition-colors"
                      onClick={() => toggleExpandRecipe(recipe.id)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-primary" />
                          <h3 className="font-medium">{recipe.name}</h3>
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>{formatDate(recipe.date)}</span>
                          <span className="mx-2">•</span>
                          <span>{recipe.ingredients.length} ingredientes</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="h-8 w-8 p-0 border-primary/20"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteRecipe(recipe.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive/70" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="h-8 w-8 p-0 border-primary/20"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToList(recipe.ingredients);
                          }}
                        >
                          <Plus className="h-4 w-4 text-primary" />
                        </Button>
                      </div>
                    </div>
                    
                    {expandedRecipeId === recipe.id && (
                      <div className="border-t border-border/40 divide-y divide-border/20">
                        {recipe.ingredients.map((ingredient: SavedIngredient) => (
                          <div 
                            key={ingredient.id} 
                            className="p-2 px-4 flex items-center justify-between hover:bg-primary/5"
                          >
                            <span className="text-sm">
                              {ingredient.name}
                              {ingredient.quantity > 1 && ` (x${ingredient.quantity})`}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Sparkles className="h-12 w-12 mx-auto mb-2 opacity-20" />
              <p>{searchTerm ? 'No se encontraron resultados' : 'No hay recetas guardadas'}</p>
              <p className="text-sm mt-2">
                Usa el asistente IA para generar y guardar recetas
              </p>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} className="bg-gradient-to-r from-primary to-blue-500 hover:opacity-90">
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
