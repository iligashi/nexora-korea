import Link from 'next/link';
import Image from 'next/image';
import { Gauge, Fuel, Settings2, ShieldCheck, ShieldAlert, Calendar } from 'lucide-react';
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
            <span className="text-gray-400 text-sm">No image</span>
          </div>
        )}

        {/* Badges overlay */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {car.is_featured && (
            <span className="badge bg-brand-600 text-white text-[10px] font-bold uppercase tracking-wide">Featured</span>
          )}
          <span className={`badge ${fuelColor} text-[10px] font-semibold`}>
            {FUEL_LABELS[car.fuel_type ?? 'other']}
          </span>
        </div>

        {/* Accident status */}
        <div className="absolute top-3 right-3">
          {car.has_accident ? (
            <span className="badge bg-red-100 text-red-700 gap-1 text-[10px]">
              <ShieldAlert className="w-3 h-3" /> Accident
            </span>
          ) : (
            <span className="badge bg-green-100 text-green-700 gap-1 text-[10px]">
              <ShieldCheck className="w-3 h-3" /> Clean
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Brand + model */}
        <div className="mb-1">
          <p className="text-xs font-semibold text-brand-600 uppercase tracking-wide">{car.brand}</p>
          <h3 className="text-base font-bold text-gray-900 group-hover:text-brand-700 transition-colors leading-snug">
            {car.year} {car.model}
          </h3>
        </div>

        {/* Specs row */}
        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 mb-3">
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <Calendar className="w-3.5 h-3.5" />
            {car.year}
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <Gauge className="w-3.5 h-3.5" />
            {car.mileage_label}
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <Settings2 className="w-3.5 h-3.5" />
            {TRANSMISSION_LABELS[car.transmission ?? 'other'] ?? car.transmission}
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <Fuel className="w-3.5 h-3.5" />
            {car.engine_label}
          </span>
        </div>

        {/* Price */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
          <PriceBadge eur={car.price_eur} krw={car.price_krw} />
          <span className="text-xs font-medium text-brand-600 group-hover:underline">View details →</span>
        </div>
      </div>
    </Link>
  );
}
