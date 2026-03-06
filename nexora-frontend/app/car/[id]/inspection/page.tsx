import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronLeft, ClipboardList, CheckCircle2, AlertCircle,
  XCircle, Wrench, Info, ArrowRight, FileText, MinusCircle,
} from 'lucide-react';
import { getCar } from '@/lib/api';
import type { DiagnosticItem, InnerGroup } from '@/lib/types';
import CarTabNav from '@/components/CarTabNav';
import FeaturesSection from '@/components/FeaturesSection';
import {
  translateGroupTitle, translateItemTitle, translateStatus,
  translatePanelName, RESULT_CODES,
} from '@/lib/korean-map';

interface PageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const { data: car } = await getCar(Number(params.id));
    return { title: `Inspektimi \u2014 ${car.year} ${car.brand} ${car.model} | Nexora Cars` };
  } catch {
    return { title: 'Inspektimi | Nexora Cars' };
  }
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'ok' || status === 'none')
    return <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">OK</span>;
  if (status === 'warning')
    return <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700">Kujdes</span>;
  if (status === 'fail')
    return <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-red-100 text-red-700">Defekt</span>;
  return <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-500">N/A</span>;
}

function StatusIcon({ status }: { status: string }) {
  if (status === 'ok' || status === 'none')
    return <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />;
  if (status === 'warning')
    return <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />;
  if (status === 'fail')
    return <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />;
  return <MinusCircle className="w-4 h-4 text-gray-300 flex-shrink-0" />;
}

interface ParsedPanel {
  label: string;
  status: string;
  statusLabel: string;
}

interface ParsedGroup {
  title: string;
  items: { label: string; status: string; statusLabel: string }[];
}

function parseDiagnosticPanels(items: DiagnosticItem[]): { panels: ParsedPanel[]; comments: { name: string; text: string }[] } {
  const panels: ParsedPanel[] = [];
  const comments: { name: string; text: string }[] = [];

  for (const item of items) {
    if (item.name?.includes('COMMENT') || (!item.resultCode && !item.status)) {
      if (item.result) comments.push({ name: translatePanelName(item.name), text: item.result });
      continue;
    }
    if (item.resultCode) {
      const rc = RESULT_CODES[item.resultCode];
      panels.push({ label: translatePanelName(item.name), status: rc?.status ?? 'ok', statusLabel: rc?.label ?? item.resultCode });
    } else if (item.status) {
      const s = item.status.toLowerCase();
      let status = 'ok';
      if (['warning', '\uc8fc\uc758'].includes(s)) status = 'warning';
      else if (['fail', 'error', '\ubd88\ub7c9'].includes(s)) status = 'fail';
      panels.push({ label: item.name, status, statusLabel: item.status });
    }
  }
  return { panels, comments };
}

function parseInnerGroups(inners: unknown): ParsedGroup[] {
  if (!inners || !Array.isArray(inners)) return [];
  const groups: ParsedGroup[] = [];

  for (const group of inners as InnerGroup[]) {
    if (!group.type || !group.children) continue;
    const title = translateGroupTitle(group.type.title);
    const items: ParsedGroup['items'] = [];

    for (const child of group.children) {
      if (!child.type) continue;
      const label = translateItemTitle(child.type.title);
      let status = 'none';
      let statusLabel = '\u2014';
      if (child.statusType) {
        const st = translateStatus(child.statusType.title);
        status = st.status;
        statusLabel = st.label;
      }
      items.push({ label, status, statusLabel });
    }
    if (items.length > 0) groups.push({ title, items });
  }
  return groups;
}

