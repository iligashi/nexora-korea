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
    next: { revalidate: 300 },
    ...options,
  });

  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${res.statusText} — ${url}`);
  }

  return res.json() as Promise<T>;
}

export async function getCars(filters: CarFilters = {}): Promise<CarsResponse> {
  const url = buildUrl('/cars', filters as Record<string, string | number | boolean | undefined>);
  return apiFetch<CarsResponse>(url);
}

export async function getCar(id: number): Promise<CarDetailResponse> {
  return apiFetch<CarDetailResponse>(buildUrl(`/cars/${id}`), {
    next: { revalidate: 600 },
  });
}

export async function getBrands(): Promise<BrandsResponse> {
  return apiFetch<BrandsResponse>(buildUrl('/brands'), {
    next: { revalidate: 3600 },
  });
}

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
  if (eur === null) return 'Cmimi sipas k\u00ebrkeses';
  const eurStr = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(eur);
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
  gasoline: 'Benzin\u00eb',
  diesel:   'Naft\u00eb',
  electric: 'Elektrike',
  hybrid:   'Hibride',
  lpg:      'LPG',
  other:    'Tjet\u00ebr',
};

export const TRANSMISSION_LABELS: Record<string, string> = {
  automatic:        'Automatike',
  manual:           'Manuale',
  'semi-automatic': 'Gjysm\u00eb-Auto',
  cvt:              'CVT',
  other:            'Tjet\u00ebr',
};

export const FUEL_COLORS: Record<string, string> = {
  electric: 'bg-green-100 text-green-800',
  hybrid:   'bg-teal-100 text-teal-800',
  diesel:   'bg-yellow-100 text-yellow-800',
  gasoline: 'bg-blue-100 text-blue-800',
  lpg:      'bg-orange-100 text-orange-800',
  other:    'bg-gray-100 text-gray-700',
};
