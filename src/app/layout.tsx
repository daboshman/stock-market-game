import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import dynamic from 'next/dynamic';

const ClientProviders = dynamic(() => import('@/providers/ClientProviders'), { ssr: false });

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Stock Market Game — Paper Trading Simulator',
  description: 'Learn to invest with fake money and real market prices.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#0a0f1e] text-white antialiased`}>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