export default async function InspectionPage({ params }: PageProps) {
  let car;
  try {
    const res = await getCar(Number(params.id));
    car = res.data;
  } catch {
    notFound();
  }

  const id = Number(params.id);
  const diagnosticData: DiagnosticItem[] = car.diagnostic_data ?? [];
  const options: string[] = car.internal_inspection?.options ?? [];

  const { panels, comments } = parseDiagnosticPanels(diagnosticData);
  const groups = parseInnerGroups(car.inners);

  const allItems = [
    ...panels.map(p => p.status),
    ...groups.flatMap(g => g.items.map(i => i.status)),
  ];
  const total     = allItems.length;
  const okCount   = allItems.filter(s => s === 'ok' || s === 'none').length;
  const warnCount = allItems.filter(s => s === 'warning').length;
  const failCount = allItems.filter(s => s === 'fail').length;
  const passRate  = total > 0 ? Math.round((okCount / total) * 100) : 0;

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
          <span className="text-gray-400">Inspektimi</span>
        </div>
      </div>

      {/* Tab navigation */}
      <CarTabNav carId={id} />

      <div className="container-main py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-brand-600 uppercase tracking-widest">{car.brand}</p>
              <h1 className="text-xl font-extrabold text-gray-900">{car.year} {car.model} \u2014 Inspektimi i Performanc\u00ebs</h1>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">

            {/* Body Panel Inspection */}
            {panels.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-100">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-extrabold text-gray-900">Inspektimi i Paneleve t\u00eb Karoceris\u00eb</h2>
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                    {panels.filter(p => p.status === 'ok').length}/{panels.length} normale
                  </span>
                </div>
                <div className="border border-gray-100 rounded-xl overflow-hidden">
                  {panels.map((panel, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <StatusIcon status={panel.status} />
                        <span className="text-sm text-gray-700">{panel.label}</span>
                      </div>
                      <StatusBadge status={panel.status} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Performance Inspection (from inners) */}
            {groups.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-100">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-extrabold text-gray-900">Inspektimi i Performanc\u00ebs</h2>
                  {total > 0 && (
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${passRate >= 90 ? 'bg-emerald-50 text-emerald-600' : passRate >= 70 ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'}`}>
                      {passRate}% kalim
                    </span>
                  )}
                </div>
                <div className="space-y-4">
                  {groups.map((group) => {
                    const gOk = group.items.filter(i => i.status === 'ok' || i.status === 'none').length;
                    return (
                      <div key={group.title}>
                        <div className="flex items-center justify-between mb-2 px-1">
                          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide">{group.title}</h3>
                          <span className="text-[10px] text-gray-400">{gOk}/{group.items.length} kaluar</span>
                        </div>
                        <div className="border border-gray-100 rounded-xl overflow-hidden">
                          {group.items.map((item, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
                            >
                              <div className="flex items-center gap-2.5">
                                <StatusIcon status={item.status} />
                                <span className="text-sm text-gray-700">{item.label}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400">{item.statusLabel}</span>
                                <StatusBadge status={item.status} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Inspector Comments */}
            {comments.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-100">
                <h2 className="text-lg font-extrabold text-gray-900 mb-4">Sh\u00ebnimet e Inspektorit</h2>
                <div className="space-y-3">
                  {comments.map((c, i) => (
                    <div key={i} className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                      <p className="text-xs font-semibold text-blue-600 mb-1">{c.name}</p>
                      <p className="text-sm text-blue-800 leading-relaxed">{c.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No data fallback */}
            {panels.length === 0 && groups.length === 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-100">
                <div className="flex items-center gap-3 p-5 bg-gray-50 rounded-xl border border-gray-200 text-sm text-gray-500">
                  <Wrench className="w-5 h-5 text-gray-400" />
                  Nuk ka raport inspektimi t\u00eb disponuesh\u00ebm p\u00ebr k\u00ebt\u00eb automjet.
                </div>
              </div>
            )}

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
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Inspection summary */}
            {total > 0 && (
              <div className="bg-white rounded-2xl p-5 shadow-card border border-gray-100">
                <h3 className="text-sm font-bold text-gray-900 mb-4">P\u00ebrmbledhja e Inspektimit</h3>

                {/* Circular progress */}
                <div className="flex items-center justify-center mb-5">
                  <div className="relative w-28 h-28">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="42" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                      <circle
                        cx="50" cy="50" r="42" fill="none"
                        stroke={passRate >= 90 ? '#10b981' : passRate >= 70 ? '#f59e0b' : '#ef4444'}
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={`${passRate * 2.64} ${264 - passRate * 2.64}`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className={`text-2xl font-extrabold ${passRate >= 90 ? 'text-emerald-600' : passRate >= 70 ? 'text-amber-600' : 'text-red-600'}`}>
                        {passRate}%
                      </span>
                      <span className="text-[10px] text-gray-400 uppercase tracking-wide">Kalim</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <div className="flex justify-between items-center text-sm">
                    <span className="flex items-center gap-2 text-gray-500">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      Kaluar
                    </span>
                    <span className="font-bold text-emerald-600">{okCount}</span>
                  </div>
                  {warnCount > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="flex items-center gap-2 text-gray-500">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                        Paralajm\u00ebrime
                      </span>
                      <span className="font-bold text-amber-600">{warnCount}</span>
                    </div>
                  )}
                  {failCount > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="flex items-center gap-2 text-gray-500">
                        <XCircle className="w-3.5 h-3.5 text-red-500" />
                        T\u00eb D\u00ebshtuara
                      </span>
                      <span className="font-bold text-red-600">{failCount}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-sm pt-2 border-t border-gray-100">
                    <span className="text-gray-500">Gjithsej Pikat</span>
                    <span className="font-bold text-gray-900">{total}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Features count */}
            {options.length > 0 && (
              <div className="bg-white rounded-2xl p-5 shadow-card border border-gray-100">
                <h3 className="text-sm font-bold text-gray-900 mb-2">Ve\u00e7orit\u00eb</h3>
                <p className="text-3xl font-extrabold text-brand-600">{options.length}</p>
                <p className="text-xs text-gray-500 mt-1">opsione & ve\u00e7ori t\u00eb listuara</p>
              </div>
            )}

            {/* Disclaimer */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
              <div className="flex items-start gap-2.5 mb-2">
                <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs font-bold text-amber-800">Sh\u00ebnim</p>
              </div>
              <p className="text-xs text-amber-700 leading-relaxed">
                T\u00eb gjitha t\u00eb dh\u00ebnat e inspektimit jan\u00eb marr\u00eb nga Encar.com dhe jan\u00eb kryer nga pal\u00ebt koreane
                para shitjes. K\u00ebto t\u00eb dh\u00ebna sh\u00ebrben vet\u00ebm p\u00ebr q\u00ebllime informative.
              </p>
            </div>

            <Link href={`/car/${id}`} className="btn-outline w-full">
              <ChevronLeft className="w-4 h-4" />
              Kthehu te Detajet
            </Link>

            <Link href={`/car/${id}/report`} className="btn-primary w-full">
              <FileText className="w-4 h-4" />
              Shiko Raportin e D\u00ebmtimeve
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
