
import React from 'react';
import { formatPrice } from '@/lib/utils';
import { useLanguage } from '@/hooks/use-language';

interface TotalPriceBarProps {
  totalPrice: number;
}

export function TotalPriceBar({ totalPrice }: TotalPriceBarProps) {
  const { t } = useLanguage();
  
  return (
    <div className="total-price-bar">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">{t('app.total')}</span>
        <span className="text-lg font-bold">{formatPrice(totalPrice)}</span>
      </div>
    </div>
  );
}
