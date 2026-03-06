import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://nexoracars.com'),
  title: {
    default: 'Nexora Cars & More — Korean Used Cars Import',
    template: '%s | Nexora Cars & More',
  },
  description:
    'Browse certified pre-owned Korean vehicles — Hyundai, Kia, Genesis and more — imported directly from South Korea. Real prices, full inspection reports, accident history.',
  keywords: ['korean cars', 'used cars korea', 'hyundai import', 'kia import', 'genesis', 'encar', 'korean used cars europe'],
  openGraph: {
    type:        'website',
    siteName:    'Nexora Cars & More',
    title:       'Nexora Cars & More — Korean Used Cars Import',
    description: 'Certified pre-owned Korean vehicles imported directly from South Korea.',
  },
  twitter: {
    card:  'summary_large_image',
    title: 'Nexora Cars & More',
  },
  robots: {
    index:  true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width:         'device-width',
  initialScale:  1,
  themeColor:    '#1d4ed8',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="flex flex-col min-h-screen bg-white antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
