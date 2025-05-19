
import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
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
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-none bg-transparent shadow-2xl backdrop-blur-lg">
        {/* Header with background gradient */}
        <div className="bg-gradient-to-br from-primary/30 via-primary/20 to-background/80 p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-background/10 backdrop-blur-sm"></div>
          <div className="relative z-10">
            <Globe className="w-16 h-16 mx-auto mb-4 text-primary animate-pulse" />
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
              {t('dialog.welcome')}
            </h2>
            <p className="text-foreground/80 mt-2">
              {t('dialog.select_preferences')}
            </p>
          </div>
        </div>
        
        {/* Content */}
        <div className="space-y-8 p-6 bg-background/95 backdrop-blur-md">
          {/* Language Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground/90 flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              {t('dialog.language')}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div
                className={cn(
                  "flex flex-col items-center justify-center p-4 rounded-xl border cursor-pointer transition-all",
                  selectedLanguage === 'es' 
                    ? "bg-primary/10 border-primary shadow-sm ring-1 ring-primary/30" 
                    : "bg-card/50 border-border hover:bg-primary/5"
                )}
                onClick={() => setSelectedLanguage('es')}
              >
                <div className="font-medium mb-1 text-lg">Español</div>
                <div className="text-xs text-muted-foreground">Spanish</div>
              </div>
              <div
                className={cn(
                  "flex flex-col items-center justify-center p-4 rounded-xl border cursor-pointer transition-all",
                  selectedLanguage === 'en' 
                    ? "bg-primary/10 border-primary shadow-sm ring-1 ring-primary/30" 
                    : "bg-card/50 border-border hover:bg-primary/5"
                )}
                onClick={() => setSelectedLanguage('en')}
              >
                <div className="font-medium mb-1 text-lg">English</div>
                <div className="text-xs text-muted-foreground">Inglés</div>
              </div>
            </div>
          </div>

          {/* Theme Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground/90 flex items-center gap-2">
              {selectedTheme === 'light' ? (
                <Sun className="w-5 h-5 text-amber-500" />
              ) : (
                <Moon className="w-5 h-5 text-indigo-400" />
              )}
              {t('dialog.theme')}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div
                className={cn(
                  "flex flex-col items-center justify-center p-4 rounded-xl border cursor-pointer transition-all",
                  selectedTheme === 'light' 
                    ? "bg-primary/10 border-primary shadow-sm ring-1 ring-primary/30" 
                    : "bg-card/50 border-border hover:bg-primary/5"
                )}
                onClick={() => setSelectedTheme('light')}
              >
                <Sun className="h-8 w-8 mb-2 text-amber-500" />
                <span>{t('dialog.light')}</span>
              </div>
              <div
                className={cn(
                  "flex flex-col items-center justify-center p-4 rounded-xl border cursor-pointer transition-all",
                  selectedTheme === 'dark' 
                    ? "bg-primary/10 border-primary shadow-sm ring-1 ring-primary/30" 
                    : "bg-card/50 border-border hover:bg-primary/5"
                )}
                onClick={() => setSelectedTheme('dark')}
              >
                <Moon className="h-8 w-8 mb-2 text-indigo-400" />
                <span>{t('dialog.dark')}</span>
              </div>
            </div>
          </div>
          
          <Button 
            onClick={handleConfirm} 
            className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary hover:to-primary text-primary-foreground py-6"
          >
            {t('button.continue')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
