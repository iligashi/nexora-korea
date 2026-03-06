import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCar } from '@/lib/api';
import { FUEL_LABELS, TRANSMISSION_LABELS, FUEL_COLORS } from '@/lib/api';
import ImageGallery from '@/components/ImageGallery';
import PriceBadge from '@/components/PriceBadge';
import SpecGrid from '@/components/SpecGrid';
import DiagnosticAccordion from '@/components/DiagnosticAccordion';
import CarTabNav from '@/components/CarTabNav';
import FeaturesSection from '@/components/FeaturesSection';
import {
  ChevronLeft, ExternalLink, ShieldCheck, ShieldAlert,
  MessageCircle, Phone, FileText, ClipboardList,
  AlertTriangle, Calendar, Gauge, Fuel, Settings2, Zap,
  ArrowRight,
} from 'lucide-react';

interface PageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const { data: car } = await getCar(Number(params.id));
    return {
      title: `${car.year} ${car.brand} ${car.model}`,
      description: `Blini k\u00ebt\u00eb ${car.year} ${car.brand} ${car.model} — ${car.engine_label}, ${car.mileage_label}, ${car.fuel_type}. \u00c7mimi: \u20ac${car.price_eur?.toLocaleString() ?? 'N/A'}`,
      openGraph: {
        title:       `${car.year} ${car.brand} ${car.model} | Nexora Cars`,
        description: `${car.engine_label} \u2022 ${car.mileage_label} \u2022 \u20ac${car.price_eur?.toLocaleString()}`,
        images:      car.image_url ? [{ url: car.image_url }] : [],
      },
    };
  } catch {
    return { title: 'Detajet e Makines | Nexora Cars' };
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

  const id = Number(params.id);

  const allImages = [
    ...(car.image_url ? [car.image_url] : []),
    ...(car.thumbnail_urls ?? []).filter((u) => u !== car.image_url),
  ];

  const options: string[]    = car.internal_inspection?.options ?? [];
  const conditions: string[] = car.external_inspection?.conditions ?? [];

  return (
    <div className="bg-gray-50/50 min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="container-main py-3 flex items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="flex items-center gap-1 hover:text-brand-600 transition-colors">
            <ChevronLeft className="w-4 h-4" />
            T\u00eb Gjitha Makinat
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-400">{car.brand}</span>
          <span className="text-gray-300">/</span>
          <span className="text-gray-900 font-medium truncate">{car.year} {car.model}</span>
        </div>
      </div>

      {/* Tab navigation */}
      <CarTabNav carId={id} />

      <div className="container-main py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left column: images + details */}
          <div className="lg:col-span-2 space-y-6">

            {/* Gallery */}
            <div className="bg-white rounded-2xl p-5 shadow-card border border-gray-100">
              <ImageGallery images={allImages} alt={`${car.year} ${car.brand} ${car.model}`} />
            </div>

            {/* Vehicle Specifications */}
            <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-100">
              <h2 className="text-lg font-extrabold text-gray-900 mb-5">Specifikimet e Automjetit</h2>
              <SpecGrid car={car} />
            </div>

            {/* Features & Options */}
            {options.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-100">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-extrabold text-gray-900">Ve\u00e7orit\u00eb & Opsionet</h2>
                  <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
                    {options.length} opsione
                  </span>
                </div>
                <FeaturesSection options={options} />
              </div>
            )}

            {/* External conditions */}
            {conditions.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-100">
                <h2 className="text-lg font-extrabold text-gray-900 mb-4">Gjendja e Automjetit</h2>
                <div className="flex flex-wrap gap-2">
                  {conditions.map((c: string) => (
                    <span key={c} className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-100 text-xs font-medium px-3 py-1.5 rounded-lg">
                      <ShieldCheck className="w-3 h-3" />
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Diagnostics */}
            <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-100">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-extrabold text-gray-900">Raporti Diagnostikues</h2>
                <div className="flex items-center gap-3">
                  <Link
                    href={`/car/${id}/inspection`}
                    className="text-sm text-brand-600 hover:text-brand-800 font-semibold transition-colors flex items-center gap-1"
                  >
                    Inspektimi i Plot\u00eb <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
              <DiagnosticAccordion
                diagnosticData={car.diagnostic_data ?? null}
                inners={car.inners as Record<string, unknown> | null}
              />
            </div>
          </div>

          {/* Right column: price + CTA */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-5">

              {/* Price card */}
              <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-100">
                <p className="text-[10px] font-bold text-brand-600 uppercase tracking-widest mb-1">{car.brand}</p>
                <h1 className="text-2xl font-extrabold text-gray-900 leading-tight mb-1">
                  {car.year} {car.model}
                </h1>
                <p className="text-sm text-gray-400 mb-5">
                  {FUEL_LABELS[car.fuel_type ?? 'other']} \u00b7 {TRANSMISSION_LABELS[car.transmission ?? 'other']} \u00b7 {car.engine_label}
                </p>

                <div className="border-t border-gray-100 pt-5 mb-5">
                  <PriceBadge eur={car.price_eur} krw={car.price_krw} size="lg" showKrw />
                  <p className="text-[11px] text-gray-400 mt-1.5">\u00c7mimi nuk p\u00ebrfshin doganat & transportin</p>
                </div>

                {/* Accident status */}
                <div className={`flex items-center gap-3 p-3.5 rounded-xl mb-5 ${car.has_accident ? 'bg-red-50 border border-red-100' : 'bg-emerald-50 border border-emerald-100'}`}>
                  {car.has_accident ? (
                    <>
                      <div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <ShieldAlert className="w-4.5 h-4.5 text-red-500" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-red-800">Aksident i Raportuar</p>
                        <p className="text-[11px] text-red-600">Ky automjet ka histori aksidentesh</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-9 h-9 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <ShieldCheck className="w-4.5 h-4.5 text-emerald-500" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-emerald-800">Pa Histori Aksidentesh</p>
                        <p className="text-[11px] text-emerald-600">Regjistrim i past\u00ebr i automjetit</p>
                      </div>
                    </>
                  )}
                </div>

                {car.has_simple_repair && (
                  <div className="flex items-center gap-3 p-3.5 rounded-xl mb-5 bg-amber-50 border border-amber-100">
                    <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-4.5 h-4.5 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-amber-800">Riparim i Vog\u00ebl</p>
                      <p className="text-[11px] text-amber-600">Riparime t\u00eb vog\u00ebla t\u00eb regjistruara</p>
                    </div>
                  </div>
                )}

                <a
                  href="mailto:info@nexoracars.com?subject=P\u00ebr automjetin"
                  className="btn-primary w-full text-base py-3.5 mb-3"
                >
                  <MessageCircle className="w-4 h-4" />
                  Pyet p\u00ebr K\u00ebt\u00eb Makine
                </a>

                <a
                  href="tel:+36000000000"
                  className="btn-secondary w-full text-sm py-3"
                >
                  <Phone className="w-4 h-4" />
                  Na Telefononi
                </a>
              </div>

              {/* Quick stats */}
              <div className="bg-white rounded-2xl p-5 shadow-card border border-gray-100">
                <h3 className="text-sm font-bold text-gray-900 mb-4">Statistika t\u00eb Shpejta</h3>
                <div className="space-y-3">
                  {[
                    { icon: <Calendar className="w-3.5 h-3.5" />, label: 'Viti',          value: String(car.year) },
                    { icon: <Gauge className="w-3.5 h-3.5" />,    label: 'Kilometrazhi',  value: car.mileage_label },
                    { icon: <Zap className="w-3.5 h-3.5" />,      label: 'Motori',        value: car.engine_label },
                    { icon: <Fuel className="w-3.5 h-3.5" />,     label: 'Karburanti',    value: FUEL_LABELS[car.fuel_type ?? 'other'] },
                    { icon: <Settings2 className="w-3.5 h-3.5" />,label: 'Transmisioni',  value: TRANSMISSION_LABELS[car.transmission ?? 'other'] },
                  ].map(({ icon, label, value }) => (
                    <div key={label} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-gray-500">
                        <span className="text-gray-400">{icon}</span>
                        {label}
                      </span>
                      <span className="font-semibold text-gray-900">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Report links */}
              <div className="bg-white rounded-2xl p-5 shadow-card border border-gray-100">
                <h3 className="text-sm font-bold text-gray-900 mb-3">Raportet e Automjetit</h3>
                <div className="space-y-2">
                  <Link
                    href={`/car/${id}/report`}
                    className="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50 hover:bg-brand-50 border border-gray-100 hover:border-brand-200 transition-all text-sm group"
                  >
                    <span className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-3.5 h-3.5 text-red-600" />
                      </div>
                      <span className="font-medium text-gray-700">Raporti i D\u00ebmtimeve</span>
                    </span>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-brand-600 transition-colors" />
                  </Link>
                  <Link
                    href={`/car/${id}/inspection`}
                    className="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50 hover:bg-brand-50 border border-gray-100 hover:border-brand-200 transition-all text-sm group"
                  >
                    <span className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <ClipboardList className="w-3.5 h-3.5 text-blue-600" />
                      </div>
                      <span className="font-medium text-gray-700">Detajet e Inspektimit</span>
                    </span>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-brand-600 transition-colors" />
                  </Link>
                </div>
              </div>

              {/* Source link */}
              {car.source_url && (
                <a
                  href={car.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors group"
                >
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Listimi origjinal</p>
                    <p className="text-sm font-medium text-gray-700">Shiko n\u00eb Encar.com</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-brand-600 transition-colors" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
