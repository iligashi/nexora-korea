'use client';

import { useState } from 'react';
import clsx from 'clsx';

// Damage code config
const DAMAGE_CODES: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  N: { label: 'Ndërrim',                color: '#ef4444', bg: 'bg-red-50',    dot: 'bg-red-500'    },
  R: { label: 'Riparim me Saldim',     color: '#3b82f6', bg: 'bg-blue-50',   dot: 'bg-blue-500'   },
  K: { label: 'Korrozion',             color: '#d97706', bg: 'bg-amber-50',  dot: 'bg-amber-600'  },
  G: { label: 'Gërvishtje',            color: '#6b7280', bg: 'bg-gray-100',  dot: 'bg-gray-500'   },
  P: { label: 'Parregullsi',           color: '#16a34a', bg: 'bg-green-50',  dot: 'bg-green-600'  },
  D: { label: 'Dëmtim',               color: '#ea580c', bg: 'bg-orange-50', dot: 'bg-orange-600' },
  W: { label: 'Riparim me Saldim',     color: '#3b82f6', bg: 'bg-blue-50',   dot: 'bg-blue-500'   },
  C: { label: 'Korrozion',             color: '#d97706', bg: 'bg-amber-50',  dot: 'bg-amber-600'  },
  A: { label: 'Ndërrim',               color: '#ef4444', bg: 'bg-red-50',    dot: 'bg-red-500'    },
  U: { label: 'Sipërfaqe e Pabarabartë', color: '#8b5cf6', bg: 'bg-violet-50', dot: 'bg-violet-500' },
  E: { label: 'E Ndërruar',            color: '#ef4444', bg: 'bg-red-50',    dot: 'bg-red-500'    },
  S: { label: 'Llamarinë',             color: '#f59e0b', bg: 'bg-yellow-50', dot: 'bg-yellow-500' },
};

// Korean panel names → panel IDs
const KOREAN_TO_ID: Record<string, string> = {
  '후드': 'hood',
  '앞범퍼': 'front-bumper', '전면범퍼': 'front-bumper',
  '앞좌측펜더': 'fl-fender', '앞좌측휀더': 'fl-fender', '앞좌측훼다': 'fl-fender',
  '앞우측펜더': 'fr-fender', '앞우측휀더': 'fr-fender', '앞우측훼다': 'fr-fender',
  '앞좌측도어': 'fl-door',
  '앞우측도어': 'fr-door',
  '뒤좌측도어': 'rl-door', '후좌측도어': 'rl-door',
  '뒤우측도어': 'rr-door', '후우측도어': 'rr-door',
  '뒤좌측펜더': 'rl-fender', '뒤좌측휀더': 'rl-fender', '후좌측펜더': 'rl-fender',
  '뒤우측펜더': 'rr-fender', '뒤우측휀더': 'rr-fender', '후우측펜더': 'rr-fender',
  '트렁크': 'trunk', '트렁크리드': 'trunk',
  '뒤범퍼': 'rear-bumper', '후범퍼': 'rear-bumper',
  '루프패널': 'roof', '루프': 'roof',
  '좌측로커패널': 'l-rocker', '우측로커패널': 'r-rocker',
};

// English diagnostic panel names → panel IDs
const ENGLISH_TO_ID: Record<string, string> = {
  'HOOD': 'hood',
  'FRONT_BUMPER': 'front-bumper',
  'REAR_BUMPER': 'rear-bumper',
  'FRONT_DOOR_LEFT': 'fl-door',
  'FRONT_DOOR_RIGHT': 'fr-door',
  'BACK_DOOR_LEFT': 'rl-door',
  'BACK_DOOR_RIGHT': 'rr-door',
  'FRONT_FENDER_LEFT': 'fl-fender',
  'FRONT_FENDER_RIGHT': 'fr-fender',
  'REAR_FENDER_LEFT': 'rl-fender',
  'REAR_FENDER_RIGHT': 'rr-fender',
  'TRUNK_LID': 'trunk',
  'ROOF_PANEL': 'roof',
  'ROCKER_PANEL_LEFT': 'l-rocker',
  'ROCKER_PANEL_RIGHT': 'r-rocker',
  'QUARTER_PANEL_LEFT': 'rl-fender',
  'QUARTER_PANEL_RIGHT': 'rr-fender',
};

