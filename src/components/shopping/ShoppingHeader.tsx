
import React from 'react';
import { ShoppingCart, Globe } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export function ShoppingHeader() {
  const { t, language, setLanguage } = useLanguage();
  
  return (
    <header className="app-header">
      <div className="app-icon">
        <ShoppingCart size={18} />
      </div>
      <h1 className="text-lg font-bold flex-1">ListAI</h1>
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size="icon" 
              className={cn(
                "rounded-full bg-gradient-to-b from-gray-100 to-gray-300 dark:from-gray-700 dark:to-gray-900 border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-800"
              )}
            >
              <Globe className="h-4 w-4 text-primary" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem 
              onClick={() => setLanguage('es')}
              className={language === 'es' ? 'bg-primary/10' : ''}
            >
              Español
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setLanguage('en')} 
              className={language === 'en' ? 'bg-primary/10' : ''}
            >
              English
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <ThemeToggle />
      </div>
    </header>
  );
}
