
import React from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FloatingAIButtonProps {
  onClick: () => void;
}

export function FloatingAIButton({ onClick }: FloatingAIButtonProps) {
  return (
    <Button onClick={onClick} className="floating-button">
      <Sparkles className="h-5 w-5" />
      <span className="sr-only">Asistente IA</span>
    </Button>
  );
}
