import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, ShieldCheck, ShieldAlert, AlertTriangle, Info, FileText, ArrowRight } from 'lucide-react';
import { getCar } from '@/lib/api';
import CarTabNav from '@/components/CarTabNav';
import CarBodyDiagram from '@/components/CarBodyDiagram';

interface PageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const { data: car } = await getCar(Number(params.id));
    return { title: `Raporti i D\u00ebmtimeve \u2014 ${car.year} ${car.brand} ${car.model} | Nexora Cars` };
  } catch {
    return { title: 'Raporti i D\u00ebmtimeve | Nexora Cars' };
  }
}

export default async function ReportPage({ params }: PageProps) {
  let car;
  try {
    const res = await getCar(Number(params.id));
    car = res.data;
  } catch {
    notFound();
  }

  const id = Number(params.id);

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
          <Link href={`/car/${id}`} className="hover:text-brand-600 transition-colors">{car.brand}</Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-900 font-medium">{car.year} {car.model}</span>
          <span className="text-gray-300">/</span>
          <span className="text-gray-400">Raporti i D\u00ebmtimeve</span>
        </div>
      </div>

      {/* Tab navigation */}
      <CarTabNav carId={id} />

      <div className="container-main py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-brand-600 uppercase tracking-widest">{car.brand}</p>
              <h1 className="text-xl font-extrabold text-gray-900">{car.year} {car.model} \u2014 Raporti i D\u00ebmtimeve</h1>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">

            {/* Accident status */}
            <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-100">
              <h2 className="text-lg font-extrabold text-gray-900 mb-4">Historiku i Aksidenteve</h2>
              <div className={`flex items-start gap-4 p-5 rounded-xl ${car.has_accident ? 'bg-red-50 border border-red-100' : 'bg-emerald-50 border border-emerald-100'}`}>
                {car.has_accident ? (
                  <>
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <ShieldAlert className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                      <p className="font-bold text-red-800 text-base">Aksident i Raportuar</p>
                      <p className="text-sm text-red-600 mt-1 leading-relaxed">
                        Ky automjet ka histori aksidentesh t\u00eb raportuar. Nj\u00eb aksident p\u00ebrcaktohet si
                        riparime q\u00eb p\u00ebrfshijn\u00eb saldim ose nd\u00ebrrim t\u00eb komponent\u00ebve kryesore strukturore.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <ShieldCheck className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div>
                      <p className="font-bold text-emerald-800 text-base">Pa Histori Aksidentesh</p>
                      <p className="text-sm text-emerald-600 mt-1 leading-relaxed">
                        Asnj\u00eb raport aksidenti nuk \u00ebsht\u00eb regjistruar p\u00ebr k\u00ebt\u00eb automjet. Sh\u00ebnim: riparimet e vog\u00ebla t\u00eb paneleve
                        t\u00eb jashtme (kapaku, krah\u00ebsorjet, dyert, parakolp\u00ebt) nuk klasifikohen si aksidente.
                      </p>
                    </div>
                  </>
                )}
              </div>

              {car.has_simple_repair && (
                <div className="flex items-start gap-4 p-5 rounded-xl bg-amber-50 border border-amber-100 mt-3">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-6 h-6 text-amber-500" />
                  </div>
                  <div>
                    <p className="font-bold text-amber-800">Riparim i Vog\u00ebl i Regjistruar</p>
                    <p className="text-sm text-amber-700 mt-1 leading-relaxed">
                      Ky automjet ka nj\u00eb regjistrim t\u00eb riparimeve t\u00eb vog\u00ebla (lyerje, riparime t\u00eb vog\u00ebla panelesh etj.)
                      q\u00eb nuk kualifikohen si aksident i plot\u00eb.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Body panel diagram */}
            <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-100">
              <h2 className="text-lg font-extrabold text-gray-900 mb-5">Gjendja e Paneleve t\u00eb Karoceris\u00eb</h2>

              {(car.inners || (car.diagnostic_data && car.diagnostic_data.length > 0)) ? (
                <CarBodyDiagram inners={car.inners} diagnosticData={car.diagnostic_data} />
              ) : (
                <div className="flex items-center gap-3 p-5 bg-gray-50 rounded-xl border border-gray-200 text-sm text-gray-500">
                  <ShieldCheck className="w-5 h-5 text-gray-400" />
                  Nuk ka raport inspektimi t\u00eb paneleve p\u00ebr k\u00ebt\u00eb automjet.
                </div>
              )}
            </div>

            {/* External conditions */}
            {car.external_inspection?.conditions && car.external_inspection.conditions.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-100">
                <h2 className="text-lg font-extrabold text-gray-900 mb-4">Gjendja e Automjetit</h2>
                <div className="flex flex-wrap gap-2">
                  {car.external_inspection.conditions.map((c: string) => (
                    <span key={c} className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-100 text-xs font-medium px-3 py-1.5 rounded-lg">
                      <ShieldCheck className="w-3 h-3" />
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Report summary */}
            <div className="bg-white rounded-2xl p-5 shadow-card border border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 mb-4">P\u00ebrmbledhja e Raportit</h3>
              <div className="space-y-3">
                {[
                  {
                    label: 'Historiku i Aksidenteve',
                    value: car.has_accident ? 'Po' : 'Asnj\u00eb',
                    ok: !car.has_accident,
                  },
                  {
                    label: 'Riparime t\u00eb Vog\u00ebla',
                    value: car.has_simple_repair ? 'T\u00eb regjistruara' : 'Asnj\u00eb',
                    ok: !car.has_simple_repair,
                  },
                  {
                    label: 'Raporti i Paneleve',
                    value: car.inners ? 'I disponuesh\u00ebm' : 'Nuk \u00ebsht\u00eb i disponuesh\u00ebm',
                    ok: !!car.inners,
                  },
                ].map(({ label, value, ok }) => (
                  <div key={label} className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">{label}</span>
                    <span className={`font-semibold flex items-center gap-1.5 ${ok ? 'text-emerald-600' : 'text-red-600'}`}>
                      {ok ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Disclaimer */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
              <div className="flex items-start gap-2.5 mb-2">
                <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs font-bold text-amber-800">Sh\u00ebnim</p>
              </div>
              <p className="text-xs text-amber-700 leading-relaxed">
                Ky raport \u00ebsht\u00eb marr\u00eb nga Encar.com dhe \u00ebsht\u00eb kryer nga pal\u00ebt koreane para shitjes.
                Nexora Cars nuk merr p\u00ebrgjegj\u00ebsi p\u00ebr sakt\u00ebsin\u00eb ose plot\u00ebsin\u00eb e k\u00ebtij raporti.
                T\u00eb gjitha t\u00eb dh\u00ebnat sh\u00ebrbejn\u00eb vet\u00ebm p\u00ebr q\u00ebllime informative.
              </p>
            </div>

            <Link href={`/car/${id}`} className="btn-outline w-full">
              <ChevronLeft className="w-4 h-4" />
              Kthehu te Detajet
            </Link>

            <Link
              href={`/car/${id}/inspection`}
              className="btn-primary w-full"
            >
              Shiko Inspektimin
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
