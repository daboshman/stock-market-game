import { AuthGuard } from '@/components/auth/AuthGuard';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 min-w-0 pb-20 md:pb-0">
          <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">{children}</div>
        </main>
        <Navbar />
      </div>
    </AuthGuard>
  );
}
