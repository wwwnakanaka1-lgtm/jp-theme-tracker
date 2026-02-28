'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

interface NavItem {
  href: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'テーマ一覧' },
  { href: '/heatmap', label: 'ヒートマップ' },
  { href: '/analytics', label: 'アナリティクス' },
  { href: '/compare', label: 'テーマ比較' },
  { href: '/search', label: '銘柄検索' },
  { href: '/favorites', label: 'お気に入り' },
  { href: '/settings', label: '設定' },
  { href: '/about', label: 'About' },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <nav className="fixed left-0 top-0 bottom-0 w-64 bg-gray-900 border-r border-gray-800 z-50 p-6">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-white font-bold">Menu</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            &times;
          </button>
        </div>
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onClose}
                className={`block px-4 py-2 rounded-lg text-sm transition-colors ${
                  pathname === item.href
                    ? 'bg-blue-600/20 text-blue-400'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
