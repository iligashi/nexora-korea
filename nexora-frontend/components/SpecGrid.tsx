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
      label: 'Year',
      value: String(car.year),
    },
    {
      icon: <Gauge className="w-5 h-5" />,
      label: 'Mileage',
      value: car.mileage_label,
    },
    {
      icon: <Fuel className="w-5 h-5" />,
      label: 'Fuel Type',
      value: FUEL_LABELS[car.fuel_type ?? 'other'] ?? car.fuel_type ?? 'N/A',
    },
    {
      icon: <Settings2 className="w-5 h-5" />,
      label: 'Transmission',
      value: TRANSMISSION_LABELS[car.transmission ?? 'other'] ?? car.transmission ?? 'N/A',
    },
    {
      icon: <Zap className="w-5 h-5" />,
      label: 'Engine',
      value: car.engine_label,
    },
    {
      icon: car.has_accident
        ? <ShieldAlert className="w-5 h-5" />
        : <ShieldCheck className="w-5 h-5" />,
      label: 'Accident History',
      value: car.has_accident ? 'Accident reported' : 'No accident',
      highlight: car.has_accident ? 'red' : 'green',
    },
    {
      icon: <ShieldCheck className="w-5 h-5" />,
      label: 'Simple Repair',
      value: car.has_simple_repair ? 'Minor repair recorded' : 'None',
      highlight: car.has_simple_repair ? 'red' : 'green',
    },
    {
      icon: <Hash className="w-5 h-5" />,
      label: 'Encar ID',
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
            'flex flex-col gap-1.5 p-4 rounded-xl border',
            highlight === 'green' && 'bg-green-50 border-green-100',
            highlight === 'red'   && 'bg-red-50 border-red-100',
            !highlight            && 'bg-gray-50 border-gray-100'
          )}
        >
          <span className={clsx(
            'flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide',
            highlight === 'green' && 'text-green-600',
            highlight === 'red'   && 'text-red-600',
            !highlight            && 'text-gray-400'
          )}>
            {icon}
            {label}
          </span>
          <span className={clsx(
            'text-sm font-bold',
            highlight === 'green' && 'text-green-800',
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
