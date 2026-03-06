'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { PaginationMeta } from '@/lib/types';
import clsx from 'clsx';

interface Props {
  meta: PaginationMeta;
}

export default function Pagination({ meta }: Props) {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();

  const go = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));
    router.push(`${pathname}?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (meta.last_page <= 1) return null;

  const pages = getPageNumbers(meta.current_page, meta.last_page);

  return (
    <div className="flex items-center justify-center gap-2 py-8">
      {/* Prev */}
      <button
        onClick={() => go(meta.current_page - 1)}
        disabled={meta.current_page === 1}
        className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="Previous page"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {pages.map((page, i) =>
        page === '...' ? (
          <span key={`dots-${i}`} className="w-10 h-10 flex items-center justify-center text-gray-400 text-sm">
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => go(page as number)}
            className={clsx(
              'w-10 h-10 rounded-lg border text-sm font-medium transition-colors',
              page === meta.current_page
                ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                : 'border-gray-200 text-gray-700 hover:bg-gray-50'
            )}
          >
            {page}
          </button>
        )
      )}

      {/* Next */}
      <button
        onClick={() => go(meta.current_page + 1)}
        disabled={meta.current_page === meta.last_page}
        className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="Next page"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

function getPageNumbers(current: number, last: number): (number | '...')[] {
  if (last <= 7) {
    return Array.from({ length: last }, (_, i) => i + 1);
  }

  const pages: (number | '...')[] = [1];

  if (current > 3) pages.push('...');

  for (let i = Math.max(2, current - 1); i <= Math.min(last - 1, current + 1); i++) {
    pages.push(i);
  }

  if (current < last - 2) pages.push('...');
  pages.push(last);

  return pages;
}