// Panel labels for the list
const PANEL_LABELS: Record<string, string> = {
  'front-bumper': 'Parakolpi i Përparmë',
  'hood': 'Kapaku',
  'fl-fender': 'Krahësorja e Përparme Majtas',
  'fr-fender': 'Krahësorja e Përparme Djathtas',
  'fl-door': 'Dera e Përparme Majtas',
  'fr-door': 'Dera e Përparme Djathtas',
  'roof': 'Çatia',
  'rl-door': 'Dera e Pasme Majtas',
  'rr-door': 'Dera e Pasme Djathtas',
  'rl-fender': 'Krahësorja e Pasme Majtas',
  'rr-fender': 'Krahësorja e Pasme Djathtas',
  'trunk': 'Bagazhi',
  'rear-bumper': 'Parakolpi i Pasmë',
  'l-rocker': 'Paneli Anësor Majtas',
  'r-rocker': 'Paneli Anësor Djathtas',
};

const PANEL_ORDER = [
  'front-bumper', 'hood', 'fl-fender', 'fr-fender',
  'fl-door', 'fr-door', 'roof', 'rl-door', 'rr-door',
  'rl-fender', 'rr-fender', 'trunk', 'rear-bumper',
];

interface DiagItem {
  code?: string;
  name: string;
  result?: string;
  resultCode?: string;
}

interface InnerItem {
  name?: string;
  title?: string;
  code?: string;
  value?: string;
  [key: string]: unknown;
}

interface Props {
  inners: unknown;
  diagnosticData?: DiagItem[] | null;
}

function buildPanelStatus(
  inners: unknown,
  diagnosticData?: DiagItem[] | null
): Record<string, { type: 'ok' | 'damage'; code?: string }> {
  const map: Record<string, { type: 'ok' | 'damage'; code?: string }> = {};

  if (diagnosticData && Array.isArray(diagnosticData)) {
    for (const item of diagnosticData) {
      if (!item.name || item.name.includes('COMMENT')) continue;
      const panelId = ENGLISH_TO_ID[item.name];
      if (!panelId) continue;
      if (item.resultCode === 'NORMAL') {
        map[panelId] = { type: 'ok' };
      } else if (item.resultCode) {
        map[panelId] = { type: 'damage', code: item.resultCode.charAt(0) };
      }
    }
  }

  if (inners && !Array.isArray(inners) && typeof inners === 'object') {
    const obj = inners as Record<string, unknown>;
    for (const [key, val] of Object.entries(obj)) {
      if (typeof val !== 'string' || !val) continue;
      const panelId = KOREAN_TO_ID[key] ?? key;
      if (DAMAGE_CODES[val.toUpperCase()]) {
        map[panelId] = { type: 'damage', code: val.toUpperCase() };
      }
    }
  }

  if (inners && Array.isArray(inners)) {
    for (const item of inners as InnerItem[]) {
      const nameProp = (item.name ?? item.title ?? '') as string;
      const code = (item.code ?? item.value ?? '') as string;
      if (!code || !nameProp) continue;
      const panelId = KOREAN_TO_ID[nameProp.trim()];
      if (panelId && DAMAGE_CODES[code.toUpperCase()]) {
        map[panelId] = { type: 'damage', code: code.toUpperCase() };
      }
    }
  }

  return map;
}

