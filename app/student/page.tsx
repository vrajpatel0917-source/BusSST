'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  BusFront,
  Clock,
  MapPin,
  Building2,
  Route as RouteIcon,
  CalendarDays,
  RefreshCw,
  Loader2,
  LogOut,
  GraduationCap,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from 'lucide-react';
import { supabase, type BusSlot, type Student } from '@/lib/supabase';

const STATUS_STYLES: Record<string, string> = {
  'On Time': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Delayed 10m': 'bg-amber-50 text-amber-700 border-amber-200',
  'Delayed 20m': 'bg-orange-50 text-orange-700 border-orange-200',
  Cancelled: 'bg-red-50 text-red-600 border-red-200',
};

const STATUS_DOT: Record<string, string> = {
  'On Time': 'bg-emerald-500',
  'Delayed 10m': 'bg-amber-500',
  'Delayed 20m': 'bg-orange-500',
  Cancelled: 'bg-red-500',
};

const STATUS_ICON: Record<string, typeof CheckCircle2> = {
  'On Time': CheckCircle2,
  'Delayed 10m': AlertTriangle,
  'Delayed 20m': AlertTriangle,
  Cancelled: XCircle,
};

function formatTime(time: string) {
  const [h, m] = time.split(':');
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const display = hour % 12 === 0 ? 12 : hour % 12;
  return `${display}:${m} ${ampm}`;
}

const DIRECTIONS = ['Hostel to College', 'College to Hostel'] as const;

export default function StudentDashboard() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [student, setStudent] = useState<Student | null>(null);
  const [busSlots, setBusSlots] = useState<BusSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDirection, setActiveDirection] = useState<string>('Hostel to College');

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/login');
        return;
      }
      const role = session.user.app_metadata?.role;
      if (role !== 'student') {
        router.replace('/admin');
        return;
      }

      const { data: stuData, error: stuError } = await supabase
        .from('students')
        .select('*')
        .eq('auth_id', session.user.id)
        .maybeSingle();

      if (stuError || !stuData) {
        await supabase.auth.signOut();
        router.replace('/login');
        return;
      }

      setStudent(stuData as Student);
      setAuthChecked(true);
    };
    checkAuth();
  }, [router]);

  const fetchBusSlots = async () => {
    if (!student) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('bus_slots')
      .select('*')
      .eq('hostel', student.hostel)
      .order('departure_time', { ascending: true });
    if (!error && data) {
      setBusSlots(data as BusSlot[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (authChecked && student) {
      fetchBusSlots();
    }
  }, [authChecked, student]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  if (!authChecked || !student) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8fafc]">
        <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
      </div>
    );
  }

  const filteredBuses = busSlots.filter((b) => b.direction === activeDirection);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800">
      {/* Header */}
      <header className="sticky top-0 z-50 h-[54px] bg-slate-900 border-b border-slate-800">
        <div className="mx-auto flex h-full max-w-[700px] items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-[6px] bg-emerald-600 shadow-sm">
              <BusFront className="h-4 w-4 text-white" strokeWidth={2.2} />
            </div>
            <span className="text-[14px] font-semibold text-white tracking-tight">
              SST Bus Schedule
            </span>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1 rounded-md px-2.5 py-1 text-[12px] font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-[700px] px-4 py-8 sm:px-6 sm:py-10">
        {/* Student card */}
        <div className="mb-6 flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
            <GraduationCap className="h-6 w-6 text-emerald-600" strokeWidth={2.2} />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[17px] font-bold tracking-tight text-slate-900">{student.name}</h1>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[12px] text-slate-500">
              <span className="font-medium">{student.roll_number}</span>
              <span className="text-slate-300">|</span>
              <span className="truncate">{student.email}</span>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1">
            <Building2 className="h-3.5 w-3.5 text-emerald-600" />
            <span className="text-[12px] font-semibold text-emerald-700">{student.hostel}</span>
          </div>
        </div>

        {/* Direction toggle */}
        <div className="mb-5 grid grid-cols-2 gap-3">
          {DIRECTIONS.map((dir) => (
            <button
              key={dir}
              onClick={() => setActiveDirection(dir)}
              className={`flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-[13px] font-semibold transition-all ${
                activeDirection === dir
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700'
              }`}
            >
              <RouteIcon className="h-4 w-4" />
              {dir}
            </button>
          ))}
        </div>

        {/* Schedule */}
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                <CalendarDays className="h-4 w-4 text-slate-600" strokeWidth={2.2} />
              </div>
              <div>
                <h2 className="text-[14px] font-semibold text-slate-800">Your Bus Schedule</h2>
                <p className="text-[11px] text-slate-400">
                  {student.hostel} &middot; {activeDirection}
                </p>
              </div>
            </div>
            <button
              onClick={fetchBusSlots}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-10 text-[13px] text-slate-400">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading schedule…
            </div>
          ) : filteredBuses.length === 0 ? (
            <div className="py-10 text-center text-[13px] text-slate-400">
              No buses scheduled for this route right now.
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredBuses.map((bus) => {
                const StatusIcon = STATUS_ICON[bus.status] || Clock;
                return (
                  <div
                    key={bus.id}
                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-[#f8fafc] px-4 py-3.5 transition hover:border-slate-300 hover:bg-white"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white border border-slate-200">
                        <Clock className="h-5 w-5 text-slate-500" />
                      </div>
                      <div>
                        <div className="text-[14px] font-bold text-slate-700">
                          {formatTime(bus.departure_time)}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                          <MapPin className="h-3 w-3" />
                          {bus.hostel}
                        </div>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] font-semibold ${STATUS_STYLES[bus.status] || 'border-slate-200 bg-slate-50 text-slate-600'}`}>
                      <StatusIcon className="h-3.5 w-3.5" />
                      {bus.status}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Legend */}
        <div className="mt-5 flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Status Legend</span>
          <div className="flex flex-wrap gap-3">
            {Object.keys(STATUS_STYLES).map((status) => (
              <div key={status} className="flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${STATUS_DOT[status]}`} />
                <span className="text-[12px] text-slate-600">{status}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
