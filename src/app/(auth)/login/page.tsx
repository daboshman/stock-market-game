'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">StockGame</h1>
          <p className="text-gray-400">Paper trading simulator with real market prices</p>
        </div>

        <div className="bg-[#0f172a] border border-white/8 rounded-2xl p-8">
          <h2 className="text-lg font-semibold text-white mb-1">Sign in to play</h2>
          <p className="text-sm text-gray-400 mb-6">
            Start with $100,000 in simulated cash. No real money involved.
          </p>

          <GoogleSignInButton />

          <div className="mt-6 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-xs text-yellow-300/80 leading-relaxed">
              <span className="font-semibold text-yellow-300">Simulation disclaimer:</span> This is
              a paper trading game for educational purposes only. All trades use fake money and do
              not represent real investments. Past simulated performance does not predict future
              results.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
