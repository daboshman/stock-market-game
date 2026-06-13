'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { signOut } from '@/lib/firebase/auth';
import { cn } from '@/lib/utils/cn';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '▦' },
  { href: '/portfolio', label: 'Portfolio', icon: '◈' },
  { href: '/market', label: 'Market', icon: '◉' },
  { href: '/watchlist', label: 'Watchlist', icon: '★' },
  { href: '/transactions', label: 'Transactions', icon: '⇄' },
  { href: '/settings', label: 'Settings', icon: '⚙' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <aside className="hidden md:flex flex-col w-56 shrink-0 h-screen sticky top-0 bg-[#080d1a] border-r border-white/8">
      <div className="px-5 py-5 border-b border-white/8">
        <span className="text-lg font-bold text-white tracking-tight">StockGame</span>
        <span className="ml-1 text-xs text-indigo-400 font-medium">PAPER TRADING</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
              pathname === href || pathname.startsWith(href + '/')
                ? 'bg-indigo-600/20 text-indigo-300 font-medium'
                : 'text-gray-400 hover:text-white hover:bg-white/6'
            )}
          >
            <span className="text-base w-5 text-center">{icon}</span>
            {label}
          </Link>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-white/8">
        {user && (
          <div className="flex items-center gap-3 px-2 py-2 mb-2">
            {user.photoURL ? (
              <Image
                src={user.photoURL}
                alt={user.displayName ?? ''}
                width={28}
                height={28}
                className="rounded-full"
              />
            ) : (
              <div className="h-7 w-7 rounded-full bg-indigo-600 flex items-center justify-center text-xs text-white font-bold">
                {user.displayName?.[0] ?? 'U'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">{user.displayName}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={signOut}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/6 transition-colors"
        >
          <span className="text-base w-5 text-center">↩</span>
          Sign out
        </button>
      </div>
    </aside>
  );
}
