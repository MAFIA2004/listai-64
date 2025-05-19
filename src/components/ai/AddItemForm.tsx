
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/use-language";
import { useForm } from "react-hook-form";
import { getItemEmoji } from "@/lib/utils";
import { useState } from "react";

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
  const [priceInput, setPriceInput] = useState('1.0');
  const [quantityInput, setQuantityInput] = useState(selectedItem?.quantity?.toString() || '1');
  
  const form = useForm<ItemFormValues>({
    defaultValues: {
      price: 1.0,
      quantity: selectedItem?.quantity || 1,
    },
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddItem({
      price: parseFloat(priceInput) || 0,
      quantity: parseInt(quantityInput) || 1
    });
  };
  
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty value or valid decimal number
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setPriceInput(value);
      form.setValue('price', parseFloat(value) || 0);
    }
  };
  
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty value or valid integer
    if (value === '' || /^\d*$/.test(value)) {
      setQuantityInput(value);
      form.setValue('quantity', parseInt(value) || 1);
    }
  };
  
  if (!selectedItem) return null;
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-2">
      <div className="space-y-2">
        <FormLabel>{language === 'es' ? 'Precio (€)' : 'Price (€)'}</FormLabel>
        <Input 
          type="text" 
          className="bg-background/60"
          value={priceInput}
          onChange={handlePriceChange}
          inputMode="decimal"
        />
      </div>

      <div className="space-y-2">
        <FormLabel>{language === 'es' ? 'Cantidad' : 'Quantity'}</FormLabel>
        <Input 
          type="text" 
          className="bg-background/60"
          value={quantityInput}
          onChange={handleQuantityChange}
          inputMode="numeric"
        />
      </div>

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
  );
}
