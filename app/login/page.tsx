'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BusFront, Shield, GraduationCap, Loader2, AlertCircle, LogIn } from 'lucide-react';
import { supabase, type UserRole } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const userRole = session.user.app_metadata?.role as UserRole;
        if (userRole === 'admin') router.replace('/admin');
        else router.replace('/student');
        return;
      }
      setChecking(false);
    };
    checkSession();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError || !data.session) {
      setError('Invalid email or password. Please try again.');
      setLoading(false);
      return;
    }

    const userRole = data.user.app_metadata?.role as UserRole;

    if (userRole !== role) {
      await supabase.auth.signOut();
      setError(
        `This account is registered as ${userRole === 'admin' ? 'an admin' : 'a student'}, but you selected ${role === 'admin' ? 'admin' : 'student'}. Switch the role and try again.`
      );
      setLoading(false);
      return;
    }

    if (userRole === 'admin') {
      router.replace('/admin');
    } else {
      router.replace('/student');
    }
  };

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900">
        <Loader2 className="h-7 w-7 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
        {/* Brand */}
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/30">
            <BusFront className="h-6 w-6 text-white" strokeWidth={2.2} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">SST Transport</h1>
            <p className="text-xs text-slate-400">College Bus Management System</p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-7 shadow-2xl backdrop-blur-sm">
          <h2 className="mb-1 text-xl font-bold tracking-tight">Sign In</h2>
          <p className="mb-6 text-sm text-slate-400">Select your role and enter your credentials.</p>

          {/* Role toggle */}
          <div className="mb-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole('admin')}
              className={`flex flex-col items-center gap-2 rounded-xl border-2 px-4 py-3.5 transition-all ${
                role === 'admin'
                  ? 'border-blue-500 bg-blue-500/15 text-white'
                  : 'border-slate-700 bg-slate-800/30 text-slate-400 hover:border-slate-600 hover:text-slate-200'
              }`}
            >
              <Shield className={`h-5 w-5 ${role === 'admin' ? 'text-blue-400' : 'text-slate-500'}`} strokeWidth={2.2} />
              <span className="text-sm font-semibold">Admin</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('student')}
              className={`flex flex-col items-center gap-2 rounded-xl border-2 px-4 py-3.5 transition-all ${
                role === 'student'
                  ? 'border-emerald-500 bg-emerald-500/15 text-white'
                  : 'border-slate-700 bg-slate-800/30 text-slate-400 hover:border-slate-600 hover:text-slate-200'
              }`}
            >
              <GraduationCap className={`h-5 w-5 ${role === 'student' ? 'text-emerald-400' : 'text-slate-500'}`} strokeWidth={2.2} />
              <span className="text-sm font-semibold">Student</span>
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-300">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={role === 'admin' ? 'admin@sst.edu' : 'student1@sst.edu'}
                className="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-300">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-red-800/50 bg-red-950/40 px-3.5 py-2.5 text-xs text-red-300">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 hover:shadow-blue-600/40 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogIn className="h-4 w-4" strokeWidth={2.2} />
              )}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Demo credentials hint */}
          <div className="mt-6 rounded-lg border border-slate-700/50 bg-slate-900/40 px-3.5 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Test Credentials</p>
            <div className="mt-1.5 space-y-1 text-[12px] text-slate-400">
              <p><span className="font-medium text-slate-300">Admin:</span> admin@sst.edu / admin123</p>
              <p><span className="font-medium text-slate-300">Student:</span> student1@sst.edu / student123</p>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          SST Transport Portal &middot; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
