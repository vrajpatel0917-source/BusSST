'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  BusFront,
  Megaphone,
  AlertTriangle,
  PlusCircle,
  Send,
  Clock,
  MapPin,
  Building2,
  Route as RouteIcon,
  CalendarDays,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Loader2,
  Trash2,
} from 'lucide-react';
import { supabase, type BusSlot } from '@/lib/supabase';

const DIRECTIONS = ['Hostel to College', 'College to Hostel'] as const;
const HOSTELS = ['Uni 1', 'Uni 2'] as const;

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

function formatTime(time: string) {
  const [h, m] = time.split(':');
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const display = hour % 12 === 0 ? 12 : hour % 12;
  return `${display}:${m} ${ampm}`;
}

export default function Home() {
  const [announcement, setAnnouncement] = useState('');
  const [sendingAlert, setSendingAlert] = useState(false);

  const [busSlots, setBusSlots] = useState<BusSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(true);

  const [selectedHostel, setSelectedHostel] = useState<string>('Uni 1');
  const [selectedDirection, setSelectedDirection] = useState<string>('Hostel to College');
  const [selectedBusId, setSelectedBusId] = useState<string>('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const [customHostel, setCustomHostel] = useState<string>('Uni 1');
  const [customDirection, setCustomDirection] = useState<string>('Hostel to College');
  const [customTime, setCustomTime] = useState<string>('');
  const [addingSlot, setAddingSlot] = useState(false);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchBusSlots = useCallback(async () => {
    setLoadingSlots(true);
    const { data, error } = await supabase
      .from('bus_slots')
      .select('*')
      .order('departure_time', { ascending: true });
    if (error) {
      showToast('Failed to load bus schedule', 'error');
    } else if (data) {
      setBusSlots(data as BusSlot[]);
    }
    setLoadingSlots(false);
  }, []);

  useEffect(() => {
    fetchBusSlots();
  }, [fetchBusSlots]);

  // Keep selected bus ID valid when filters change
  const filteredForUpdate = busSlots.filter(
    (b) => b.hostel === selectedHostel && b.direction === selectedDirection
  );

  useEffect(() => {
    if (filteredForUpdate.length > 0 && !filteredForUpdate.find((b) => b.id === selectedBusId)) {
      setSelectedBusId(filteredForUpdate[0].id);
    } else if (filteredForUpdate.length === 0) {
      setSelectedBusId('');
    }
  }, [filteredForUpdate, selectedBusId]);

  const handleSendAlert = async () => {
    const message = announcement.trim();
    if (!message) return;
    setSendingAlert(true);
    await new Promise((r) => setTimeout(r, 500));
    showToast(`Alert sent to all students: "${message}"`, 'success');
    setAnnouncement('');
    setSendingAlert(false);
  };

  const handleTimetableAction = async (newStatus: string) => {
    if (!selectedBusId) {
      showToast('No bus selected for this route', 'error');
      return;
    }
    setUpdatingStatus(true);
    const { error } = await supabase
      .from('bus_slots')
      .update({ status: newStatus })
      .eq('id', selectedBusId);
    setUpdatingStatus(false);
    if (error) {
      showToast('Failed to update bus status', 'error');
      return;
    }
    const bus = busSlots.find((b) => b.id === selectedBusId);
    showToast(`${bus?.hostel} ${formatTime(bus?.departure_time || '')} → ${newStatus}`, 'success');
    fetchBusSlots();
  };

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTime) return;
    setAddingSlot(true);
    const { data, error } = await supabase
      .from('bus_slots')
      .insert({
        hostel: customHostel,
        direction: customDirection,
        departure_time: customTime,
        status: 'On Time',
      })
      .select()
      .single();
    setAddingSlot(false);
    if (error || !data) {
      showToast('Failed to add bus slot', 'error');
      return;
    }
    showToast(`Added: ${customHostel} ${customDirection} @ ${formatTime(customTime)}`, 'success');
    setCustomTime('');
    fetchBusSlots();
  };

  const handleDeleteSlot = async (id: string) => {
    const { error } = await supabase.from('bus_slots').delete().eq('id', id);
    if (error) {
      showToast('Failed to remove slot', 'error');
      return;
    }
    showToast('Bus slot removed', 'success');
    fetchBusSlots();
  };

  const selectedBus = busSlots.find((b) => b.id === selectedBusId);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 h-[54px] bg-slate-900 border-b border-slate-800">
        <div className="mx-auto flex h-full max-w-[1000px] items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-[6px] bg-blue-600 shadow-sm">
              <BusFront className="h-4 w-4 text-white" strokeWidth={2.2} />
            </div>
            <span className="text-[14px] font-semibold text-white tracking-tight">
              SST Transport Admin
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800 px-3 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span className="text-[11px] font-medium text-slate-300">Dispatcher Mode</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-[1000px] px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-7">
          <h1 className="text-[22px] font-bold tracking-tight text-slate-900">Transport Operations</h1>
          <p className="mt-1 text-[13px] text-slate-500">
            Manage announcements, update live schedules, and add custom bus slots in real time.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* Feature 1: Push Notifications */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:col-span-2">
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
                <Megaphone className="h-4 w-4 text-blue-600" strokeWidth={2.2} />
              </div>
              <div>
                <h2 className="text-[14px] font-semibold text-slate-800">Push Notifications &amp; Announcements</h2>
                <p className="text-[11px] text-slate-400">Broadcast an alert to every student&apos;s device instantly.</p>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                type="text"
                value={announcement}
                onChange={(e) => setAnnouncement(e.target.value)}
                placeholder="Type a broadcast message — e.g. Bus 3 delayed by 15 minutes near Library Circle…"
                className="flex-1 rounded-lg border border-slate-200 bg-[#f8fafc] px-3.5 py-2.5 text-[13px] text-slate-700 placeholder:text-slate-400 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
              <button
                onClick={handleSendAlert}
                disabled={!announcement.trim() || sendingAlert}
                className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {sendingAlert ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" strokeWidth={2.2} />}
                Send Alert
              </button>
            </div>
          </section>

          {/* Feature 2: Update Live Timetable */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50">
                <AlertTriangle className="h-4 w-4 text-orange-500" strokeWidth={2.2} />
              </div>
              <div>
                <h2 className="text-[14px] font-semibold text-slate-800">Update Live Timetable</h2>
                <p className="text-[11px] text-slate-400">Flag a delay or cancel a running bus.</p>
              </div>
            </div>

            <div className="mb-3 grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-[11px] font-medium text-slate-500">Hostel</label>
                <div className="relative">
                  <Building2 className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  <select
                    value={selectedHostel}
                    onChange={(e) => setSelectedHostel(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-slate-200 bg-[#f8fafc] py-2.5 pl-9 pr-8 text-[13px] text-slate-700 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100"
                  >
                    {HOSTELS.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-medium text-slate-500">Direction</label>
                <div className="relative">
                  <RouteIcon className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  <select
                    value={selectedDirection}
                    onChange={(e) => setSelectedDirection(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-slate-200 bg-[#f8fafc] py-2.5 pl-9 pr-8 text-[13px] text-slate-700 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100"
                  >
                    {DIRECTIONS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="mb-1 block text-[11px] font-medium text-slate-500">Bus / Departure</label>
              <div className="relative">
                <Clock className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <select
                  value={selectedBusId}
                  onChange={(e) => setSelectedBusId(e.target.value)}
                  disabled={filteredForUpdate.length === 0}
                  className="w-full appearance-none rounded-lg border border-slate-200 bg-[#f8fafc] py-2.5 pl-9 pr-8 text-[13px] text-slate-700 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100 disabled:opacity-50"
                >
                  {filteredForUpdate.length === 0 ? (
                    <option value="">No buses for this route</option>
                  ) : (
                    filteredForUpdate.map((b) => (
                      <option key={b.id} value={b.id}>
                        {formatTime(b.departure_time)} — {b.status}
                      </option>
                    ))
                  )}
                </select>
              </div>
              {selectedBus && (
                <div className="mt-2 flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
                  <span className={`h-2 w-2 rounded-full ${STATUS_DOT[selectedBus.status] || 'bg-slate-400'}`} />
                  <span className="text-[11px] text-slate-500">Current status:</span>
                  <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${STATUS_STYLES[selectedBus.status] || 'border-slate-200 bg-slate-50 text-slate-600'}`}>
                    {selectedBus.status}
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <button
                onClick={() => handleTimetableAction('Delayed 10m')}
                disabled={!selectedBusId || updatingStatus}
                className="rounded-lg border border-orange-200 bg-orange-50 px-2 py-2.5 text-[12px] font-semibold text-orange-700 transition hover:bg-orange-100 hover:shadow-sm active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Delay 10m
              </button>
              <button
                onClick={() => handleTimetableAction('Delayed 20m')}
                disabled={!selectedBusId || updatingStatus}
                className="rounded-lg border border-orange-200 bg-orange-50 px-2 py-2.5 text-[12px] font-semibold text-orange-700 transition hover:bg-orange-100 hover:shadow-sm active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Delay 20m
              </button>
              <button
                onClick={() => handleTimetableAction('Cancelled')}
                disabled={!selectedBusId || updatingStatus}
                className="rounded-lg border border-red-200 bg-red-50 px-2 py-2.5 text-[12px] font-semibold text-red-600 transition hover:bg-red-100 hover:shadow-sm active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Cancel Bus
              </button>
            </div>
            {updatingStatus && (
              <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400">
                <Loader2 className="h-3 w-3 animate-spin" /> Updating…
              </div>
            )}
          </section>

          {/* Feature 3: Add Custom Bus Slot */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
                <PlusCircle className="h-4 w-4 text-emerald-600" strokeWidth={2.2} />
              </div>
              <div>
                <h2 className="text-[14px] font-semibold text-slate-800">Add Custom Bus Slot</h2>
                <p className="text-[11px] text-slate-400">Schedule an extra bus for a specific route.</p>
              </div>
            </div>

            <form onSubmit={handleAddSlot}>
              <div className="mb-3 grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 flex items-center gap-1 text-[11px] font-medium text-slate-500">
                    <MapPin className="h-3 w-3" /> Target Hostel
                  </label>
                  <select
                    value={customHostel}
                    onChange={(e) => setCustomHostel(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-slate-200 bg-[#f8fafc] px-3 py-2.5 text-[13px] text-slate-700 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                  >
                    {HOSTELS.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 flex items-center gap-1 text-[11px] font-medium text-slate-500">
                    <RouteIcon className="h-3 w-3" /> Route Direction
                  </label>
                  <select
                    value={customDirection}
                    onChange={(e) => setCustomDirection(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-slate-200 bg-[#f8fafc] px-3 py-2.5 text-[13px] text-slate-700 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                  >
                    {DIRECTIONS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 flex items-center gap-1 text-[11px] font-medium text-slate-500">
                    <Clock className="h-3 w-3" /> Departure Time
                  </label>
                  <input
                    type="time"
                    value={customTime}
                    onChange={(e) => setCustomTime(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-[#f8fafc] px-3 py-2.5 text-[13px] text-slate-700 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={!customTime || addingSlot}
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-slate-800 px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm transition hover:bg-slate-900 hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {addingSlot ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <PlusCircle className="h-3.5 w-3.5" strokeWidth={2.2} />}
                    Add Slot
                  </button>
                </div>
              </div>
            </form>
          </section>

          {/* Feature 4: Today's Bus Schedule (spans both columns) */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                  <CalendarDays className="h-4 w-4 text-slate-600" strokeWidth={2.2} />
                </div>
                <div>
                  <h2 className="text-[14px] font-semibold text-slate-800">Today&apos;s Bus Schedule</h2>
                  <p className="text-[11px] text-slate-400">
                    {busSlots.length} bus{busSlots.length !== 1 ? 'es' : ''} scheduled across both hostels.
                  </p>
                </div>
              </div>
              <button
                onClick={fetchBusSlots}
                disabled={loadingSlots}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                <RefreshCw className={`h-3 w-3 ${loadingSlots ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>

            {loadingSlots ? (
              <div className="flex items-center justify-center py-10 text-[13px] text-slate-400">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading schedule…
              </div>
            ) : busSlots.length === 0 ? (
              <div className="py-10 text-center text-[13px] text-slate-400">
                No buses scheduled. Add a custom slot above to get started.
              </div>
            ) : (
              <div className="space-y-4">
                {HOSTELS.map((hostel) => {
                  const hostelBuses = busSlots.filter((b) => b.hostel === hostel);
                  if (hostelBuses.length === 0) return null;
                  return (
                    <div key={hostel}>
                      <div className="mb-2 flex items-center gap-2">
                        <Building2 className="h-3.5 w-3.5 text-slate-400" />
                        <span className="text-[12px] font-semibold text-slate-700">{hostel}</span>
                        <span className="text-[11px] text-slate-400">({hostelBuses.length} buses)</span>
                      </div>
                      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                        {hostelBuses.map((bus) => (
                          <div
                            key={bus.id}
                            className="group flex items-center justify-between rounded-lg border border-slate-200 bg-[#f8fafc] px-3.5 py-2.5 transition hover:border-slate-300 hover:bg-white"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white border border-slate-200">
                                <Clock className="h-4 w-4 text-slate-500" />
                              </div>
                              <div>
                                <div className="text-[13px] font-semibold text-slate-700">
                                  {formatTime(bus.departure_time)}
                                </div>
                                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                                  <RouteIcon className="h-3 w-3" />
                                  {bus.direction}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${STATUS_STYLES[bus.status] || 'border-slate-200 bg-slate-50 text-slate-600'}`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[bus.status] || 'bg-slate-400'}`} />
                                {bus.status}
                              </span>
                              <button
                                onClick={() => handleDeleteSlot(bus.id)}
                                className="opacity-0 transition group-hover:opacity-100"
                                title="Remove slot"
                              >
                                <Trash2 className="h-3.5 w-3.5 text-slate-400 hover:text-red-500" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 animate-in fade-in slide-in-from-bottom-2">
          <div className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-[13px] font-medium shadow-lg ${toast.type === 'success' ? 'border-emerald-200 bg-white text-emerald-700' : 'border-red-200 bg-white text-red-600'}`}>
            {toast.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
}
