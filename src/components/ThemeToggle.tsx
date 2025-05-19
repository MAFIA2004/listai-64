
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({
  className
}: ThemeToggleProps) {
  const {
    theme,
    toggleTheme
  } = useTheme();
  
  return (
    <Button 
      variant="outline" 
      size="icon" 
      onClick={toggleTheme} 
      aria-label={`Cambiar a modo ${theme === 'light' ? 'oscuro' : 'claro'}`} 
      className={cn(
        "rounded-full bg-gradient-to-b from-gray-100 to-gray-300 dark:from-gray-700 dark:to-gray-900 border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-800",
        className
      )}
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-500" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-indigo-400" />
    </Button>
  );
}
