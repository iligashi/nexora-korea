import { Calendar, Gauge, Fuel, Settings2, Zap, ShieldCheck, ShieldAlert, Hash } from 'lucide-react';
import type { CarDetail } from '@/lib/types';
import { FUEL_LABELS, TRANSMISSION_LABELS } from '@/lib/api';
import clsx from 'clsx';

interface Props {
  car: CarDetail;
}

interface SpecItem {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: 'green' | 'red' | 'blue';
}

export default function SpecGrid({ car }: Props) {
  const specs: SpecItem[] = [
    {
      icon: <Calendar className="w-5 h-5" />,
      label: 'Viti',
      value: String(car.year),
    },
    {
      icon: <Gauge className="w-5 h-5" />,
      label: 'Kilometrazhi',
      value: car.mileage_label,
    },
    {
      icon: <Fuel className="w-5 h-5" />,
      label: 'Lloji i Karburantit',
      value: FUEL_LABELS[car.fuel_type ?? 'other'] ?? car.fuel_type ?? 'N/A',
    },
    {
      icon: <Settings2 className="w-5 h-5" />,
      label: 'Transmisioni',
      value: TRANSMISSION_LABELS[car.transmission ?? 'other'] ?? car.transmission ?? 'N/A',
    },
    {
      icon: <Zap className="w-5 h-5" />,
      label: 'Motori',
      value: car.engine_label,
    },
    {
      icon: car.has_accident
        ? <ShieldAlert className="w-5 h-5" />
        : <ShieldCheck className="w-5 h-5" />,
      label: 'Historiku i Aksidenteve',
      value: car.has_accident ? 'Aksident i raportuar' : 'Pa aksident',
      highlight: car.has_accident ? 'red' : 'green',
    },
    {
      icon: <ShieldCheck className="w-5 h-5" />,
      label: 'Riparim i Thjeshtë',
      value: car.has_simple_repair ? 'Riparim i vogël i regjistruar' : 'Asnjë',
      highlight: car.has_simple_repair ? 'red' : 'green',
    },
    {
      icon: <Hash className="w-5 h-5" />,
      label: 'ID Encar',
      value: car.source_url
        ? car.source_url.split('carid=')[1] ?? 'N/A'
        : 'N/A',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {specs.map(({ icon, label, value, highlight }) => (
        <div
          key={label}
          className={clsx(
            'flex flex-col gap-2 p-4 rounded-xl border transition-all hover:shadow-sm',
            highlight === 'green' && 'bg-emerald-50/80 border-emerald-100',
            highlight === 'red'   && 'bg-red-50/80 border-red-100',
            !highlight            && 'bg-gray-50/80 border-gray-100'
          )}
        >
          <span className={clsx(
            'flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest',
            highlight === 'green' && 'text-emerald-600',
            highlight === 'red'   && 'text-red-600',
            !highlight            && 'text-gray-400'
          )}>
            {icon}
            {label}
          </span>
          <span className={clsx(
            'text-sm font-bold',
            highlight === 'green' && 'text-emerald-800',
            highlight === 'red'   && 'text-red-800',
            !highlight            && 'text-gray-900'
          )}>
            {value}
          </span>
        </div>
      ))}
    </div>
  );
}
