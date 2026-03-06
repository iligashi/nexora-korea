import { formatPrice } from '@/lib/api';

interface Props {
  eur: number | null;
  krw?: number | null;
  size?: 'sm' | 'lg';
  showKrw?: boolean;
}

export default function PriceBadge({ eur, krw, size = 'sm', showKrw = false }: Props) {
  const isAvailable = eur !== null;

  if (!isAvailable) {
    return (
      <span className="text-sm font-medium text-gray-500 italic">Çmimi sipas kërkesës</span>
    );
  }

  const eurFormatted = new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(eur!);

  if (size === 'lg') {
    return (
      <div>
        <p className="text-3xl font-black text-gray-900">{eurFormatted}</p>
        {showKrw && krw && (
          <p className="text-sm text-gray-500 mt-0.5">
            ≈ {new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW', maximumFractionDigits: 0 }).format(krw)}
          </p>
        )}
      </div>
    );
  }

  return (
    <div>
      <span className="text-xl font-black text-gray-900">{eurFormatted}</span>
      {showKrw && krw && (
        <span className="ml-1.5 text-xs text-gray-400">
          / {new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 0 }).format(krw / 10000)}만원
        </span>
      )}
    </div>
  );
}
