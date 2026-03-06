'use client';

import { useState } from 'react';
import { ChevronDown, CheckCircle2, AlertCircle, XCircle, Wrench, MinusCircle } from 'lucide-react';
import type { DiagnosticItem, InnerGroup } from '@/lib/types';
import {
  translateGroupTitle, translateItemTitle, translateStatus,
  translatePanelName, RESULT_CODES,
} from '@/lib/korean-map';
import clsx from 'clsx';

interface Props {
  diagnosticData: DiagnosticItem[] | null;
  inners: unknown;
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

function statusBadgeClass(status: string): string {
  if (status === 'ok' || status === 'none') return 'bg-emerald-100 text-emerald-700';
  if (status === 'warning') return 'bg-amber-100 text-amber-700';
  if (status === 'fail') return 'bg-red-100 text-red-700';
  return 'bg-gray-100 text-gray-500';
}

function AccordionSection({ title, count, defaultOpen, children }: {
  title: string; count?: string; defaultOpen?: boolean; children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen ?? false);

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3.5 text-left bg-gray-50/80 hover:bg-gray-100/80 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-900">{title}</span>
          {count && <span className="text-[10px] text-gray-400 font-medium">{count}</span>}
        </div>
        <ChevronDown className={clsx('w-4 h-4 text-gray-400 transition-transform duration-200', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="bg-white animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
}

// Parse diagnostic data: handles both formats
function parseDiagnostics(items: DiagnosticItem[]): {
  panels: { name: string; label: string; status: string; statusLabel: string }[];
  comments: { name: string; text: string }[];
} {
  const panels: { name: string; label: string; status: string; statusLabel: string }[] = [];
  const comments: { name: string; text: string }[] = [];

  for (const item of items) {
    // Check if it's a comment entry
    if (item.name?.includes('COMMENT') || item.resultCode === null || item.resultCode === undefined) {
      if (item.result) {
        comments.push({ name: translatePanelName(item.name), text: item.result });
      }
      continue;
    }

    // Real API format: { name: 'FRONT_DOOR_LEFT', resultCode: 'NORMAL' }
    if (item.resultCode) {
      const rc = RESULT_CODES[item.resultCode];
      panels.push({
        name: item.name,
        label: translatePanelName(item.name),
        status: rc?.status ?? 'ok',
        statusLabel: rc?.label ?? item.resultCode,
      });
      continue;
    }

    // Legacy format: { name, status, category }
    if (item.status) {
      const s = item.status.toLowerCase();
      let status: string = 'ok';
      if (['warning', '주의'].includes(s)) status = 'warning';
      else if (['fail', 'error', '불량'].includes(s)) status = 'fail';
      panels.push({
        name: item.name,
        label: item.name,
        status,
        statusLabel: item.status,
      });
    }
  }

  return { panels, comments };
}

// Parse inners (Encar performance inspection nested format)
function parseInners(inners: unknown): {
  groups: { title: string; items: { label: string; status: string; statusLabel: string }[] }[];
} {
  const groups: { title: string; items: { label: string; status: string; statusLabel: string }[] }[] = [];

  if (!inners || !Array.isArray(inners)) return { groups };

  for (const group of inners as InnerGroup[]) {
    if (!group.type || !group.children) continue;

    const title = translateGroupTitle(group.type.title);
    const items: { label: string; status: string; statusLabel: string }[] = [];

    for (const child of group.children) {
      if (!child.type) continue;

      const label = translateItemTitle(child.type.title);
      let status = 'none';
      let statusLabel = '—';

      if (child.statusType) {
        const st = translateStatus(child.statusType.title);
        status = st.status;
        statusLabel = st.label;
      }

      items.push({ label, status, statusLabel });
    }

    if (items.length > 0) {
      groups.push({ title, items });
    }
  }

  return { groups };
}

export default function DiagnosticAccordion({ diagnosticData, inners }: Props) {
  const hasDiag = diagnosticData && diagnosticData.length > 0;
  const hasInners = inners && (Array.isArray(inners) ? inners.length > 0 : Object.keys(inners).length > 0);

  if (!hasDiag && !hasInners) {
    return (
      <div className="flex items-center gap-3 p-5 bg-gray-50 rounded-xl border border-gray-100 text-sm text-gray-500">
        <Wrench className="w-5 h-5 text-gray-400" />
        Nuk ka raport diagnostikues për këtë automjet.
      </div>
    );
  }

  const { panels, comments } = hasDiag ? parseDiagnostics(diagnosticData!) : { panels: [], comments: [] };
  const { groups } = hasInners ? parseInners(inners) : { groups: [] };

  return (
    <div className="space-y-2.5">
      {/* Body Panel Inspection */}
      {panels.length > 0 && (
        <AccordionSection
          title="Inspektimi i Paneleve të Karocerisë"
          count={`${panels.filter(p => p.status === 'ok').length}/${panels.length} normale`}
          defaultOpen
        >
          {panels.map((panel, i) => (
            <div key={i} className="flex items-center justify-between px-5 py-2.5 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
              <div className="flex items-center gap-2.5">
                <StatusIcon status={panel.status} />
                <span className="text-sm text-gray-700">{panel.label}</span>
              </div>
              <span className={clsx('text-[11px] font-semibold px-2.5 py-0.5 rounded-full', statusBadgeClass(panel.status))}>
                {panel.statusLabel}
              </span>
            </div>
          ))}
        </AccordionSection>
      )}

      {/* Performance Inspection Groups (from inners) */}
      {groups.map((group) => {
        const okCount = group.items.filter(i => i.status === 'ok' || i.status === 'none').length;
        return (
          <AccordionSection
            key={group.title}
            title={group.title}
            count={`${okCount}/${group.items.length} kaluar`}
          >
            {group.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-2.5 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center gap-2.5">
                  <StatusIcon status={item.status} />
                  <span className="text-sm text-gray-700">{item.label}</span>
                </div>
                <span className={clsx('text-[11px] font-semibold px-2.5 py-0.5 rounded-full', statusBadgeClass(item.status))}>
                  {item.statusLabel}
                </span>
              </div>
            ))}
          </AccordionSection>
        );
      })}

      {/* Inspector Comments */}
      {comments.length > 0 && (
        <AccordionSection title="Shënimet e Inspektorit" defaultOpen>
          <div className="px-5 py-4 space-y-3">
            {comments.map((c, i) => (
              <div key={i} className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-xs font-semibold text-blue-700 mb-1">{c.name}</p>
                <p className="text-sm text-blue-800">{c.text}</p>
              </div>
            ))}
          </div>
        </AccordionSection>
      )}
    </div>
  );
}
