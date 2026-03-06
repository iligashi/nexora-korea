import type {
  CarsResponse,
  CarDetailResponse,
  BrandsResponse,
  CarFilters,
} from './types';

const API_BASE = process.env.NEXORA_API_URL ?? 'http://localhost:8000/api';

function buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>): string {
  const url = new URL(`${API_BASE}${path}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });
  }
  return url.toString();
}

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    next: { revalidate: 300 }, // ISR: revalidate every 5 minutes
    ...options,
  });

  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${res.statusText} — ${url}`);
  }

  return res.json() as Promise<T>;
}

/**
 * Fetch paginated car listings with optional filters.
 */
export async function getCars(filters: CarFilters = {}): Promise<CarsResponse> {
  const url = buildUrl('/cars', filters as Record<string, string | number | boolean | undefined>);
  return apiFetch<CarsResponse>(url);
}

/**
 * Fetch a single car by ID (full detail).
 */
export async function getCar(id: number): Promise<CarDetailResponse> {
  return apiFetch<CarDetailResponse>(buildUrl(`/cars/${id}`), {
    next: { revalidate: 600 },
  });
}

/**
 * Fetch all active brands.
 */
export async function getBrands(): Promise<BrandsResponse> {
  return apiFetch<BrandsResponse>(buildUrl('/brands'), {
    next: { revalidate: 3600 },
  });
}

/**
 * Trigger a manual Encar import (server-side only, protected by secret).
 */
export async function triggerFetch(brand?: string): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/fetch`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Fetch-Secret': process.env.NEXORA_FETCH_SECRET ?? '',
    },
    body: JSON.stringify(brand ? { brand } : {}),
  });

  if (!res.ok) {
    throw new Error(`Fetch trigger failed: ${res.status}`);
  }

  return res.json();
}

// ─── Formatters ─────────────────────────────────────────────────────────────

export function formatPrice(eur: number | null, krw: number | null = null): string {
  if (eur === null) return 'Price on request';
  const eurStr = new Intl.NumberFormat('en-EU', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(eur);
  if (krw !== null) {
    const krwStr = new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW', maximumFractionDigits: 0 }).format(krw);
    return `${eurStr} (${krwStr})`;
  }
  return eurStr;
}

export function formatMileage(km: number | null): string {
  if (km === null) return 'N/A';
  return new Intl.NumberFormat('en').format(km) + ' km';
}

export const FUEL_LABELS: Record<string, string> = {
  gasoline: 'Gasoline',
  diesel:   'Diesel',
  electric: 'Electric',
  hybrid:   'Hybrid',
  lpg:      'LPG',
  other:    'Other',
};

export const TRANSMISSION_LABELS: Record<string, string> = {
  automatic:      'Automatic',
  manual:         'Manual',
  'semi-automatic': 'Semi-Auto',
  cvt:            'CVT',
  other:          'Other',
};

export const FUEL_COLORS: Record<string, string> = {
  electric: 'bg-green-100 text-green-800',
  hybrid:   'bg-teal-100 text-teal-800',
  diesel:   'bg-yellow-100 text-yellow-800',
  gasoline: 'bg-blue-100 text-blue-800',
  lpg:      'bg-orange-100 text-orange-800',
  other:    'bg-gray-100 text-gray-700',
};