// SVG panel paths — top-down car view
// The car is ~200 wide, ~480 tall, centered in a 240x500 viewBox
function PanelPath({ id, d, status, isHovered, onHover }: {
  id: string;
  d: string;
  status?: { type: 'ok' | 'damage'; code?: string };
  isHovered: boolean;
  onHover: (id: string | null) => void;
}) {
  let fill: string;
  let stroke: string;
  let fillOpacity = 1;
  let labelText = '';
  let labelColor = '#fff';

  if (!status) {
    fill = '#f3f4f6';
    stroke = isHovered ? '#4f46e5' : '#d1d5db';
  } else if (status.type === 'ok') {
    fill = '#bbf7d0';
    stroke = isHovered ? '#4f46e5' : '#86efac';
    labelColor = '#059669';
  } else {
    const code = status.code ?? 'D';
    const cfg = DAMAGE_CODES[code];
    fill = cfg?.color ?? '#ef4444';
    stroke = isHovered ? '#4f46e5' : fill;
    fillOpacity = 0.25;
    labelText = code;
    labelColor = cfg?.color ?? '#ef4444';
  }

  // Calculate centroid for label (rough center of bounding box)
  const bbox = getBBox(d);

  return (
    <g
      onMouseEnter={() => onHover(id)}
      onMouseLeave={() => onHover(null)}
      className="cursor-pointer"
      style={{ transition: 'all 0.15s ease' }}
    >
      <path
        d={d}
        fill={fill}
        fillOpacity={fillOpacity}
        stroke={stroke}
        strokeWidth={isHovered ? 2.5 : 1.2}
        strokeLinejoin="round"
      />
      {status?.type === 'ok' && (
        <text
          x={bbox.cx} y={bbox.cy + 4}
          textAnchor="middle" fontSize="11" fontWeight="bold"
          fill={labelColor} fontFamily="system-ui"
        >&#10003;</text>
      )}
      {labelText && (
        <text
          x={bbox.cx} y={bbox.cy + 5}
          textAnchor="middle" fontSize="13" fontWeight="900"
          fill={labelColor} fontFamily="system-ui"
        >{labelText}</text>
      )}
    </g>
  );
}

function getBBox(d: string) {
  const nums = d.match(/[\d.]+/g)?.map(Number) ?? [];
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (let i = 0; i < nums.length; i += 2) {
    if (nums[i] < 500) {
      minX = Math.min(minX, nums[i]);
      maxX = Math.max(maxX, nums[i]);
    }
    if (i + 1 < nums.length && nums[i + 1] < 500) {
      minY = Math.min(minY, nums[i + 1]);
      maxY = Math.max(maxY, nums[i + 1]);
    }
  }
  return { cx: (minX + maxX) / 2, cy: (minY + maxY) / 2 };
}

// Top-down car SVG paths (viewBox 0 0 240 500)
const CAR_PANELS: { id: string; d: string }[] = [
  // Front bumper — curved front
  {
    id: 'front-bumper',
    d: 'M60 52 Q60 32, 120 28 Q180 32, 180 52 L180 62 L60 62 Z',
  },
  // Hood — tapers toward front
  {
    id: 'hood',
    d: 'M56 64 L184 64 L186 68 Q188 100, 188 140 L52 140 Q52 100, 54 68 Z',
  },
  // Front left fender
  {
    id: 'fl-fender',
    d: 'M20 64 L54 64 L52 140 L20 140 Q16 140, 16 130 L16 74 Q16 64, 20 64 Z',
  },
  // Front right fender
  {
    id: 'fr-fender',
    d: 'M186 64 L220 64 Q224 64, 224 74 L224 130 Q224 140, 220 140 L188 140 Z',
  },
  // Windshield area / roof front (narrower, tapers)
  // Front left door
  {
    id: 'fl-door',
    d: 'M20 142 L52 142 L48 250 L22 250 Q18 250, 18 242 L18 150 Q18 142, 20 142 Z',
  },
  // Front right door
  {
    id: 'fr-door',
    d: 'M188 142 L220 142 Q222 142, 222 150 L222 242 Q222 250, 218 250 L192 250 Z',
  },
  // Roof — center, slightly narrower
  {
    id: 'roof',
    d: 'M54 142 L186 142 L190 250 L186 360 L54 360 L50 250 L54 142 Z',
  },
  // Rear left door
  {
    id: 'rl-door',
    d: 'M22 252 L48 252 L46 350 L22 350 Q18 350, 18 340 L18 260 Q18 252, 22 252 Z',
  },
  // Rear right door
  {
    id: 'rr-door',
    d: 'M192 252 L218 252 Q222 252, 222 260 L222 340 Q222 350, 218 350 L194 350 Z',
  },
  // Rear left fender (quarter panel)
  {
    id: 'rl-fender',
    d: 'M22 352 L46 352 L44 428 L20 428 Q16 428, 16 420 L16 360 Q16 352, 22 352 Z',
  },
  // Rear right fender (quarter panel)
  {
    id: 'rr-fender',
    d: 'M194 352 L218 352 Q224 352, 224 360 L224 420 Q224 428, 220 428 L196 428 Z',
  },
  // Trunk
  {
    id: 'trunk',
    d: 'M52 362 L188 362 Q190 400, 188 430 L52 430 Q50 400, 52 362 Z',
  },
  // Rear bumper — curved rear
  {
    id: 'rear-bumper',
    d: 'M60 432 L180 432 L180 442 Q180 462, 120 466 Q60 462, 60 442 Z',
  },
];

