'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '▦' },
  { href: '/portfolio', label: 'Portfolio', icon: '◈' },
  { href: '/market', label: 'Market', icon: '◉' },
  { href: '/watchlist', label: 'Watchlist', icon: '★' },
  { href: '/transactions', label: 'Transactions', icon: '⇄' },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#080d1a] border-t border-white/8 z-50">
      <div className="flex">
        {navItems.map(({ href, label, icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex-1 flex flex-col items-center gap-1 py-2 text-xs transition-colors',
              pathname === href || pathname.startsWith(href + '/')
                ? 'text-indigo-400'
                : 'text-gray-500 hover:text-gray-300'
            )}
          >
            <span className="text-lg">{icon}</span>
            <span>{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
