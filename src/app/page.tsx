import { redirect } from 'next/navigation';

// Immediately redirect to login; AuthGuard handles redirect to /dashboard if authenticated.
export default function RootPage() {
  redirect('/login');
}
