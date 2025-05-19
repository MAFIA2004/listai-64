
import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useTheme } from '@/hooks/use-theme';
import { Moon, Sun, Globe } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';

interface LanguageThemeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LanguageThemeDialog({ open, onOpenChange }: LanguageThemeDialogProps) {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark'>(theme);
  const [selectedLanguage, setSelectedLanguage] = useState<'es' | 'en'>(language);

  const handleConfirm = () => {
    // Actualizar tema si es diferente
    if (selectedTheme !== theme) {
      toggleTheme();
    }
    
    // Actualizar idioma
    setLanguage(selectedLanguage);
    
    // Cerrar el diálogo
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <div className="space-y-6 py-4">
          <div className="text-center space-y-2">
            <Globe className="mx-auto h-8 w-8 text-primary" />
            <h2 className="text-xl font-bold">¡Bienvenido a ListAI!</h2>
            <p className="text-sm text-muted-foreground">
              Por favor, selecciona tu idioma y tema preferidos.
            </p>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-3">Idioma / Language</h3>
              <RadioGroup
                defaultValue={selectedLanguage}
                onValueChange={(value) => setSelectedLanguage(value as 'es' | 'en')}
                className="flex flex-col gap-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="es" id="es" />
                  <Label htmlFor="es" className="flex-1">Español</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="en" id="en" />
                  <Label htmlFor="en" className="flex-1">English</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-3">Tema / Theme</h3>
              <RadioGroup
                defaultValue={selectedTheme}
                onValueChange={(value) => setSelectedTheme(value as 'light' | 'dark')}
                className="flex flex-col gap-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="light" id="light" />
                  <Label htmlFor="light" className="flex items-center gap-2">
                    <Sun className="h-4 w-4" />
                    <span>Claro / Light</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="dark" id="dark" />
                  <Label htmlFor="dark" className="flex items-center gap-2">
                    <Moon className="h-4 w-4" />
                    <span>Oscuro / Dark</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          
          <div className="flex justify-center">
            <Button onClick={handleConfirm}>
              Continuar / Continue
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
