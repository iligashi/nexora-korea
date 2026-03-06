import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getCars, getBrands } from '@/lib/api';
import type { CarFilters } from '@/lib/types';
import CarCard from '@/components/CarCard';
import FilterBar from '@/components/FilterBar';
import Pagination from '@/components/Pagination';
import { Car, TrendingUp, Shield, Globe } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Browse Korean Used Cars — Nexora Cars & More',
  description:
    'Find certified pre-owned Korean vehicles — Hyundai, Kia, Genesis, Chevrolet and more. Full inspection reports, accident history, EUR prices.',
};

interface PageProps {
  searchParams: Record<string, string | string[] | undefined>;
}

function getString(val: string | string[] | undefined): string | undefined {
  return Array.isArray(val) ? val[0] : val;
}

const stats = [
  { icon: <Car className="w-6 h-6" />,       label: 'Vehicles Available', value: '500+' },
  { icon: <Shield className="w-6 h-6" />,    label: 'Inspection Reports', value: '100%' },
  { icon: <Globe className="w-6 h-6" />,     label: 'Countries Shipped',  value: '15+' },
  { icon: <TrendingUp className="w-6 h-6" />,label: 'Satisfied Clients',  value: '200+' },
];

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

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-950 via-brand-900 to-gray-900 text-white">
        <div className="container-main py-16 lg:py-20">
          <div className="max-w-2xl">
            <span className="inline-block px-3 py-1 bg-brand-600/30 text-brand-300 text-xs font-bold uppercase tracking-widest rounded-full border border-brand-500/30 mb-4">
              Direct from South Korea
            </span>
            <h1 className="text-4xl lg:text-5xl font-black leading-tight mb-4">
              Certified Korean<br />
              <span className="text-brand-400">Used Cars</span> for Europe
            </h1>
            <p className="text-gray-300 text-lg leading-relaxed mb-8">
              Browse hundreds of verified vehicles from Encar — Korea's largest automotive marketplace.
              Every listing includes full inspection data, accident history, and real-time pricing in EUR & KRW.
            </p>

            {/* Quick brand links */}
            <div className="flex flex-wrap gap-2">
              {brandsRes.data.slice(0, 6).map((b) => (
                <a
                  key={b.id}
                  href={`/?brand=${encodeURIComponent(b.name)}`}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-full border border-white/10 transition-colors"
                >
                  {b.name}
                  {b.cars_count > 0 && (
                    <span className="ml-1.5 text-white/60 text-xs">({b.cars_count})</span>
                  )}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="border-t border-white/10">
          <div className="container-main py-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map(({ icon, label, value }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="text-brand-400">{icon}</div>
                  <div>
                    <p className="text-xl font-black text-white">{value}</p>
                    <p className="text-xs text-gray-400">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <Suspense fallback={<div className="h-16 bg-white border-b border-gray-100" />}>
        <FilterBar filters={filterOptions} totalCars={pagination.total} />
      </Suspense>

      {/* Results */}
      <section className="container-main py-8">
        {cars.length === 0 ? (
          <div className="text-center py-20">
            <Car className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-700 mb-2">No cars found</h2>
            <p className="text-gray-500 text-sm mb-6">Try adjusting your filters or clearing the search.</p>
            <a href="/" className="btn-primary">Clear all filters</a>
          </div>
        ) : (
          <>
            {/* Result info */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-gray-600">
                Showing <span className="font-semibold text-gray-900">{pagination.from ?? 0}–{pagination.to ?? 0}</span> of{' '}
                <span className="font-semibold text-gray-900">{pagination.total.toLocaleString()}</span> vehicles
              </p>
            </div>

            {/* Car grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {cars.map((car) => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>

            {/* Pagination */}
            <Suspense>
              <Pagination meta={pagination} />
            </Suspense>
          </>
        )}
      </section>

      {/* Trust section */}
      <section className="bg-surface-muted border-t border-gray-100 py-16">
        <div className="container-main">
          <h2 className="text-2xl font-black text-gray-900 text-center mb-10">Why Nexora?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Official Encar Data',
                desc: "All listings are sourced directly from South Korea's #1 used car platform.",
                icon: '🇰🇷',
              },
              {
                title: 'Full Inspection Reports',
                desc: 'Every vehicle comes with Encar certified inspection data — accident history, mechanical checks, inner condition.',
                icon: '📋',
              },
              {
                title: 'EUR Pricing Included',
                desc: 'Live KRW → EUR conversion so you always know the real cost before import duties.',
                icon: '💶',
              },
            ].map(({ title, desc, icon }) => (
              <div key={title} className="bg-white rounded-2xl p-6 shadow-card text-center">
                <div className="text-4xl mb-4">{icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
