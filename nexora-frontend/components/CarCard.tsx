import Link from 'next/link';
import Image from 'next/image';
import { Gauge, Fuel, Settings2, ShieldCheck, ShieldAlert, Calendar, ArrowRight } from 'lucide-react';
import type { Car } from '@/lib/types';
import { FUEL_LABELS, FUEL_COLORS, TRANSMISSION_LABELS } from '@/lib/api';
import PriceBadge from './PriceBadge';

interface Props {
  car: Car;
}

export default function CarCard({ car }: Props) {
  const fuelColor = FUEL_COLORS[car.fuel_type ?? 'other'] ?? 'bg-gray-100 text-gray-700';

  return (
    <Link href={`/car/${car.id}`} className="group block card animate-slide-up">
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
        {car.image_url ? (
          <Image
            src={car.image_url}
            alt={`${car.year} ${car.brand} ${car.model}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <span className="text-gray-400 text-sm">Pa foto</span>
          </div>
        )}

        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badges overlay */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {car.is_featured && (
            <span className="badge bg-brand-600 text-white text-[10px] font-bold uppercase tracking-wide shadow-sm">E Veçantë</span>
          )}
          <span className={`badge ${fuelColor} text-[10px] font-semibold shadow-sm`}>
            {FUEL_LABELS[car.fuel_type ?? 'other']}
          </span>
        </div>

        {/* Accident status */}
        <div className="absolute top-3 right-3">
          {car.has_accident ? (
            <span className="badge bg-red-500/90 text-white gap-1 text-[10px] shadow-sm backdrop-blur-sm">
              <ShieldAlert className="w-3 h-3" /> Aksident
            </span>
          ) : (
            <span className="badge bg-emerald-500/90 text-white gap-1 text-[10px] shadow-sm backdrop-blur-sm">
              <ShieldCheck className="w-3 h-3" /> Pa Aksident
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Brand + model */}
        <div className="mb-2">
          <p className="text-[10px] font-bold text-brand-600 uppercase tracking-widest mb-0.5">{car.brand}</p>
          <h3 className="text-sm font-bold text-gray-900 group-hover:text-brand-700 transition-colors leading-snug line-clamp-1">
            {car.year} {car.model}
          </h3>
        </div>

        {/* Specs row */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-3">
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <Calendar className="w-3 h-3 text-gray-400" />
            {car.year}
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <Gauge className="w-3 h-3 text-gray-400" />
            {car.mileage_label}
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <Settings2 className="w-3 h-3 text-gray-400" />
            {TRANSMISSION_LABELS[car.transmission ?? 'other'] ?? car.transmission}
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <Fuel className="w-3 h-3 text-gray-400" />
            {car.engine_label}
          </span>
        </div>

        {/* Price */}
        <div className="pt-3 border-t border-gray-100 flex items-end justify-between">
          <PriceBadge eur={car.price_eur} krw={car.price_krw} />
          <span className="flex items-center gap-1 text-xs font-semibold text-brand-600 opacity-0 group-hover:opacity-100 transition-opacity">
            Detaje <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </Link>
  );
}
