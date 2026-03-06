'use client';

import { useState } from 'react';
import { ChevronDown, CheckCircle2, AlertCircle, XCircle, Wrench } from 'lucide-react';
import type { DiagnosticItem } from '@/lib/types';
import clsx from 'clsx';

interface Props {
  diagnosticData: DiagnosticItem[] | null;
  inners: Record<string, unknown> | null;
}

function StatusIcon({ status }: { status: string }) {
  const s = status?.toLowerCase();
  if (s === 'ok' || s === 'normal' || s === '양호')
    return <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />;
  if (s === 'warning' || s === '주의')
    return <AlertCircle className="w-4 h-4 text-yellow-500 flex-shrink-0" />;
  if (s === 'fail' || s === 'error' || s === '불량')
    return <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />;
  return <CheckCircle2 className="w-4 h-4 text-gray-400 flex-shrink-0" />;
}

function AccordionSection({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <span className="text-sm font-semibold text-gray-900">{title}</span>
        <ChevronDown className={clsx('w-4 h-4 text-gray-500 transition-transform duration-200', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="px-5 py-4 bg-white animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
}

export default function DiagnosticAccordion({ diagnosticData, inners }: Props) {
  const hasData = (diagnosticData && diagnosticData.length > 0) || inners;

  if (!hasData) {
    return (
      <div className="flex items-center gap-3 p-5 bg-gray-50 rounded-xl border border-gray-200 text-sm text-gray-500">
        <Wrench className="w-5 h-5 text-gray-400" />
        No diagnostic report available for this vehicle.
      </div>
    );
  }

  // Group diagnostic items by category
  const grouped: Record<string, DiagnosticItem[]> = {};
  if (diagnosticData) {
    for (const item of diagnosticData) {
      const cat = item.category ?? 'General';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(item);
    }
  }

  return (
    <div className="space-y-3">
      {/* Diagnostic groups */}
      {Object.entries(grouped).map(([category, items]) => (
        <AccordionSection key={category} title={category}>
          <div className="space-y-2">
            {items.map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-2.5">
                  <StatusIcon status={item.status} />
                  <span className="text-sm text-gray-700">{item.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {item.value && (
                    <span className="text-xs text-gray-500">{item.value}</span>
                  )}
                  <span className={clsx(
                    'text-xs font-semibold px-2 py-0.5 rounded-full',
                    item.status?.toLowerCase() === 'ok' || item.status === '양호'
                      ? 'bg-green-100 text-green-700'
                      : item.status?.toLowerCase() === 'warning' || item.status === '주의'
                      ? 'bg-yellow-100 text-yellow-700'
                      : item.status?.toLowerCase() === 'fail' || item.status === '불량'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-gray-100 text-gray-600'
                  )}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </AccordionSection>
      ))}

      {/* Inner inspection */}
      {inners && (
        <AccordionSection title="Inner Inspection">
          <pre className="text-xs text-gray-600 overflow-x-auto bg-gray-50 p-4 rounded-lg">
            {JSON.stringify(inners, null, 2)}
          </pre>
        </AccordionSection>
      )}
    </div>
  );
}
