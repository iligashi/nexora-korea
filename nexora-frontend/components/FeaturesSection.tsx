'use client';

import { useState } from 'react';
import {
  ShieldCheck, Shield, Gauge, AlertTriangle,
  Sun, Flame, Snowflake, Armchair, Key,
  Navigation, Camera, Radio, Bluetooth, Usb, Monitor,
  Lightbulb, Wind, Lock, Car, Wifi, Volume2,
  CheckCircle2, Eye, Compass, ThermometerSun,
  ParkingSquare, Maximize2, CircleDot, Cog, Zap,
  BatteryCharging, Fan, Blinds, Power, Repeat,
  SunDim, Sunset, Lamp, Signal, SquareParking, Headphones,
  ChevronDown,
} from 'lucide-react';

// Korean → Albanian feature mapping with icons
const FEATURE_MAP: Record<string, { label: string; icon: React.ElementType; category: string }> = {
  // Siguria
  'abs':              { label: 'ABS', icon: ShieldCheck, category: 'Siguria' },
  'airbag':           { label: 'Airbag', icon: Shield, category: 'Siguria' },
  'side airbag':      { label: 'Airbag An\u00ebsor', icon: Shield, category: 'Siguria' },
  'curtain airbag':   { label: 'Airbag Perde', icon: Shield, category: 'Siguria' },
  'driver airbag':    { label: 'Airbag Shoferit', icon: Shield, category: 'Siguria' },
  'passenger airbag': { label: 'Airbag Pasagjerit', icon: Shield, category: 'Siguria' },
  'esc':              { label: 'ESC', icon: ShieldCheck, category: 'Siguria' },
  'esp':              { label: 'ESP', icon: ShieldCheck, category: 'Siguria' },
  'tpms':             { label: 'Monitor Presioni Gomash', icon: Gauge, category: 'Siguria' },
  'traction':         { label: 'Kontroll Tërheqjeje', icon: ShieldCheck, category: 'Siguria' },
  'tcs':              { label: 'Kontroll Tërheqjeje', icon: ShieldCheck, category: 'Siguria' },
  'alarm':            { label: 'Sistem Alarmi', icon: AlertTriangle, category: 'Siguria' },
  'immobilizer':      { label: 'Imobilizues', icon: Lock, category: 'Siguria' },
  'lane':             { label: 'Asistencë Korsi', icon: Compass, category: 'Siguria' },
  'blind spot':       { label: 'Monitor Pik\u00eb e Verb\u00ebr', icon: Eye, category: 'Siguria' },
  // Korean safety
  '\uc6b4\uc804\uc11d\uc5d0\uc5b4\ubc31':     { label: 'Airbag Shoferit', icon: Shield, category: 'Siguria' },
  '\ub3d9\uc2b9\uc11d\uc5d0\uc5b4\ubc31':     { label: 'Airbag Pasagjerit', icon: Shield, category: 'Siguria' },
  '\uc0ac\uc774\ub4dc\uc5d0\uc5b4\ubc31':     { label: 'Airbag An\u00ebsor', icon: Shield, category: 'Siguria' },
  '\ucee4\ud2bc\uc5d0\uc5b4\ubc31':       { label: 'Airbag Perde', icon: Shield, category: 'Siguria' },
  '\ud0c0\uc774\uc5b4\uacf5\uae30\uc555':     { label: 'Monitor Presioni Gomash', icon: Gauge, category: 'Siguria' },
  '\ucc28\uccb4\uc790\uc138\uc81c\uc5b4':     { label: 'ESC', icon: ShieldCheck, category: 'Siguria' },
  '\ucc28\uc120\uc774\ud0c8':         { label: 'Paralajm\u00ebrim Largimi nga Korsia', icon: Compass, category: 'Siguria' },
  '\ud6c4\uce21\ubc29\uacbd\ubcf4':       { label: 'Paralajm\u00ebrim Pik\u00eb e Verb\u00ebr', icon: Eye, category: 'Siguria' },

  // Komoditeti
  'sunroof':          { label: 'Tavan i Hapur', icon: Sun, category: 'Komoditeti' },
  'panoramic':        { label: 'Tavan Panoramik', icon: Sun, category: 'Komoditeti' },
  'panorama':         { label: 'Tavan Panoramik', icon: Sun, category: 'Komoditeti' },
  'heated seat':      { label: 'Nd\u00ebnjëse me Ngrohje', icon: Flame, category: 'Komoditeti' },
  'heat seat':        { label: 'Nd\u00ebnjëse me Ngrohje', icon: Flame, category: 'Komoditeti' },
  '\uc5f4\uc120\uc2dc\ud2b8':         { label: 'Nd\u00ebnjëse me Ngrohje', icon: Flame, category: 'Komoditeti' },
  '\uc5f4\uc120':             { label: 'Nd\u00ebnjëse me Ngrohje', icon: Flame, category: 'Komoditeti' },
  'cooled seat':      { label: 'Nd\u00ebnjëse me Ventilim', icon: Snowflake, category: 'Komoditeti' },
  'ventilated':       { label: 'Nd\u00ebnjëse me Ventilim', icon: Snowflake, category: 'Komoditeti' },
  '\ud1b5\ud48d\uc2dc\ud2b8':         { label: 'Nd\u00ebnjëse me Ventilim', icon: Snowflake, category: 'Komoditeti' },
  '\ud1b5\ud48d':             { label: 'Nd\u00ebnjëse me Ventilim', icon: Snowflake, category: 'Komoditeti' },
  'leather':          { label: 'Nd\u00ebnjëse L\u00ebkure', icon: Armchair, category: 'Komoditeti' },
  '\uac00\uc8fd\uc2dc\ud2b8':         { label: 'Nd\u00ebnjëse L\u00ebkure', icon: Armchair, category: 'Komoditeti' },
  'smart key':        { label: '\u00c7elës Inteligjent', icon: Key, category: 'Komoditeti' },
  '\uc2a4\ub9c8\ud2b8\ud0a4':         { label: '\u00c7elës Inteligjent', icon: Key, category: 'Komoditeti' },
  'keyless':          { label: 'Hyrje pa \u00c7elës', icon: Key, category: 'Komoditeti' },
  'climate':          { label: 'Kontroll Klime', icon: Wind, category: 'Komoditeti' },
  'air condition':    { label: 'Kondicionim Ajri', icon: Wind, category: 'Komoditeti' },
  '\uc790\ub3d9\uc5d0\uc5b4\ucee8':       { label: 'Kontroll Klime Automatike', icon: Wind, category: 'Komoditeti' },
  '\uc5d0\uc5b4\ucee8':           { label: 'Kondicionim Ajri', icon: Wind, category: 'Komoditeti' },
  '\uc804\ub3d9\uc2dc\ud2b8':         { label: 'Nd\u00ebnjëse Elektrike', icon: Armchair, category: 'Komoditeti' },
  'power seat':       { label: 'Nd\u00ebnjëse Elektrike', icon: Armchair, category: 'Komoditeti' },
  '\uc2dc\ud2b8\uba54\ubaa8\ub9ac':       { label: 'Memorie Nd\u00ebnjëseje', icon: Armchair, category: 'Komoditeti' },
  '\uc5f4\uc120\ud578\ub4e4':         { label: 'Timon me Ngrohje', icon: Flame, category: 'Komoditeti' },
  'heated steering':  { label: 'Timon me Ngrohje', icon: Flame, category: 'Komoditeti' },
  '\ud30c\ub178\ub77c\ub9c8\uc120\ub8e8\ud504':   { label: 'Tavan Panoramik', icon: Sun, category: 'Komoditeti' },
  '\uc120\ub8e8\ud504':           { label: 'Tavan i Hapur', icon: Sun, category: 'Komoditeti' },

  // Teknologjia
  'navigation':       { label: 'Navigacion', icon: Navigation, category: 'Teknologjia' },
  'navi':             { label: 'Navigacion', icon: Navigation, category: 'Teknologjia' },
  '\ub0b4\ube44\uac8c\uc774\uc158':       { label: 'Navigacion', icon: Navigation, category: 'Teknologjia' },
  'rear camera':      { label: 'Kamer\u00eb e Pasme', icon: Camera, category: 'Teknologjia' },
  'reverse camera':   { label: 'Kamer\u00eb e Pasme', icon: Camera, category: 'Teknologjia' },
  'backup camera':    { label: 'Kamer\u00eb e Pasme', icon: Camera, category: 'Teknologjia' },
  '\ud6c4\ubc29\uce74\uba54\ub77c':       { label: 'Kamer\u00eb e Pasme', icon: Camera, category: 'Teknologjia' },
  '\uc804\ubc29\uce74\uba54\ub77c':       { label: 'Kamer\u00eb e P\u00ebrparme', icon: Camera, category: 'Teknologjia' },
  '\uc5b4\ub77c\uc6b4\ub4dc\ubdf0':       { label: 'Monitor Rrethor', icon: Camera, category: 'Teknologjia' },
  'around view':      { label: 'Monitor Rrethor', icon: Camera, category: 'Teknologjia' },
  'parking sensor':   { label: 'Sensor\u00eb Parkimi', icon: Radio, category: 'Teknologjia' },
  'parking assist':   { label: 'Asistenc\u00eb Parkimi', icon: Radio, category: 'Teknologjia' },
  '\uc8fc\ucc28\uac10\uc9c0\uc13c\uc11c':     { label: 'Sensor\u00eb Parkimi', icon: Radio, category: 'Teknologjia' },
  '\uc8fc\ucc28\ubcf4\uc870':         { label: 'Asistenc\u00eb Parkimi', icon: Radio, category: 'Teknologjia' },
  'bluetooth':        { label: 'Bluetooth', icon: Bluetooth, category: 'Teknologjia' },
  '\ube14\ub8e8\ud22c\uc2a4':         { label: 'Bluetooth', icon: Bluetooth, category: 'Teknologjia' },
  'usb':              { label: 'Port USB', icon: Usb, category: 'Teknologjia' },
  'wifi':             { label: 'Wi-Fi', icon: Wifi, category: 'Teknologjia' },
  'monitor':          { label: 'Ekran', icon: Monitor, category: 'Teknologjia' },
  'display':          { label: 'Ekran', icon: Monitor, category: 'Teknologjia' },
  'audio':            { label: 'Sistem Audio', icon: Volume2, category: 'Teknologjia' },
  'cruise':           { label: 'Kontroll Shpejtësie', icon: Gauge, category: 'Teknologjia' },
  '\ud06c\ub8e8\uc988\ucee8\ud2b8\ub864':     { label: 'Kontroll Shpejtësie', icon: Gauge, category: 'Teknologjia' },
  '\uc5b4\ub311\ud2f0\ube0c\ud06c\ub8e8\uc988':   { label: 'Kontroll Shpejtësie Adaptiv', icon: Gauge, category: 'Teknologjia' },
  'adaptive cruise':  { label: 'Kontroll Shpejtësie Adaptiv', icon: Gauge, category: 'Teknologjia' },
  '\ud5e4\ub4dc\uc5c5\ub514\uc2a4\ud50c\ub808\uc774': { label: 'Ekran Head-Up', icon: Monitor, category: 'Teknologjia' },
  'head up':          { label: 'Ekran Head-Up', icon: Monitor, category: 'Teknologjia' },
  'hud':              { label: 'Ekran Head-Up', icon: Monitor, category: 'Teknologjia' },
  '\ubb34\uc120\ucda9\uc804':         { label: 'Ngarkim Pa Tela', icon: BatteryCharging, category: 'Teknologjia' },
  'wireless charg':   { label: 'Ngarkim Pa Tela', icon: BatteryCharging, category: 'Teknologjia' },
  '\uc804\ubc29\ucda9\ub3cc':         { label: 'Paralajm\u00ebrim P\u00ebrplasje P\u00ebrpara', icon: AlertTriangle, category: 'Teknologjia' },
  'forward collision': { label: 'Paralajm\u00ebrim P\u00ebrplasje P\u00ebrpara', icon: AlertTriangle, category: 'Teknologjia' },

  // Pamja e Jashtme
  'led':              { label: 'Drita LED', icon: Lightbulb, category: 'Pamja e Jashtme' },
  'headlight':        { label: 'Drita Kryesore', icon: Lightbulb, category: 'Pamja e Jashtme' },
  '\ud5e4\ub4dc\ub7a8\ud504':         { label: 'Drita LED', icon: Lightbulb, category: 'Pamja e Jashtme' },
  'fog light':        { label: 'Drita Mjegulle', icon: Lightbulb, category: 'Pamja e Jashtme' },
  '\uc548\uac1c\ub4f1':           { label: 'Drita Mjegulle', icon: Lightbulb, category: 'Pamja e Jashtme' },
  'alloy':            { label: 'Rrota Alumini', icon: CircleDot, category: 'Pamja e Jashtme' },
  'wheel':            { label: 'Rrota Alumini', icon: CircleDot, category: 'Pamja e Jashtme' },
  '\uc54c\ub8e8\ubbf8\ub284\ud720':       { label: 'Rrota Alumini', icon: CircleDot, category: 'Pamja e Jashtme' },
  'power window':     { label: 'Dritare Elektrike', icon: Maximize2, category: 'Pamja e Jashtme' },
  'electric window':  { label: 'Dritare Elektrike', icon: Maximize2, category: 'Pamja e Jashtme' },
  '\uc804\ub3d9\uc811\uc774\ubbf8\ub7ec':     { label: 'Pasqyra Palosëse Elektrike', icon: Repeat, category: 'Pamja e Jashtme' },
  'power mirror':     { label: 'Pasqyra Elektrike', icon: Eye, category: 'Pamja e Jashtme' },
  'auto light':       { label: 'Drita Automatike', icon: SunDim, category: 'Pamja e Jashtme' },
  '\uc624\ud1a0\ub77c\uc774\ud2b8':       { label: 'Drita Automatike', icon: SunDim, category: 'Pamja e Jashtme' },
  'rain sensor':      { label: 'Sensor Shiu', icon: Blinds, category: 'Pamja e Jashtme' },
  '\ub808\uc778\uc13c\uc11c':         { label: 'Sensor Shiu', icon: Blinds, category: 'Pamja e Jashtme' },
};

