import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import Logo from './Logo.jsx';
import Icon from './Icon.jsx';
import { useStore } from '../store/StoreContext.jsx';
import { cn } from '../utils/helpers.js';

const LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/about', label: 'About' },
  { to: '/projects', label: 'Projects' },
  { to: '/investment', label: 'Investment' },
  { to: '/calculator', label: 'Calculator' },
  { to: '/listings', label: 'Listings' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { favs, settings } = useStore();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [location.pathname]);

  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-3 sm:px-5 sm:pt-4"
      >
        <nav
          aria-label="Main"
          className={cn(
            'flex w-full max-w-6xl items-center justify-between rounded-full border px-3 backdrop-blur-xl transition-all duration-500 sm:px-4',
            scrolled
              ? 'border-white/15 bg-navy-900/60 py-2 shadow-2xl shadow-navy-950/30'
              : 'border-white/25 bg-white/10 py-3 shadow-lg shadow-navy-950/10',
          )}
        >
          <Link to="/" aria-label={`${settings.company} home`} className="pl-1">
            <Logo />
          </Link>

          <LayoutGroup id="nav">
            <ul className="hidden items-center gap-1 lg:flex">
              {LINKS.map((l) => (
                <li key={l.to}>
                  <NavLink to={l.to} end={l.end} className="group relative block rounded-full px-4 py-2 text-sm font-medium">
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <motion.span
                            layoutId="nav-pill"
                            className="absolute inset-0 rounded-full border border-white/25 bg-white/20"
                            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                          />
                        )}
                        <span
                          className={cn(
                            'relative z-10 transition-colors duration-300',
                            isActive ? 'text-white' : 'text-white/70 group-hover:text-white',
                          )}
                        >
                          {l.label}
                        </span>
                        {!isActive && (
                          <span className="absolute bottom-1.5 left-1/2 h-px w-0 -translate-x-1/2 bg-white/70 transition-all duration-300 group-hover:w-5" />
                        )}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </LayoutGroup>

          <div className="flex items-center gap-2">
            {favs.length > 0 && (
              <Link
                to="/listings?saved=1"
                aria-label={`${favs.length} saved properties`}
                className="relative hidden h-10 w-10 items-center justify-center rounded-full text-white/80 transition hover:bg-white/15 hover:text-white sm:flex"
              >
                <Icon name="heart" className="h-5 w-5" />
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-navy-900">
                  {favs.length}
                </span>
              </Link>
            )}
            <Link
              to="/meeting"
              className="group relative hidden overflow-hidden rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-navy-900 transition hover:shadow-lg hover:shadow-white/20 sm:inline-flex sm:items-center sm:gap-2"
            >
              <span className="absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-navy-200/60 animate-shimmer" />
              <Icon name="calendar" className="relative h-4 w-4" />
              <span className="relative">Book a Meeting</span>
            </Link>
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 text-white transition hover:bg-white/15 lg:hidden"
            >
              <Icon name="menu" />
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile-menu"
            className="fixed inset-0 z-[60] flex flex-col bg-navy-950/95 px-6 pb-8 pt-5 backdrop-blur-2xl"
            initial={{ clipPath: 'circle(0% at calc(100% - 40px) 40px)' }}
            animate={{ clipPath: 'circle(150% at calc(100% - 40px) 40px)' }}
            exit={{ clipPath: 'circle(0% at calc(100% - 40px) 40px)' }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
          >
            <div className="flex items-center justify-between">
              <Logo />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 text-white"
              >
                <Icon name="x" />
              </button>
            </div>

            <ul className="mt-10 flex flex-1 flex-col justify-center gap-1">
              {[...LINKS, { to: '/meeting', label: 'Book a Meeting' }].map((l, i) => (
                <motion.li
                  key={l.to}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + i * 0.06, duration: 0.5 }}
                >
                  <NavLink
                    to={l.to}
                    end={l.end}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center justify-between border-b border-white/10 py-3 font-display text-3xl font-medium transition-colors',
                        isActive ? 'text-white' : 'text-white/50 hover:text-white',
                      )
                    }
                  >
                    {l.label}
                    <Icon name="arrow-up-right" className="h-5 w-5 opacity-50" />
                  </NavLink>
                </motion.li>
              ))}
            </ul>

            <div className="mt-6 space-y-1 text-sm text-white/60">
              <p>{settings.phone}</p>
              <p>{settings.email}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
