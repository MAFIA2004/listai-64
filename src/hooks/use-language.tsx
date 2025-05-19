
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Language = 'es' | 'en';

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
};

// Translations
const translations: Record<Language, Record<string, string>> = {
  es: {
    // General texts
    'app.title': 'ListAI',
    'app.total': 'Total a pagar:',
    'app.quick_list': 'Lista Rápida',
    'app.my_products': 'Mis Productos',
    'app.empty_list': 'No hay productos en tu lista',
    'app.empty_category': 'Tu lista está vacía',
    
    // Input fields
    'input.item': 'Artículo',
    'input.price': 'Precio (€)',
    'input.quantity': 'Cantidad',
    
    // Buttons
    'button.add': 'Añadir',
    'button.add_item': 'Añadir Artículo',
    'button.cancel': 'Cancelar',
    'button.delete': 'Eliminar',
    'button.confirm': 'Confirmar',
    'button.back': 'Volver',
    'button.accept': 'Aceptar',
    'button.continue': 'Continuar',
    
    // Forms
    'form.name': 'Nombre',
    'form.price': 'Precio',
    'form.quantity': 'Cantidad',
    'form.category': 'Categoría',
    
    // Messages
    'message.saved': 'Lista guardada en el historial',
    'message.deleted': 'Lista eliminada',
    'message.updated': 'Cantidad actualizada',
    'message.voice_error': 'Error de reconocimiento de voz',
    
    // Dialogs
    'dialog.delete_confirm': '¿Eliminar artículo?',
    'dialog.delete_message': '¿Estás seguro de que deseas eliminar este artículo de tu lista de compras?',
    'dialog.history_title': 'Listas guardadas',
    'dialog.clear_all': 'Borrar historial',
    'dialog.delete_history': '¿Eliminar esta lista?',
    'dialog.delete_history_message': 'Esta acción eliminará esta lista del historial permanentemente.',
    'dialog.delete_all_history': '¿Eliminar todo el historial?',
    'dialog.delete_all_history_message': 'Esta acción eliminará todas las listas del historial permanentemente.',
    
    // Welcome dialog
    'dialog.welcome': '¡Bienvenido a ListAI!',
    'dialog.select_preferences': 'Selecciona tus preferencias',
    'dialog.language': 'Idioma',
    'dialog.theme': 'Tema',
    'dialog.light': 'Claro',
    'dialog.dark': 'Oscuro',
    
    // Budget
    'budget.title': 'Configurar Presupuesto',
    'budget.enable': 'Activar presupuesto',
    'budget.max_amount': 'Cantidad máxima (€)',
    'budget.warning': 'Aviso al alcanzar % del presupuesto',
    'budget.exceeded': '¡Presupuesto excedido!',
    'budget.exceeded_description': 'Has superado el presupuesto de {amount}. Actualmente tu lista suma {total}.',
    'budget.exceeded_by': 'Has superado tu presupuesto por {amount}',
    
    // History
    'history.no_history': 'No hay historial de compras',
    'history.saved_lists': 'Listas guardadas',
    'history.purchase_of': 'Compra del {date}',
    'history.date': 'Fecha:',
    'history.total': 'Total:',
    'history.items': 'Artículos comprados:',
    'history.restore': 'Restaurar lista',
    
    // Shopping actions
    'shopping.clear_list': '¿Borrar lista de la compra?',
    'shopping.clear_confirm': 'Esta acción eliminará todos los productos de tu lista.',
  },
  en: {
    // General texts
    'app.title': 'ListAI',
    'app.total': 'Total to pay:',
    'app.quick_list': 'Quick List',
    'app.my_products': 'My Products',
    'app.empty_list': 'No products in your list',
    'app.empty_category': 'Your list is empty',
    
    // Input fields
    'input.item': 'Item',
    'input.price': 'Price (€)',
    'input.quantity': 'Quantity',
    
    // Buttons
    'button.add': 'Add',
    'button.add_item': 'Add Item',
    'button.cancel': 'Cancel',
    'button.delete': 'Delete',
    'button.confirm': 'Confirm',
    'button.back': 'Back',
    'button.accept': 'Accept',
    'button.continue': 'Continue',
    
    // Forms
    'form.name': 'Name',
    'form.price': 'Price',
    'form.quantity': 'Quantity',
    'form.category': 'Category',
    
    // Messages
    'message.saved': 'List saved to history',
    'message.deleted': 'List deleted',
    'message.updated': 'Quantity updated',
    'message.voice_error': 'Voice recognition error',
    
    // Dialogs
    'dialog.delete_confirm': 'Delete item?',
    'dialog.delete_message': 'Are you sure you want to remove this item from your shopping list?',
    'dialog.history_title': 'Saved lists',
    'dialog.clear_all': 'Clear history',
    'dialog.delete_history': 'Delete this list?',
    'dialog.delete_history_message': 'This action will permanently delete this list from history.',
    'dialog.delete_all_history': 'Delete all history?',
    'dialog.delete_all_history_message': 'This action will permanently delete all lists from history.',
    
    // Welcome dialog
    'dialog.welcome': 'Welcome to ListAI!',
    'dialog.select_preferences': 'Select your preferences',
    'dialog.language': 'Language',
    'dialog.theme': 'Theme',
    'dialog.light': 'Light',
    'dialog.dark': 'Dark',
    
    // Budget
    'budget.title': 'Configure Budget',
    'budget.enable': 'Enable budget',
    'budget.max_amount': 'Maximum amount (€)',
    'budget.warning': 'Warning at % of budget',
    'budget.exceeded': 'Budget exceeded!',
    'budget.exceeded_description': 'You have exceeded your budget of {amount}. Your list currently totals {total}.',
    'budget.exceeded_by': 'You have exceeded your budget by {amount}',
    
    // History
    'history.no_history': 'No purchase history',
    'history.saved_lists': 'Saved lists',
    'history.purchase_of': 'Purchase of {date}',
    'history.date': 'Date:',
    'history.total': 'Total:',
    'history.items': 'Purchased items:',
    'history.restore': 'Restore list',
    
    // Shopping actions
    'shopping.clear_list': 'Clear shopping list?',
    'shopping.clear_confirm': 'This action will remove all products from your list.',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    // Try to load saved language
    const savedLanguage = localStorage.getItem('app_language') as Language;
    // If no saved language, use browser language or Spanish as default
    if (savedLanguage && (savedLanguage === 'es' || savedLanguage === 'en')) {
      return savedLanguage;
    }
    
    // Detect browser language
    const browserLang = navigator.language.substring(0, 2).toLowerCase();
    return browserLang === 'en' ? 'en' : 'es'; // Use Spanish as default if not English
  });

  // Function to change language
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app_language', lang);
  };

  // Function to get translations
  const t = (key: string): string => {
    if (!translations[language][key]) {
      console.warn(`Missing translation for key: ${key} in language: ${language}`);
      return key;
    }
    return translations[language][key];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
