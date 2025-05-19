
import { useState } from 'react';
import { COMMON_SHOPPING_ITEMS } from '@/lib/constants';
import { checkSpelling } from '@/lib/utils';
import { toast } from "sonner";

interface UseAddItemFormProps {
  onAddItem: (name: string, price: number, quantity?: number) => void;
}

export function useAddItemForm({ onAddItem }: UseAddItemFormProps) {
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemQuantity, setItemQuantity] = useState('1');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [processingVoiceInput, setProcessingVoiceInput] = useState(false);
  
  // Spell check state
  const [spellCheckOpen, setSpellCheckOpen] = useState(false);
  const [spellCheckSuggestions, setSpellCheckSuggestions] = useState<string[]>([]);
  const [misspelledWord, setMisspelledWord] = useState('');

  const updateSuggestions = (input: string) => {
    if (input.length < 2) {
      setSuggestions([]);
      return;
    }
    const inputLower = input.toLowerCase();
    const filtered = COMMON_SHOPPING_ITEMS
      .filter(item => item.toLowerCase().includes(inputLower))
      .slice(0, 5);
    setSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setItemName(value);
    updateSuggestions(value);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setItemName(suggestion);
    setShowSuggestions(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim()) {
      toast.error("Nombre no puede estar vacío");
      return;
    }
    const price = parseFloat(itemPrice.replace(',', '.'));
    if (isNaN(price) || price <= 0) {
      toast.error("Precio debe ser un número positivo");
      return;
    }
    
    // Permitir campo vacío pero validar que sea un número ≥ 1 si hay algo
    const quantityValue = itemQuantity.trim();
    if (quantityValue === '') {
      toast.error("Cantidad debe ser un número positivo");
      return;
    }
    
    const quantity = parseInt(quantityValue, 10);
    if (isNaN(quantity) || quantity <= 0) {
      toast.error("Cantidad debe ser un número positivo");
      return;
    }

    // Check spelling before adding
    const { isMisspelled, suggestions } = checkSpelling(itemName);
    if (isMisspelled && suggestions.length > 0) {
      setMisspelledWord(itemName);
      setSpellCheckSuggestions(suggestions);
      setSpellCheckOpen(true);
      return;
    }

    // If no spelling issues, add the item directly
    addItemToList(itemName, price, quantity);
  };

  const handleSelectSpellingSuggestion = (suggestion: string) => {
    const price = parseFloat(itemPrice.replace(',', '.'));
    const quantity = parseInt(itemQuantity, 10) || 1;
    addItemToList(suggestion, price, quantity);
    setSpellCheckOpen(false);
  };

  const handleIgnoreSpelling = () => {
    const price = parseFloat(itemPrice.replace(',', '.'));
    const quantity = parseInt(itemQuantity, 10) || 1;
    addItemToList(misspelledWord, price, quantity);
    setSpellCheckOpen(false);
  };

  const addItemToList = (name: string, price: number, quantity: number = 1) => {
    onAddItem(name, price, quantity);
    setItemName('');
    setItemPrice('');
    setItemQuantity('1'); // Siempre volver a "1" después de agregar
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const setVoiceRecognitionValues = (name?: string, price?: string, quantity?: string) => {
    if (name) setItemName(name);
    if (price) setItemPrice(price);
    if (quantity) setItemQuantity(quantity);
  };

  const setProcessingStatus = (status: boolean) => {
    setProcessingVoiceInput(status);
  };

  return {
    itemName,
    setItemName,
    itemPrice,
    setItemPrice,
    itemQuantity,
    setItemQuantity,
    suggestions,
    showSuggestions,
    setShowSuggestions,
    processingVoiceInput,
    setProcessingStatus,
    spellCheckOpen,
    setSpellCheckOpen,
    spellCheckSuggestions,
    misspelledWord,
    handleNameChange,
    handleSuggestionClick,
    handleSubmit,
    handleSelectSpellingSuggestion,
    handleIgnoreSpelling,
    setVoiceRecognitionValues
  };
}
