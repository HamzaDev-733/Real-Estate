import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Icon from '../components/Icon.jsx';
import { AnimatedNumber, Badge, statusTone } from '../components/ui.jsx';
import { useMoney, useStore } from '../store/StoreContext.jsx';
import { api } from '../services/api.js';
import { PROPERTY_TYPES } from '../data/seed.js';
import { formatDateShort, formatTime, timeAgo, toISODate } from '../utils/helpers.js';

export default function Dashboard() {
  const { listings, projects, meetings, inquiries, faqs } = useStore();
  const { compact } = useMoney();

  const stats = useMemo(() => {
    const today = toISODate(new Date());
    const upcoming = meetings
      .filter((m) => m.status !== 'Cancelled' && m.status !== 'Completed' && m.date >= today)
      .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
    const active = listings.filter((l) => l.status === 'Available');
    return {
      active: active.length,
      pipeline: active.filter((l) => l.purpose === 'Sale').reduce((s, l) => s + (Number(l.price) || 0), 0),
      pending: meetings.filter((m) => m.status === 'Pending').length,
      newInq: inquiries.filter((i) => i.status === 'New').length,
      building: projects.filter((p) => p.status === 'Under Construction').length,
      upcoming: upcoming.slice(0, 5),
    };
  }, [listings, projects, meetings, inquiries]);

  const byType = useMemo(() => {
    const counts = PROPERTY_TYPES.map((t) => [t, listings.filter((l) => l.type === t).length]);
    const max = Math.max(1, ...counts.map(([, c]) => c));
    return counts.map(([t, c]) => ({ t, c, pct: (c / max) * 100 }));
  }, [listings]);

  const storageKb = useMemo(() => {
    try {
      let total = 0;
      for (let i = 0; i < localStorage.length; i += 1) {
        const k = localStorage.key(i);
        if (k && k.startsWith('aurelia_')) total += (localStorage.getItem(k) || '').length;
      }
      return Math.round(total / 1024);
    } catch {
      return 0;
    }
  }, [listings, projects, meetings, inquiries, faqs]);

  const kpis = [
    { label: 'Active listings', value: stats.active, icon: 'home', to: '/admin/listings' },
    { label: 'Sales pipeline', value: stats.pipeline, icon: 'trending', format: (v) => compact(v), to: '/admin/listings' },
    { label: 'Pending meetings', value: stats.pending, icon: 'calendar', to: '/admin/meetings' },
    { label: 'New inquiries', value: stats.newInq, icon: 'mail', to: '/admin/inquiries' },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-navy-900">Dashboard</h1>
      <p className="mt-1 text-sm text-mist-500">A live overview of your real estate operation.</p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k, i) => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <Link to={k.to} className="group block rounded-3xl border border-mist-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-navy-900/10">
              <div className="flex items-center justify-between">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-navy-900 text-white">
                  <Icon name={k.icon} className="h-6 w-6" />
                </span>
                <Icon name="arrow-up-right" className="h-5 w-5 text-mist-300 transition group-hover:text-navy-900" />
              </div>
              <p className="mt-5 font-display text-4xl font-semibold text-navy-900">
                <AnimatedNumber value={k.value} format={k.format} />
              </p>
              <p className="mt-1 text-sm text-mist-500">{k.label}</p>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-mist-200 bg-white p-6 lg:col-span-2">
          <h2 className="font-sans text-base font-bold text-navy-900">Inventory by type</h2>
          <div className="mt-6 space-y-4">
            {byType.map((b, i) => (
              <div key={b.t} className="flex items-center gap-4">
                <span className="w-24 text-sm text-mist-600">{b.t}</span>
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-mist-100">
                  <motion.div className="h-full rounded-full bg-gradient-to-r from-navy-900 to-navy-400" initial={{ width: 0 }} animate={{ width: `${b.pct}%` }} transition={{ duration: 0.9, delay: 0.2 + i * 0.07 }} />
                </div>
                <span className="w-6 text-right text-sm font-bold text-navy-900">{b.c}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl bg-navy-900 p-6 text-white">
          <h2 className="font-sans text-base font-bold text-white">System</h2>
          <dl className="mt-5 space-y-4 text-sm">
            <div>
              <dt className="text-xs uppercase tracking-wider text-white/40">Data source</dt>
              <dd className="mt-1 font-semibold">{api.label}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-white/40">Local data size</dt>
              <dd className="mt-1 font-semibold">{storageKb} KB of ~5,000 KB</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-white/40">Projects under construction</dt>
              <dd className="mt-1 font-semibold">{stats.building}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-white/40">Chatbot Q&amp;As</dt>
              <dd className="mt-1 font-semibold">{faqs.length}</dd>
            </div>
          </dl>
          <p className="mt-6 text-xs leading-relaxed text-white/50">
            Backend-ready: set <code className="rounded bg-white/10 px-1">VITE_API_URL</code> and the same screens use your REST API.
          </p>
        </div>

        <div className="rounded-3xl border border-mist-200 bg-white p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-sans text-base font-bold text-navy-900">Upcoming meetings</h2>
            <Link to="/admin/meetings" className="text-sm font-semibold text-navy-500 hover:text-navy-900">
              Manage →
            </Link>
          </div>
          <ul className="mt-4 divide-y divide-mist-100">
            {stats.upcoming.map((m) => (
              <li key={m.id} className="flex items-center gap-4 py-3.5">
                <span className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-2xl bg-mist-100 leading-none text-navy-900">
                  <span className="text-[10px] font-bold uppercase text-mist-500">{formatDateShort(m.date).split(' ')[0]}</span>
                  <span className="font-display text-lg font-semibold">{formatDateShort(m.date).split(' ')[1]}</span>
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-navy-900">{m.name}</p>
                  <p className="text-xs text-mist-500">
                    {m.type} · {formatTime(m.time)}
                  </p>
                </div>
                <Badge tone={statusTone(m.status)}>{m.status}</Badge>
              </li>
            ))}
            {stats.upcoming.length === 0 && <li className="py-8 text-center text-sm text-mist-400">No upcoming meetings.</li>}
          </ul>
        </div>

        <div className="rounded-3xl border border-mist-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-sans text-base font-bold text-navy-900">Latest inquiries</h2>
            <Link to="/admin/inquiries" className="text-sm font-semibold text-navy-500 hover:text-navy-900">
              All →
            </Link>
          </div>
          <ul className="mt-4 space-y-4">
            {inquiries.slice(0, 4).map((i) => (
              <li key={i.id}>
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-semibold text-navy-900">{i.name}</p>
                  <span className="shrink-0 text-xs text-mist-400">{i.createdAt ? timeAgo(i.createdAt) : ''}</span>
                </div>
                <p className="line-clamp-1 text-xs text-mist-500">{i.message}</p>
              </li>
            ))}
            {inquiries.length === 0 && <li className="py-6 text-center text-sm text-mist-400">No inquiries yet.</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}
