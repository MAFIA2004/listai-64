
import React from 'react';
import { formatPrice } from '@/lib/utils';

interface TotalPriceBarProps {
  totalPrice: number;
}

export function TotalPriceBar({ totalPrice }: TotalPriceBarProps) {
  return (
    <div className="total-price-bar">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">Total a pagar:</span>
        <span className="text-lg font-bold">{formatPrice(totalPrice)}</span>
      </div>
    </div>
  );
}
