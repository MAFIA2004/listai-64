
import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useLanguage } from '@/hooks/use-language';

export function ShoppingHeader() {
  const { t } = useLanguage();
  
  return (
    <header className="app-header">
      <div className="app-icon">
        <ShoppingCart size={18} />
      </div>
      <h1 className="text-lg font-bold flex-1">ListAI</h1>
      <ThemeToggle />
    </header>
  );
}
