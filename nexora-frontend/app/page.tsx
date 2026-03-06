import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getCars, getBrands } from '@/lib/api';
import type { CarFilters } from '@/lib/types';
import CarCard from '@/components/CarCard';
import FilterBar from '@/components/FilterBar';
import Pagination from '@/components/Pagination';
import {
  Car, TrendingUp, Shield, Globe, CheckCircle2,
  Search, ArrowRight, Sparkles, ShieldCheck, FileText,
  BadgeEuro, Truck, Phone,
} from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Shfleto Makina Koreane — Nexora Cars & More',
  description:
    'Gjeni makina të certifikuara koreane — Hyundai, Kia, Genesis, Chevrolet e më shumë. Raporte inspektimi, histori aksidentesh, çmime në EUR.',
};

interface PageProps {
  searchParams: Record<string, string | string[] | undefined>;
}

function getString(val: string | string[] | undefined): string | undefined {
  return Array.isArray(val) ? val[0] : val;
}

export default async function HomePage({ searchParams }: PageProps) {
  const filters: CarFilters = {
    brand:        getString(searchParams.brand),
    fuel:         getString(searchParams.fuel) as CarFilters['fuel'],
    transmission: getString(searchParams.transmission) as CarFilters['transmission'],
    year_min:     getString(searchParams.year_min) ? Number(searchParams.year_min) : undefined,
    year_max:     getString(searchParams.year_max) ? Number(searchParams.year_max) : undefined,
    price_min:    getString(searchParams.price_min) ? Number(searchParams.price_min) : undefined,
    price_max:    getString(searchParams.price_max) ? Number(searchParams.price_max) : undefined,
    mileage_max:  getString(searchParams.mileage_max) ? Number(searchParams.mileage_max) : undefined,
    no_accident:  getString(searchParams.no_accident) === '1',
    search:       getString(searchParams.search),
    sort:         getString(searchParams.sort) as CarFilters['sort'],
    page:         getString(searchParams.page) ? Number(searchParams.page) : 1,
    per_page:     12,
  };

  const [carsRes, brandsRes] = await Promise.all([
    getCars(filters),
    getBrands(),
  ]);

  const { data: cars, pagination, filters: filterOptions } = carsRes;
  const hasActiveFilters = Object.entries(searchParams).some(([k, v]) => k !== 'page' && v);

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-950 via-brand-950 to-gray-900">
        <div className="absolute inset-0 bg-hero-pattern opacity-40" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

        <div className="relative container-main pt-16 pb-20 lg:pt-24 lg:pb-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-500/10 border border-brand-400/20 rounded-full mb-6">
              <Sparkles className="w-3.5 h-3.5 text-brand-400" />
              <span className="text-xs font-semibold text-brand-300 uppercase tracking-wider">Direkt nga Koreja e Jugut</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] text-white mb-6">
              Makina Premium Koreane,{' '}
              <span className="text-gradient">Të Dërguara në Evropë</span>
            </h1>

            <p className="text-lg text-gray-400 leading-relaxed mb-10 max-w-xl">
              Shfletoni qindra automjete të verifikuara nga Encar — platforma #1 e makinave në Kore.
              Çdo listim përfshin të dhëna inspektimi, histori aksidentesh dhe çmime transparente në EUR.
            </p>

            {/* Brand pills */}
            <div className="flex flex-wrap gap-2 mb-12">
              {brandsRes.data.slice(0, 6).map((b) => (
                <a
                  key={b.id}
                  href={`/?brand=${encodeURIComponent(b.name)}`}
                  className="group px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white text-sm font-medium rounded-xl border border-white/10 hover:border-white/20 transition-all flex items-center gap-2"
                >
                  {b.name}
                  {b.cars_count > 0 && (
                    <span className="text-white/40 text-xs font-normal">({b.cars_count})</span>
                  )}
                </a>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {[
              { icon: <Car className="w-5 h-5" />,        label: 'Automjete në Dispozicion', value: '500+',  color: 'text-brand-400' },
              { icon: <Shield className="w-5 h-5" />,     label: 'Inspektime të Plota',      value: '100%',  color: 'text-emerald-400' },
              { icon: <Globe className="w-5 h-5" />,      label: 'Vende të Dërguara',        value: '15+',   color: 'text-sky-400' },
              { icon: <TrendingUp className="w-5 h-5" />, label: 'Klientë të Kënaqur',       value: '200+',  color: 'text-amber-400' },
            ].map(({ icon, label, value, color }) => (
              <div key={label} className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/5">
                <div className={color}>{icon}</div>
                <div>
                  <p className="text-xl font-extrabold text-white">{value}</p>
                  <p className="text-xs text-gray-500">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FILTERS */}
      <Suspense fallback={<div className="h-16 bg-white border-b border-gray-100" />}>
        <FilterBar filters={filterOptions} totalCars={pagination.total} />
      </Suspense>

      {/* RESULTS */}
      <section className="container-main py-8">
        {cars.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Nuk u gjetën makina</h2>
            <p className="text-gray-500 text-sm mb-8 max-w-sm mx-auto">
              Nuk gjetëm asnjë automjet që përputhet me kriteret tuaja. Provoni të ndryshoni filtrat.
            </p>
            <a href="/" className="btn-primary">
              Pastro të gjitha filtrat
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-gray-500">
                Duke shfaqur{' '}
                <span className="font-semibold text-gray-900">{pagination.from ?? 0}–{pagination.to ?? 0}</span>{' '}
                nga{' '}
                <span className="font-semibold text-gray-900">{pagination.total.toLocaleString()}</span>{' '}
                automjete
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {cars.map((car) => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>

            <Suspense>
              <Pagination meta={pagination} />
            </Suspense>
          </>
        )}
      </section>

      {/* WHY NEXORA */}
      <section className="bg-gray-50 border-t border-gray-100 py-20">
        <div className="container-main">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Pse të Zgjidhni Nexora?</h2>
            <p className="text-gray-500 max-w-lg mx-auto">
              E bëjmë importimin e makinave koreane të thjeshtë, transparent dhe të besueshëm.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <ShieldCheck className="w-6 h-6" />,
                title: 'Të Dhëna Zyrtare nga Encar',
                desc: 'Të gjitha listimet janë të marra direkt nga platforma #1 e makinave të përdorura në Kore me të dhëna të verifikuara.',
                color: 'bg-brand-50 text-brand-600',
              },
              {
                icon: <FileText className="w-6 h-6" />,
                title: 'Raporte Inspektimi të Plota',
                desc: 'Çdo automjet përfshin të dhëna inspektimi — histori aksidentesh, kontrolle mekanike, gjendje karocerie.',
                color: 'bg-emerald-50 text-emerald-600',
              },
              {
                icon: <BadgeEuro className="w-6 h-6" />,
                title: 'Çmime në EUR',
                desc: 'Konvertim i drejtpërdrejtë nga KRW në EUR që të dini gjithmonë koston reale para doganës.',
                color: 'bg-amber-50 text-amber-600',
              },
              {
                icon: <Truck className="w-6 h-6" />,
                title: 'Dërgim Derë më Derë',
                desc: 'Transport komplet dhe zhdoganim nga Koreja deri te dera juaj.',
                color: 'bg-sky-50 text-sky-600',
              },
            ].map(({ icon, title, desc, color }) => (
              <div key={title} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-card-hover transition-all duration-300 group">
                <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  {icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 bg-white">
        <div className="container-main">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Si Funksionon</h2>
            <p className="text-gray-500 max-w-lg mx-auto">
              Nga shfletimi deri te ngasja — rrugëtimi juaj në 4 hapa të thjeshtë.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: '01', icon: <Search className="w-5 h-5" />, title: 'Shfleto & Kërko', desc: 'Eksploroni inventarin tonë me filtra të avancuara — marka, çmim, lloj karburanti e më shumë.' },
              { step: '02', icon: <FileText className="w-5 h-5" />, title: 'Shiko Raportet', desc: 'Kontrolloni të dhënat e inspektimit, historinë e aksidenteve, gjendjen e karocerisë dhe opsionet.' },
              { step: '03', icon: <CheckCircle2 className="w-5 h-5" />, title: 'Bëni Porosinë', desc: 'Na kontaktoni për të rezervuar automjetin tuaj. Ne trajtojmë pagesën dhe dokumentacionin.' },
              { step: '04', icon: <Truck className="w-5 h-5" />, title: 'Dërgimi', desc: 'Makina juaj dërgohet nga Koreja në lokacionin tuaj me mbështetje të plotë doganore.' },
            ].map(({ step, icon, title, desc }) => (
              <div key={step} className="relative text-center">
                <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-4 relative">
                  <span className="text-brand-600">{icon}</span>
                  <span className="absolute -top-2 -right-2 w-6 h-6 bg-brand-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{step}</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-brand-600 to-brand-700 py-16">
        <div className="container-main text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-4">
            Gati të Gjeni Makinën Tuaj Ideale?
          </h2>
          <p className="text-brand-200 mb-8 max-w-md mx-auto">
            Shfletoni inventarin tonë të plotë me makina koreane të certifikuara, çmime transparente dhe raporte të detajuara.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/" className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-brand-700 font-semibold rounded-xl hover:bg-brand-50 transition-all shadow-lg">
              Shfleto Të Gjitha Makinat
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="tel:+36000000000" className="inline-flex items-center gap-2 px-8 py-3.5 bg-white/10 text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all">
              <Phone className="w-4 h-4" />
              Na Telefononi
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
