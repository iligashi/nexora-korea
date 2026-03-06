import Link from 'next/link';
import { Car, Mail, Phone, MapPin } from 'lucide-react';

const quickLinks = [
  { label: 'Browse All Cars', href: '/' },
  { label: 'How It Works', href: '/how-it-works' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Contact Us', href: '/contact' },
];

const brands = ['Hyundai', 'Kia', 'Genesis', 'Chevrolet', 'Renault Korea', 'KG Mobility'];

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400">
      {/* Main footer */}
      <div className="container-main py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center">
                <Car className="w-5 h-5 text-white" />
              </div>
              <div className="leading-tight">
                <span className="block text-base font-black text-white">Nexora</span>
                <span className="block text-[10px] font-semibold text-brand-400 uppercase tracking-widest -mt-0.5">Cars & More</span>
              </div>
            </Link>
            <p className="text-sm leading-relaxed text-gray-500">
              Your trusted partner for certified pre-owned Korean vehicles.
              Directly sourced from South Korea with full inspection reports.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4 uppercase tracking-wide">Quick Links</h3>
            <ul className="space-y-2.5">
              {quickLinks.map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="text-sm hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Brands */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4 uppercase tracking-wide">Browse by Brand</h3>
            <ul className="space-y-2.5">
              {brands.map((brand) => (
                <li key={brand}>
                  <Link
                    href={`/?brand=${encodeURIComponent(brand)}`}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {brand}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4 uppercase tracking-wide">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm">
                <Phone className="w-4 h-4 mt-0.5 text-brand-500 flex-shrink-0" />
                <a href="tel:+36000000000" className="hover:text-white transition-colors">+36 00 000 0000</a>
              </li>
              <li className="flex items-start gap-2.5 text-sm">
                <Mail className="w-4 h-4 mt-0.5 text-brand-500 flex-shrink-0" />
                <a href="mailto:info@nexoracars.com" className="hover:text-white transition-colors">info@nexoracars.com</a>
              </li>
              <li className="flex items-start gap-2.5 text-sm">
                <MapPin className="w-4 h-4 mt-0.5 text-brand-500 flex-shrink-0" />
                <span>Budapest, Hungary</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="container-main py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
          <span>&copy; {new Date().getFullYear()} Nexora Cars & More. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-gray-400 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-gray-400 transition-colors">Terms of Use</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
