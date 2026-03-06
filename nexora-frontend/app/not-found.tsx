import Link from 'next/link';
import { Car } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="container-main flex flex-col items-center justify-center py-32 text-center">
      <Car className="w-16 h-16 text-gray-300 mb-6" />
      <h1 className="text-4xl font-black text-gray-900 mb-3">404</h1>
      <p className="text-gray-500 mb-8 max-w-sm">
        This page doesn't exist or the car listing has been removed.
      </p>
      <Link href="/" className="btn-primary">
        Browse all cars
      </Link>
    </div>
  );
}