export default function CarBodyDiagram({ inners, diagnosticData }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);
  const panelStatus = buildPanelStatus(inners, diagnosticData);

  const inspectedPanels = Object.keys(panelStatus);
  const damagedPanels = Object.entries(panelStatus).filter(([, s]) => s.type === 'damage');
  const cleanPanels = inspectedPanels.length - damagedPanels.length;
  const hasDamage = damagedPanels.length > 0;
  const usedCodes = new Set(damagedPanels.map(([, s]) => s.code).filter(Boolean));

  return (
    <div className="space-y-6">
      {/* Legend */}
      {hasDamage ? (
        <div className="flex flex-wrap gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <span className="w-3 h-3 rounded-sm bg-emerald-400 flex-shrink-0" />
            <span className="font-bold">Normale</span>
          </div>
          {Object.entries(DAMAGE_CODES)
            .filter(([code]) => usedCodes.has(code))
            .map(([code, cfg]) => (
              <div key={code} className="flex items-center gap-1.5 text-xs text-gray-800">
                <span className={clsx('w-3 h-3 rounded-sm flex-shrink-0', cfg.dot)} />
                <span className="font-bold">{code}</span>
                <span>= {cfg.label}</span>
              </div>
            ))}
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <span className="w-3 h-3 rounded-sm bg-gray-200 flex-shrink-0" />
            <span>E painspektuar</span>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <span className="w-3 h-3 rounded-sm bg-emerald-400 flex-shrink-0" />
            <span className="font-bold">Normale</span> = E inspektuar, pa probleme
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <span className="w-3 h-3 rounded-sm bg-gray-200 flex-shrink-0" />
            <span className="font-bold">Gri</span> = E painspektuar
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-6 items-start">
        {/* SVG Diagram — realistic top-down car */}
        <div className="flex-shrink-0 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <svg
            viewBox="0 0 240 500"
            width="220"
            xmlns="http://www.w3.org/2000/svg"
            className="select-none"
          >
            {/* Car body shadow */}
            <ellipse cx="120" cy="490" rx="80" ry="6" fill="#e5e7eb" fillOpacity="0.5" />

            {/* Headlights */}
            <ellipse cx="50" cy="52" rx="12" ry="6" fill="#fef3c7" stroke="#fbbf24" strokeWidth="1" />
            <ellipse cx="190" cy="52" rx="12" ry="6" fill="#fef3c7" stroke="#fbbf24" strokeWidth="1" />

            {/* Taillights */}
            <rect x="22" y="440" width="18" height="8" rx="3" fill="#fecaca" stroke="#ef4444" strokeWidth="0.8" />
            <rect x="200" y="440" width="18" height="8" rx="3" fill="#fecaca" stroke="#ef4444" strokeWidth="0.8" />

            {/* Wheels */}
            <rect x="4" y="88" width="14" height="40" rx="5" fill="#374151" stroke="#1f2937" strokeWidth="1" />
            <rect x="222" y="88" width="14" height="40" rx="5" fill="#374151" stroke="#1f2937" strokeWidth="1" />
            <rect x="4" y="370" width="14" height="40" rx="5" fill="#374151" stroke="#1f2937" strokeWidth="1" />
            <rect x="222" y="370" width="14" height="40" rx="5" fill="#374151" stroke="#1f2937" strokeWidth="1" />

            {/* Side mirrors */}
            <ellipse cx="10" cy="155" rx="8" ry="5" fill="#d1d5db" stroke="#9ca3af" strokeWidth="0.8" />
            <ellipse cx="230" cy="155" rx="8" ry="5" fill="#d1d5db" stroke="#9ca3af" strokeWidth="0.8" />

            {/* Windshield hint lines */}
            <line x1="58" y1="145" x2="182" y2="145" stroke="#d1d5db" strokeWidth="0.8" strokeDasharray="3 2" />
            <line x1="56" y1="355" x2="184" y2="355" stroke="#d1d5db" strokeWidth="0.8" strokeDasharray="3 2" />

            {/* Panel shapes */}
            {CAR_PANELS.map((panel) => (
              <PanelPath
                key={panel.id}
                id={panel.id}
                d={panel.d}
                status={panelStatus[panel.id]}
                isHovered={hovered === panel.id}
                onHover={setHovered}
              />
            ))}

            {/* Direction labels */}
            <text x="120" y="18" textAnchor="middle" fontSize="10" fill="#9ca3af" fontFamily="system-ui" fontWeight="600" letterSpacing="2">PARA</text>
            <text x="120" y="496" textAnchor="middle" fontSize="10" fill="#9ca3af" fontFamily="system-ui" fontWeight="600" letterSpacing="2">PRAPA</text>
          </svg>
        </div>

        {/* Panel list */}
        <div className="flex-1 space-y-1.5 min-w-0">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Gjendja e Paneleve</p>
            {inspectedPanels.length > 0 && (
              <p className="text-xs text-gray-400">{cleanPanels}/{inspectedPanels.length} pastër</p>
            )}
          </div>
          {PANEL_ORDER.map((panelId) => {
            const status = panelStatus[panelId];
            const damageCode = status?.type === 'damage' ? status.code : null;
            const damageCfg = damageCode ? DAMAGE_CODES[damageCode] : null;
            const label = PANEL_LABELS[panelId] ?? panelId;

            return (
              <div
                key={panelId}
                onMouseEnter={() => setHovered(panelId)}
                onMouseLeave={() => setHovered(null)}
                className={clsx(
                  'flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-sm transition-all cursor-default',
                  hovered === panelId
                    ? 'bg-brand-50 border-brand-200 shadow-sm'
                    : damageCfg
                    ? `${damageCfg.bg} border-gray-100`
                    : 'bg-gray-50 border-gray-100'
                )}
              >
                <span className="text-gray-700 font-medium text-sm">{label}</span>
                {damageCfg ? (
                  <span className="flex items-center gap-1.5 font-semibold text-xs" style={{ color: damageCfg.color }}>
                    <span className={clsx('w-2 h-2 rounded-full', damageCfg.dot)} />
                    {damageCode} — {damageCfg.label}
                  </span>
                ) : status?.type === 'ok' ? (
                  <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Normale
                  </span>
                ) : (
                  <span className="text-xs text-gray-400 font-medium">E painspektuar</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary */}
      {inspectedPanels.length > 0 && !hasDamage && (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
          <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full" />
          <p className="text-sm text-emerald-700 font-medium">Të gjitha panelet e inspektuara janë në gjendje normale — asnjë dëmtim i regjistruar.</p>
        </div>
      )}
      {inspectedPanels.length === 0 && (
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <span className="w-2.5 h-2.5 bg-gray-300 rounded-full" />
          <p className="text-sm text-gray-500">Nuk ka të dhëna inspektimi të paneleve për këtë automjet.</p>
        </div>
      )}
    </div>
  );
}