const CATEGORY_STYLES: Record<string, { bg: string; text: string; border: string; header: string; iconBg: string }> = {
  'Siguria':           { bg: 'bg-red-50/80',    text: 'text-red-700',    border: 'border-red-100',    header: 'text-red-600',    iconBg: 'bg-red-100' },
  'Komoditeti':        { bg: 'bg-blue-50/80',   text: 'text-blue-700',   border: 'border-blue-100',   header: 'text-blue-600',   iconBg: 'bg-blue-100' },
  'Teknologjia':       { bg: 'bg-purple-50/80', text: 'text-purple-700', border: 'border-purple-100', header: 'text-purple-600', iconBg: 'bg-purple-100' },
  'Pamja e Jashtme':   { bg: 'bg-emerald-50/80', text: 'text-emerald-700', border: 'border-emerald-100', header: 'text-emerald-600', iconBg: 'bg-emerald-100' },
  'T\u00eb Tjera':     { bg: 'bg-gray-50/80',   text: 'text-gray-700',   border: 'border-gray-200',   header: 'text-gray-600',   iconBg: 'bg-gray-100' },
};

function resolveFeature(name: string): { label: string; icon: React.ElementType; category: string } {
  const lower = name.toLowerCase();
  for (const [key, cfg] of Object.entries(FEATURE_MAP)) {
    if (lower.includes(key) || key.includes(lower)) return cfg;
  }
  // Hide untranslatable Korean text
  if (/[\uAC00-\uD7AF]/.test(name)) {
    return { label: '', icon: CheckCircle2, category: '__skip__' };
  }
  return { label: name, icon: CheckCircle2, category: 'T\u00eb Tjera' };
}

