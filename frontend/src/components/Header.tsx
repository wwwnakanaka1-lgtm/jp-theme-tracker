'use client';

import Link from 'next/link';
import SlideMenu from './SlideMenu';

export default function Header() {
  return (
    <header className="bg-gray-800 border-b border-gray-700">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-gray-100 hover:text-blue-400 transition-colors">
            日本株テーマトラッカー
          </Link>
          <SlideMenu />
        </div>
      </div>
    </header>
  );
}
