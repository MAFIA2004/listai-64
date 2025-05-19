
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/use-language";
import { useForm } from "react-hook-form";
import { getItemEmoji } from "@/lib/utils";

interface RecipeSuggestion {
  name: string;
  quantity: number;
  selected: boolean;
}

interface ItemFormValues {
  price: number;
  quantity: number;
}

interface AddItemFormProps {
  selectedItem: RecipeSuggestion | null;
  onCancel: () => void;
  onAddItem: (values: ItemFormValues) => void;
}

export function AddItemForm({ selectedItem, onCancel, onAddItem }: AddItemFormProps) {
  const { language } = useLanguage();
  
  const form = useForm<ItemFormValues>({
    defaultValues: {
      price: 1.0,
      quantity: selectedItem?.quantity || 1,
    },
  });
  
  if (!selectedItem) return null;
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onAddItem)} className="space-y-4 py-2">
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{language === 'es' ? 'Precio (€)' : 'Price (€)'}</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="0.01" 
                  min="0.01"
                  className="bg-background/60"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{language === 'es' ? 'Cantidad' : 'Quantity'}</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min="1" 
                  className="bg-background/60"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            className="border-primary/20"
          >
            {language === 'es' ? 'Cancelar' : 'Cancel'}
          </Button>
          <Button 
            type="submit"
            className="bg-gradient-to-r from-primary to-primary/80"
          >
            {language === 'es' ? 'Añadir a la lista' : 'Add to list'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
