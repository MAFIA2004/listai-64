
import React from 'react';
import { formatPrice } from '@/lib/utils';
import { useLanguage } from '@/hooks/use-language';

interface TotalPriceBarProps {
  totalPrice: number;
}

export function TotalPriceBar({ totalPrice }: TotalPriceBarProps) {
  const { t } = useLanguage();
  
  // Función para formatear correctamente el precio total
  const formatTotalPrice = (price: number) => {
    // Si el precio es menor que 1 pero mayor que 0, convertirlo a céntimos (dividiendo por 10)
    const displayPrice = price >= 0 && price < 1 ? price / 10 : price;
    return formatPrice(displayPrice);
  };
  
  return (
    <div className="total-price-bar">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">{t('app.total')}</span>
        <span className="text-lg font-bold">{formatTotalPrice(totalPrice)}</span>
      </div>
    </div>
  );
}
