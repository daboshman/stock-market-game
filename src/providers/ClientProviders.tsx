'use client';

import { AuthProvider } from './AuthProvider';
import { QueryProvider } from './QueryProvider';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>{children}</AuthProvider>
    </QueryProvider>
  );
}
