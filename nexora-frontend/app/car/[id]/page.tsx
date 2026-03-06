import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCar } from '@/lib/api';
import { FUEL_LABELS, TRANSMISSION_LABELS, FUEL_COLORS } from '@/lib/api';
import ImageGallery from '@/components/ImageGallery';
import PriceBadge from '@/components/PriceBadge';
import SpecGrid from '@/components/SpecGrid';
import DiagnosticAccordion from '@/components/DiagnosticAccordion';
import {
  ChevronLeft,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  Share2,
} from 'lucide-react';

interface PageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const { data: car } = await getCar(Number(params.id));
    return {
      title: `${car.year} ${car.brand} ${car.model}`,
      description: `Buy this ${car.year} ${car.brand} ${car.model} — ${car.engine_label}, ${car.mileage_label}, ${car.fuel_type}. Price: €${car.price_eur?.toLocaleString() ?? 'N/A'}`,
      openGraph: {
        title:       `${car.year} ${car.brand} ${car.model} | Nexora Cars`,
        description: `${car.engine_label} • ${car.mileage_label} • €${car.price_eur?.toLocaleString()}`,
        images:      car.image_url ? [{ url: car.image_url }] : [],
      },
    };
  } catch {
    return { title: 'Car Details | Nexora Cars' };
  }
}

export default async function CarDetailPage({ params }: PageProps) {
  let car;
  try {
    const res = await getCar(Number(params.id));
    car = res.data;
  } catch {
    notFound();
  }

  const allImages = [
    ...(car.image_url ? [car.image_url] : []),
    ...(car.thumbnail_urls ?? []).filter((u) => u !== car.image_url),
  ];

  const externalOptions = car.internal_inspection?.options ?? [];
  const externalConditions = car.external_inspection?.conditions ?? [];

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="container-main py-3 flex items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="flex items-center gap-1 hover:text-brand-600 transition-colors">
            <ChevronLeft className="w-4 h-4" />
            All Cars
          </Link>
          <span>/</span>
          <span className="text-gray-400">{car.brand}</span>
          <span>/</span>
          <span className="text-gray-900 font-medium truncate">{car.year} {car.model}</span>
        </div>
      </div>

      <div className="container-main py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Left column: images + details ── */}
          <div className="lg:col-span-2 space-y-8">

            {/* Gallery */}
            <div className="bg-white rounded-2xl p-5 shadow-card">
              <ImageGallery images={allImages} alt={`${car.year} ${car.brand} ${car.model}`} />
            </div>

            {/* Specs */}
            <div className="bg-white rounded-2xl p-6 shadow-card">
              <h2 className="text-lg font-black text-gray-900 mb-5">Vehicle Specifications</h2>
              <SpecGrid car={car} />
            </div>

            {/* External inspection */}
            {(externalConditions.length > 0 || externalOptions.length > 0) && (
              <div className="bg-white rounded-2xl p-6 shadow-card">
                <h2 className="text-lg font-black text-gray-900 mb-5">Inspection Details</h2>

                {externalConditions.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Conditions</h3>
                    <div className="flex flex-wrap gap-2">
                      {externalConditions.map((c: string) => (
                        <span key={c} className="badge bg-blue-50 text-blue-700 border border-blue-100 text-xs">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {externalOptions.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Options & Features</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {externalOptions.map((opt: string) => (
                        <div key={opt} className="flex items-center gap-2 text-sm text-gray-700">
                          <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                          {opt}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Diagnostics */}
            <div className="bg-white rounded-2xl p-6 shadow-card">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-black text-gray-900">Diagnostic Report</h2>
                {car.source_url && (
                  <a
                    href={car.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-800 transition-colors"
                  >
                    View on Encar
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
              <DiagnosticAccordion
                diagnosticData={car.diagnostic_data ?? null}
                inners={car.inners as Record<string, unknown> | null}
              />
            </div>
          </div>

          {/* ── Right column: price + CTA ── */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-5">

              {/* Price card */}
              <div className="bg-white rounded-2xl p-6 shadow-card">
                {/* Brand + model */}
                <p className="text-xs font-bold text-brand-600 uppercase tracking-widest mb-1">{car.brand}</p>
                <h1 className="text-2xl font-black text-gray-900 leading-tight mb-1">
                  {car.year} {car.model}
                </h1>
                <p className="text-sm text-gray-500 mb-4">
                  {FUEL_LABELS[car.fuel_type ?? 'other']} ·{' '}
                  {TRANSMISSION_LABELS[car.transmission ?? 'other']} ·{' '}
                  {car.engine_label}
                </p>

                {/* Fuel badge */}
                <span className={`badge ${FUEL_COLORS[car.fuel_type ?? 'other']} text-xs font-semibold mb-5 inline-block`}>
                  {FUEL_LABELS[car.fuel_type ?? 'other']}
                </span>

                {/* Price */}
                <div className="border-t border-gray-100 pt-4 mb-5">
                  <PriceBadge eur={car.price_eur} krw={car.price_krw} size="lg" showKrw />
                  <p className="text-xs text-gray-400 mt-1">Price excludes import duties & shipping</p>
                </div>

                {/* Accident status */}
                <div className={`flex items-center gap-2.5 p-3 rounded-xl mb-5 ${car.has_accident ? 'bg-red-50' : 'bg-green-50'}`}>
                  {car.has_accident ? (
                    <>
                      <ShieldAlert className="w-5 h-5 text-red-500" />
                      <div>
                        <p className="text-sm font-semibold text-red-800">Accident Reported</p>
                        <p className="text-xs text-red-600">This vehicle has accident history</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="text-sm font-semibold text-green-800">No Accident History</p>
                        <p className="text-xs text-green-600">Clean vehicle record</p>
                      </div>
                    </>
                  )}
                </div>

                {/* CTA */}
                <a
                  href="mailto:info@nexoracars.com?subject=Inquiry about car"
                  className="btn-primary w-full justify-center text-base py-3 mb-3"
                >
                  Inquire about this car
                </a>

                <a
                  href="tel:+36000000000"
                  className="btn-outline w-full justify-center text-sm py-2.5"
                >
                  Call us
                </a>
              </div>

              {/* Quick stats */}
              <div className="bg-white rounded-2xl p-5 shadow-card">
                <h3 className="text-sm font-bold text-gray-900 mb-4">Quick Stats</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Year',         value: String(car.year) },
                    { label: 'Mileage',      value: car.mileage_label },
                    { label: 'Engine',       value: car.engine_label },
                    { label: 'Fuel',         value: FUEL_LABELS[car.fuel_type ?? 'other'] },
                    { label: 'Transmission', value: TRANSMISSION_LABELS[car.transmission ?? 'other'] },
                    { label: 'Simple Repair',value: car.has_simple_repair ? 'Yes' : 'None' },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between text-sm">
                      <span className="text-gray-500">{label}</span>
                      <span className="font-medium text-gray-900">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Source link */}
              {car.source_url && (
                <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
                  <p className="text-xs text-gray-500">Original listing</p>
                  <a
                    href={car.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-800 transition-colors"
                  >
                    Encar.com <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