interface Props {
  options: string[];
}

export default function FeaturesSection({ options }: Props) {
  const [showAll, setShowAll] = useState(false);

  if (!options || options.length === 0) return null;

  const seen = new Set<string>();
  const grouped: Record<string, { name: string; label: string; icon: React.ElementType }[]> = {};

  for (const opt of options) {
    const { label, icon, category } = resolveFeature(opt);
    if (category === '__skip__' || !label) continue;
    if (seen.has(label.toLowerCase())) continue;
    seen.add(label.toLowerCase());
    if (!grouped[category]) grouped[category] = [];
    grouped[category].push({ name: opt, label, icon });
  }

  const ORDER = ['Siguria', 'Komoditeti', 'Teknologjia', 'Pamja e Jashtme', 'T\u00eb Tjera'];
  const sorted = ORDER.filter((c) => grouped[c]).map((c) => [c, grouped[c]] as const);
  const totalFeatures = sorted.reduce((sum, [, items]) => sum + items.length, 0);

  return (
    <div className="space-y-6">
      {sorted.map(([category, items]) => {
        const style = CATEGORY_STYLES[category] ?? CATEGORY_STYLES['T\u00eb Tjera'];
        const displayItems = showAll ? items : items.slice(0, 8);
        return (
          <div key={category}>
            <div className="flex items-center gap-2 mb-3">
              <h3 className={`text-xs font-bold uppercase tracking-widest ${style.header}`}>{category}</h3>
              <span className="text-[10px] text-gray-400 font-medium">({items.length})</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {displayItems.map(({ label, icon: Icon }) => (
                <div
                  key={label}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border ${style.bg} ${style.border} hover:shadow-sm transition-all`}
                >
                  <div className={`w-7 h-7 ${style.iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-3.5 h-3.5 ${style.text}`} />
                  </div>
                  <span className={`text-xs font-medium leading-tight ${style.text}`}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {totalFeatures > 16 && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="flex items-center gap-2 text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors"
        >
          Shfaq t\u00eb gjitha {totalFeatures} veçorit\u00eb
          <ChevronDown className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
