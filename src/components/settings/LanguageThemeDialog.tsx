
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useTheme } from '@/hooks/use-theme';
import { Moon, Sun, Globe } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { cn } from '@/lib/utils';

interface LanguageThemeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LanguageThemeDialog({ open, onOpenChange }: LanguageThemeDialogProps) {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark'>(theme);
  const [selectedLanguage, setSelectedLanguage] = useState<'es' | 'en'>(language);

  const handleConfirm = () => {
    // Update theme if different
    if (selectedTheme !== theme) {
      toggleTheme();
    }
    
    // Update language
    setLanguage(selectedLanguage);
    
    // Close dialog
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-gradient-to-b from-background/80 to-background border-none shadow-xl backdrop-blur-lg p-0 overflow-hidden">
        <div className="bg-gradient-to-r from-primary/20 to-primary/5 p-6 text-center">
          <Globe className="w-12 h-12 mx-auto mb-4 text-primary animate-pulse" />
          <DialogTitle className="text-2xl font-bold gradient-text">{t('dialog.welcome')}</DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">
            {t('dialog.select_preferences')}
          </p>
        </div>
        
        <div className="space-y-6 p-6">
          {/* Language Selection */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground/80 mb-2">
              {t('dialog.language')}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div
                className={cn(
                  "flex items-center justify-center p-4 rounded-xl border cursor-pointer transition-all",
                  selectedLanguage === 'es' 
                    ? "bg-primary/10 border-primary/50 shadow-sm" 
                    : "bg-card border-border hover:bg-primary/5"
                )}
                onClick={() => setSelectedLanguage('es')}
              >
                <div className="text-center">
                  <span className="font-semibold block mb-1">Español</span>
                  <span className="text-xs text-muted-foreground">Spanish</span>
                </div>
              </div>
              <div
                className={cn(
                  "flex items-center justify-center p-4 rounded-xl border cursor-pointer transition-all",
                  selectedLanguage === 'en' 
                    ? "bg-primary/10 border-primary/50 shadow-sm" 
                    : "bg-card border-border hover:bg-primary/5"
                )}
                onClick={() => setSelectedLanguage('en')}
              >
                <div className="text-center">
                  <span className="font-semibold block mb-1">English</span>
                  <span className="text-xs text-muted-foreground">Inglés</span>
                </div>
              </div>
            </div>
          </div>

          {/* Theme Selection */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground/80 mb-2">
              {t('dialog.theme')}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div
                className={cn(
                  "flex items-center justify-center p-4 rounded-xl border cursor-pointer transition-all",
                  selectedTheme === 'light' 
                    ? "bg-primary/10 border-primary/50 shadow-sm" 
                    : "bg-card border-border hover:bg-primary/5"
                )}
                onClick={() => setSelectedTheme('light')}
              >
                <div className="text-center">
                  <Sun className="h-6 w-6 mx-auto mb-2 text-amber-500" />
                  <span className="text-sm">{t('dialog.light')}</span>
                </div>
              </div>
              <div
                className={cn(
                  "flex items-center justify-center p-4 rounded-xl border cursor-pointer transition-all",
                  selectedTheme === 'dark' 
                    ? "bg-primary/10 border-primary/50 shadow-sm" 
                    : "bg-card border-border hover:bg-primary/5"
                )}
                onClick={() => setSelectedTheme('dark')}
              >
                <div className="text-center">
                  <Moon className="h-6 w-6 mx-auto mb-2 text-indigo-400" />
                  <span className="text-sm">{t('dialog.dark')}</span>
                </div>
              </div>
            </div>
          </div>
          
          <Button 
            onClick={handleConfirm} 
            className="w-full bg-primary/80 hover:bg-primary text-primary-foreground"
          >
            {t('dialog.continue')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
