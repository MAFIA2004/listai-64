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
  return <Button variant="outline" size="icon" onClick={toggleTheme} aria-label={`Cambiar a modo ${theme === 'light' ? 'oscuro' : 'claro'}`} className="text-slate-50 bg-slate-950 hover:bg-slate-800 rounded-sm text-justify font-light text-3xl">
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 white scale-100" />
    </Button>;
}