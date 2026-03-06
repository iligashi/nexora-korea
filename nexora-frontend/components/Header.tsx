'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Car, Phone, Globe } from 'lucide-react';

const nav = [
  { label: 'Browse Cars', href: '/' },
  { label: 'How It Works', href: '/how-it-works' },
  { label: 'Contact', href: '/contact' },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
      <div className="container-main">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-brand-700 rounded-xl flex items-center justify-center shadow-sm group-hover:bg-brand-600 transition-colors">
              <Car className="w-5 h-5 text-white" />
            </div>
            <div className="leading-tight">
              <span className="block text-base font-black text-gray-900 tracking-tight">Nexora</span>
              <span className="block text-[10px] font-semibold text-brand-600 uppercase tracking-widest -mt-0.5">Cars & More</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {nav.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-brand-700 hover:bg-brand-50 rounded-lg transition-colors"
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* CTA + mobile toggle */}
          <div className="flex items-center gap-3">
            <a
              href="tel:+36000000000"
              className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>+36 00 000 0000</span>
            </a>

            <Link href="/" className="hidden sm:block btn-primary text-sm py-2 px-4">
              Browse Cars
            </Link>

            <button
              onClick={() => setOpen(!open)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 pb-4 pt-2 space-y-1 animate-fade-in">
          {nav.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              {label}
            </Link>
          ))}
          <a
            href="tel:+36000000000"
            className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-700"
          >
            <Phone className="w-4 h-4" />
            +36 00 000 0000
          </a>
        </div>
      )}
    </header>
  );
}
