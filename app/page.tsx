'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { supabase, type UserRole } from '@/lib/supabase';

export default function Home() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/login');
        return;
      }
      const role = session.user.app_metadata?.role as UserRole;
      if (role === 'admin') {
        router.replace('/admin');
      } else {
        router.replace('/student');
      }
    };
    checkSession().finally(() => setReady(true));
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900">
      {!ready && <Loader2 className="h-7 w-7 animate-spin text-blue-400" />}
    </div>
  );
}
