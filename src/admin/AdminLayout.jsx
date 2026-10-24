import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Icon from '../components/Icon.jsx';
import Logo from '../components/Logo.jsx';
import { useStore } from '../store/StoreContext.jsx';
import { cn } from '../utils/helpers.js';

const NAV = [
  ['/admin', 'Dashboard', 'dashboard', true],
  ['/admin/listings', 'Listings', 'home'],
  ['/admin/projects', 'Projects', 'building'],
  ['/admin/meetings', 'Meetings', 'calendar'],
  ['/admin/inquiries', 'Inquiries', 'mail'],
  ['/admin/chatbot', 'AI Chatbot', 'bot'],
  ['/admin/settings', 'Settings', 'settings'],
];

export default function AdminLayout() {
  const { logout, meetings, inquiries } = useStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const badge = {
    '/admin/meetings': meetings.filter((m) => m.status === 'Pending').length,
    '/admin/inquiries': inquiries.filter((i) => i.status === 'New').length,
  };

  const doLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const sidebar = (
    <div className="flex h-full flex-col bg-navy-900 p-5 text-white">
      <Link to="/" className="mb-8 block px-2 pt-1">
        <Logo />
      </Link>
      <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">Manage</p>
      <nav className="flex-1 space-y-1" aria-label="Admin">
        {NAV.map(([to, label, icon, end]) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              cn(
                'relative flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-colors',
                isActive ? 'text-navy-900' : 'text-white/65 hover:bg-white/10 hover:text-white',
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && <motion.span layoutId="admin-active" className="absolute inset-0 rounded-2xl bg-white" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
                <Icon name={icon} className="relative h-5 w-5" />
                <span className="relative flex-1">{label}</span>
                {badge[to] > 0 && (
                  <span className={cn('relative flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px] font-bold', isActive ? 'bg-navy-900 text-white' : 'bg-white text-navy-900')}>
                    {badge[to]}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="space-y-2 border-t border-white/10 pt-4">
        <Link to="/" className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-white/65 hover:bg-white/10 hover:text-white">
          <Icon name="eye" className="h-5 w-5" />
          View website
        </Link>
        <button type="button" onClick={doLogout} className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-white/65 hover:bg-white/10 hover:text-white">
          <Icon name="logout" className="h-5 w-5" />
          Log out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-mist-50">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 lg:block">{sidebar}</aside>

      {/* mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-navy-950/60" onClick={() => setOpen(false)} />
          <motion.div initial={{ x: -300 }} animate={{ x: 0 }} transition={{ type: 'spring', stiffness: 320, damping: 32 }} className="absolute inset-y-0 left-0 w-72">
            {sidebar}
          </motion.div>
        </div>
      )}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-mist-200 bg-white/85 px-5 py-3 backdrop-blur-xl lg:hidden">
          <Logo tone="dark" />
          <button type="button" onClick={() => setOpen(true)} aria-label="Open menu" className="flex h-10 w-10 items-center justify-center rounded-full border border-mist-200 text-navy-900">
            <Icon name="menu" />
          </button>
        </header>
        <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
