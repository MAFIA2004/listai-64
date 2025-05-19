
import React from 'react';
import { ShoppingCart, Settings } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';

export function ShoppingHeader() {
  const { t, toggleLanguageDialog } = useLanguage();
  
  return (
    <header className="app-header">
      <div className="app-icon">
        <ShoppingCart size={18} />
      </div>
      <h1 className="text-lg font-bold flex-1">ListAI</h1>
      <Button 
        variant="ghost" 
        size="icon"
        onClick={() => toggleLanguageDialog(true)}
        className="mr-2"
      >
        <Settings size={18} />
      </Button>
      <ThemeToggle />
    </header>
  );
}
