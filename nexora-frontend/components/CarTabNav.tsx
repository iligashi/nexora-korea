'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Info, ShieldAlert, ClipboardList } from 'lucide-react';
import clsx from 'clsx';

const TABS = [
  { label: 'Detajet',              suffix: '',            icon: Info          },
  { label: 'Raporti i Dëmtimeve', suffix: '/report',     icon: ShieldAlert   },
  { label: 'Inspektimi',          suffix: '/inspection', icon: ClipboardList },
];

export default function CarTabNav({ carId }: { carId: number }) {
  const pathname = usePathname();
  const base = `/car/${carId}`;

  return (
    <div className="bg-white border-b border-gray-200 sticky top-16 z-30">
      <div className="container-main">
        <div className="flex -mb-px overflow-x-auto scrollbar-thin">
          {TABS.map(({ label, suffix, icon: Icon }) => {
            const href = `${base}${suffix}`;
            const isActive = pathname === href;

            return (
              <Link
                key={suffix}
                href={href}
                className={clsx(
                  'flex items-center gap-2 px-5 py-3.5 text-sm font-semibold border-b-2 transition-all whitespace-nowrap',
                  isActive
                    ? 'border-brand-600 text-brand-600 bg-brand-50/50'
                    : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-200 hover:bg-gray-50/50'
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
