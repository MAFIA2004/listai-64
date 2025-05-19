
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Language = 'es' | 'en';

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  toggleLanguageDialog: (open: boolean) => void;
};

// Traducciones
const translations: Record<Language, Record<string, string>> = {
  es: {
    // Textos generales
    'app.title': 'ListAI',
    'app.total': 'Total a pagar:',
    'app.quick_list': 'Lista Rápida',
    'app.my_products': 'Mis Productos',
    'app.empty_list': 'No hay productos en tu lista',
    'app.empty_category': 'Tu lista está vacía',
    
    // Botones
    'button.add': 'Añadir',
    'button.cancel': 'Cancelar',
    'button.delete': 'Eliminar',
    'button.confirm': 'Confirmar',
    'button.back': 'Volver',
    
    // Formularios
    'form.name': 'Nombre',
    'form.price': 'Precio',
    'form.quantity': 'Cantidad',
    'form.category': 'Categoría',
    
    // Mensajes
    'message.saved': 'Lista guardada en el historial',
    'message.deleted': 'Lista eliminada',
    'message.updated': 'Cantidad actualizada',
    
    // Diálogos
    'dialog.delete_confirm': '¿Eliminar artículo?',
    'dialog.delete_message': '¿Estás seguro de que deseas eliminar este artículo de tu lista de compras?',
    'dialog.history_title': 'Listas guardadas',
    'dialog.clear_all': 'Borrar historial',
    'dialog.delete_history': '¿Eliminar esta lista?',
    'dialog.delete_history_message': 'Esta acción eliminará esta lista del historial permanentemente.',
  },
  en: {
    // General texts
    'app.title': 'ListAI',
    'app.total': 'Total to pay:',
    'app.quick_list': 'Quick List',
    'app.my_products': 'My Products',
    'app.empty_list': 'No products in your list',
    'app.empty_category': 'Your list is empty',
    
    // Buttons
    'button.add': 'Add',
    'button.cancel': 'Cancel',
    'button.delete': 'Delete',
    'button.confirm': 'Confirm',
    'button.back': 'Back',
    
    // Forms
    'form.name': 'Name',
    'form.price': 'Price',
    'form.quantity': 'Quantity',
    'form.category': 'Category',
    
    // Messages
    'message.saved': 'List saved to history',
    'message.deleted': 'List deleted',
    'message.updated': 'Quantity updated',
    
    // Dialogs
    'dialog.delete_confirm': 'Delete item?',
    'dialog.delete_message': 'Are you sure you want to remove this item from your shopping list?',
    'dialog.history_title': 'Saved lists',
    'dialog.clear_all': 'Clear history',
    'dialog.delete_history': 'Delete this list?',
    'dialog.delete_history_message': 'This action will permanently delete this list from history.',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    // Intentar cargar el idioma guardado
    const savedLanguage = localStorage.getItem('app_language') as Language;
    // Si no hay idioma guardado, usar el idioma del navegador o español por defecto
    if (savedLanguage && (savedLanguage === 'es' || savedLanguage === 'en')) {
      return savedLanguage;
    }
    
    // Detectar idioma del navegador
    const browserLang = navigator.language.substring(0, 2).toLowerCase();
    return browserLang === 'en' ? 'en' : 'es'; // Usar español por defecto si no es inglés
  });

  const [languageDialogOpen, setLanguageDialogOpen] = useState(false);

  // Función para cambiar el idioma
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app_language', lang);
  };

  // Función para abrir/cerrar el diálogo de idioma
  const toggleLanguageDialog = (open: boolean) => {
    setLanguageDialogOpen(open);
  };

  // Función para obtener traducciones
  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ 
      language, 
      setLanguage, 
      t,
      toggleLanguageDialog 
    }}>
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
