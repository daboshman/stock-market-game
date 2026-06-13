'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { getFirebaseAuth } from '@/lib/firebase/client';
import { signOut } from '@/lib/firebase/auth';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Image from 'next/image';

function ResetConfirmModal({ onConfirm, onCancel, isPending }: {
  onConfirm: () => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-[#0f172a] border border-white/10 rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl">
        <h3 className="text-base font-semibold text-white mb-2">Reset Portfolio?</h3>
        <p className="text-sm text-gray-400 mb-1">
          This will permanently delete all your holdings, transactions, and watchlist entries.
        </p>
        <p className="text-sm text-gray-400 mb-6">
          Your portfolio will be reset to the starting balance. <span className="text-red-400 font-medium">This cannot be undone.</span>
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={onCancel} disabled={isPending}>
            Cancel
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? 'Resetting…' : 'Reset Portfolio'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function SettingsView() {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await signOut();
      router.push('/');
    } finally {
      setSigningOut(false);
    }
  }

  async function handleReset() {
    setIsPending(true);
    setError(null);
    try {
      const idToken = await getFirebaseAuth().currentUser?.getIdToken();
      const res = await fetch('/api/portfolio/reset', {
        method: 'POST',
        headers: { Authorization: `Bearer ${idToken}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Reset failed');

      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['holdings'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['snapshots'] });
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });

      setShowConfirm(false);
      setSuccess(true);
      setTimeout(() => router.push('/dashboard'), 1500);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Reset failed');
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div>
      <PageHeader title="Settings" description="Account and portfolio settings" />

      {/* Disclaimer */}
      <Card padding="md" className="mb-4">
        <div className="flex gap-3">
          <span className="text-yellow-400 text-lg mt-0.5">⚠</span>
          <div>
            <p className="text-sm font-semibold text-yellow-300 mb-1">Simulation Disclaimer</p>
            <p className="text-sm text-gray-400">
              This is a paper trading game. All trades use simulated money and do not represent real
              investments. Prices are real-time but execution is simulated. Past simulated performance
              does not guarantee real-world results.
            </p>
          </div>
        </div>
      </Card>

      {/* Account */}
      {user && (
        <Card padding="md" className="mb-4">
          <h2 className="text-sm font-semibold text-white mb-3">Account</h2>
          <div className="flex items-center gap-3">
            {user.photoURL ? (
              <Image src={user.photoURL} alt="" width={40} height={40} className="rounded-full" />
            ) : (
              <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold text-white">
                {user.displayName?.[0] ?? 'U'}
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-white">{user.displayName}</p>
              <p className="text-xs text-gray-400">{user.email}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Sign Out — visible on mobile where the sidebar sign-out button isn't shown */}
      <Card padding="md" className="mb-4 md:hidden">
        <h2 className="text-sm font-semibold text-white mb-1">Sign Out</h2>
        <p className="text-xs text-gray-400 mb-4">Sign out of your Google account.</p>
        <Button variant="secondary" size="sm" onClick={handleSignOut} disabled={signingOut}>
          {signingOut ? 'Signing out…' : 'Sign Out'}
        </Button>
      </Card>

      {/* Danger zone */}
      <Card padding="md" className="border-red-500/20">
        <h2 className="text-sm font-semibold text-red-400 mb-1">Danger Zone</h2>
        <p className="text-xs text-gray-400 mb-4">
          Resetting your portfolio will erase all holdings, transactions, and watchlist entries and
          restore your starting balance.
        </p>

        {success && (
          <div className="mb-4 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-sm text-emerald-400">
            Portfolio reset successfully. Redirecting to dashboard…
          </div>
        )}
        {error && (
          <div className="mb-4 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
            {error}
          </div>
        )}

        <Button variant="danger" size="sm" onClick={() => setShowConfirm(true)}>
          Reset Portfolio
        </Button>
      </Card>

      {showConfirm && (
        <ResetConfirmModal
          onConfirm={handleReset}
          onCancel={() => setShowConfirm(false)}
          isPending={isPending}
        />
      )}
    </div>
  );
}
