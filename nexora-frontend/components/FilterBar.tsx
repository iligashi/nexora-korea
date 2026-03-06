'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback, useState } from 'react';
import { SlidersHorizontal, Search, RotateCcw, X } from 'lucide-react';
import type { FilterOptions, SortOption } from '@/lib/types';
import clsx from 'clsx';

interface Props {
  filters: FilterOptions;
  totalCars: number;
}

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: 'Newest first',      value: 'newest' },
  { label: 'Price: Low → High', value: 'price_asc' },
  { label: 'Price: High → Low', value: 'price_desc' },
  { label: 'Year: Newest',      value: 'year_desc' },
  { label: 'Mileage: Lowest',   value: 'mileage_asc' },
];

export default function FilterBar({ filters, totalCars }: Props) {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);

  const get = (key: string) => searchParams.get(key) ?? '';

  const push = useCallback((updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v) params.set(k, v);
      else params.delete(k);
    });
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  }, [searchParams, pathname, router]);

  const hasFilters = ['brand', 'fuel', 'transmission', 'year_min', 'year_max', 'price_min', 'price_max', 'no_accident', 'search']
    .some((k) => searchParams.has(k));

  const clearAll = () => {
    const params = new URLSearchParams();
    const sort = get('sort');
    if (sort) params.set('sort', sort);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="bg-white border-b border-gray-100 sticky top-16 z-40">
      <div className="container-main py-3">
        {/* Top bar */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="search"
              placeholder="Search brand or model..."
              defaultValue={get('search')}
              onKeyDown={(e) => {
                if (e.key === 'Enter') push({ search: (e.target as HTMLInputElement).value });
              }}
              className="input-field pl-9 pr-4 text-sm h-10"
            />
          </div>

          {/* Sort */}
          <select
            value={get('sort') || 'newest'}
            onChange={(e) => push({ sort: e.target.value })}
            className="select-field w-auto h-10 text-sm"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={clsx(
              'flex items-center gap-2 h-10 px-4 text-sm font-medium rounded-lg border transition-colors',
              showFilters || hasFilters
                ? 'bg-brand-600 text-white border-brand-600'
                : 'border-gray-200 text-gray-700 hover:bg-gray-50'
            )}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {hasFilters && (
              <span className="w-5 h-5 bg-white text-brand-600 rounded-full text-xs font-bold flex items-center justify-center">
                !
              </span>
            )}
          </button>

          {/* Result count */}
          <span className="text-sm text-gray-500 ml-auto hidden sm:block">
            {totalCars.toLocaleString()} vehicles found
          </span>

          {/* Clear */}
          {hasFilters && (
            <button
              onClick={clearAll}
              className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Clear
            </button>
          )}
        </div>

        {/* Expandable filter panel */}
        {showFilters && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 animate-fade-in pt-4 border-t border-gray-100">

            {/* Brand */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Brand</label>
              <select
                value={get('brand')}
                onChange={(e) => push({ brand: e.target.value })}
                className="select-field text-sm"
              >
                <option value="">All brands</option>
                {filters.brands.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            {/* Fuel */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Fuel</label>
              <select
                value={get('fuel')}
                onChange={(e) => push({ fuel: e.target.value })}
                className="select-field text-sm"
              >
                <option value="">All fuels</option>
                {filters.fuel_types.map((f) => <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>)}
              </select>
            </div>

            {/* Transmission */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Gearbox</label>
              <select
                value={get('transmission')}
                onChange={(e) => push({ transmission: e.target.value })}
                className="select-field text-sm"
              >
                <option value="">All</option>
                {filters.transmissions.map((t) => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </div>

            {/* Year range */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Year from</label>
              <input
                type="number"
                min={filters.year_range.min}
                max={filters.year_range.max}
                defaultValue={get('year_min')}
                placeholder={String(filters.year_range.min)}
                onBlur={(e) => push({ year_min: e.target.value })}
                className="input-field text-sm"
              />
            </div>

            {/* Price max */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Max price (EUR)</label>
              <input
                type="number"
                min={0}
                step={1000}
                defaultValue={get('price_max')}
                placeholder={String(Math.ceil((filters.price_range.max ?? 50000) / 1000) * 1000)}
                onBlur={(e) => push({ price_max: e.target.value })}
                className="input-field text-sm"
              />
            </div>

            {/* No accident toggle */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Condition</label>
              <label className="flex items-center gap-2 cursor-pointer h-10">
                <input
                  type="checkbox"
                  checked={get('no_accident') === '1'}
                  onChange={(e) => push({ no_accident: e.target.checked ? '1' : '' })}
                  className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                />
                <span className="text-sm text-gray-700">No accident only</span>
              </label>
            </div>
          </div>
        )}

        {/* Active filter chips */}
        {hasFilters && !showFilters && (
          <div className="mt-3 flex flex-wrap gap-2">
            {['brand', 'fuel', 'transmission', 'search'].map((key) => {
              const val = get(key);
              if (!val) return null;
              return (
                <button
                  key={key}
                  onClick={() => push({ [key]: '' })}
                  className="flex items-center gap-1.5 px-3 py-1 bg-brand-50 text-brand-700 text-xs font-medium rounded-full border border-brand-200 hover:bg-brand-100 transition-colors"
                >
                  <span className="capitalize">{key}:</span> {val}
                  <X className="w-3 h-3" />
                </button>
              );
            })}
            {get('no_accident') === '1' && (
              <button
                onClick={() => push({ no_accident: '' })}
                className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full border border-green-200 hover:bg-green-100 transition-colors"
              >
                No accident <X className="w-3 h-3" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
