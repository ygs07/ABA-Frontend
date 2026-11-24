import React from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { CategoryFilter } from '@/components/patterns/CategoryFilter';
import { Merchant } from '@/features/merchants/types';

interface ShopFiltersProps {
  merchants: Merchant[];
  selectedMerchant: string | null;
  setSelectedMerchant: (id: string | null) => void;
  minPrice: string;
  setMinPrice: (value: string) => void;
  maxPrice: string;
  setMaxPrice: (value: string) => void;
  inStockOnly: boolean;
  setInStockOnly: (value: boolean) => void;
  minRating: number | null;
  setMinRating: (value: number | null) => void;
  onClearAll: () => void;
}

export function ShopFilters({
  merchants,
  selectedMerchant,
  setSelectedMerchant,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  inStockOnly,
  setInStockOnly,
  minRating,
  setMinRating,
  onClearAll,
}: ShopFiltersProps) {
  return (
    <div className="space-y-4">
      <CategoryFilter />

      <div className="bg-white border border-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5" />
            Filters
          </h2>
          <button
            type="button"
            className="text-xs text-brand-600 hover:underline"
            onClick={onClearAll}
          >
            Clear all
          </button>
        </div>

        <div className="space-y-6">
          {/* Price Filter */}
          <div className="border-t border-border pt-4">
            <h3 className="font-medium text-text mb-3">Price Range (₦)</h3>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                inputMode="numeric"
                placeholder="Min"
                aria-label="Minimum price"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full h-8 px-2 rounded border border-border text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
              <span>-</span>
              <input
                type="number"
                min="0"
                inputMode="numeric"
                placeholder="Max"
                aria-label="Maximum price"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full h-8 px-2 rounded border border-border text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Availability */}
          <div className="border-t border-border pt-4">
            <h3 className="font-medium text-text mb-3">Availability</h3>
            <label className="flex items-center gap-2 text-sm text-text-muted cursor-pointer hover:text-brand-600">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="rounded text-brand-600 focus:ring-brand-500"
              />
              In stock only
            </label>
          </div>

          {/* Minimum Rating */}
          <div className="border-t border-border pt-4">
            <h3 className="font-medium text-text mb-3">Minimum Rating</h3>
            <div className="space-y-2 text-sm text-text-muted">
              {[4, 3, 2].map((stars) => (
                <label key={stars} className="flex items-center gap-2 cursor-pointer hover:text-brand-600">
                  <input
                    type="radio"
                    name="minRating"
                    checked={minRating === stars}
                    onChange={() => setMinRating(stars)}
                    className="text-brand-600 focus:ring-brand-500"
                  />
                  {stars}★ &amp; up
                </label>
              ))}
            </div>
          </div>

          {/* Merchant Filter */}
          {merchants.length > 0 && (
            <div className="border-t border-border pt-4">
              <h3 className="font-medium text-text mb-3">Merchant</h3>
              <div className="space-y-2 text-sm text-text-muted max-h-48 overflow-y-auto">
                {merchants.map((merch) => (
                  <label key={merch.id} className="flex items-center gap-2 cursor-pointer hover:text-brand-600">
                    <input
                      type="radio"
                      name="merchant"
                      checked={selectedMerchant === merch.id}
                      onChange={() => setSelectedMerchant(merch.id)}
                      className="rounded text-brand-600 focus:ring-brand-500"
                    />
                    <span className="truncate">{merch.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
