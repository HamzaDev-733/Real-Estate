import { useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo.jsx';
import Icon from './Icon.jsx';
import { useStore } from '../store/StoreContext.jsx';
import { useToast } from './Toast.jsx';

export default function Footer() {
  const { settings, add } = useStore();
  const toast = useToast();
  const [email, setEmail] = useState('');

  const subscribe = async (e) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      toast('Please enter a valid email address', 'error');
      return;
    }
    await add('inquiries', {
      name: 'Newsletter subscriber',
      email,
      phone: '',
      listingId: '',
      listingTitle: '',
      message: 'Subscribed to newsletter',
      status: 'New',
    });
    setEmail('');
    toast('You are subscribed. Welcome aboard!');
  };

  return (
    <footer className="relative overflow-hidden bg-navy-950 text-white/70">
      <div className="pointer-events-none absolute -right-40 -top-40 h-96 w-96 rounded-full bg-navy-600/20 blur-3xl" />
      <div className="container-x relative grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-5">
          <Logo />
          <p className="max-w-xs text-sm leading-relaxed">
            {settings.company} curates exceptional homes, landmark developments and high-yield investments with
            transparency at every step.
          </p>
        </div>

        <div>
          <h4 className="mb-5 font-sans text-xs font-bold uppercase tracking-[0.25em] !text-white">Explore</h4>
          <ul className="space-y-3 text-sm">
            {[
              ['/about', 'About us'],
              ['/projects', 'Projects & deployment'],
              ['/investment', 'Investment plans'],
              ['/calculator', 'Mortgage calculator'],
              ['/listings', 'Property listings'],
              ['/meeting', 'Schedule a meeting'],
            ].map(([to, label]) => (
              <li key={to}>
                <Link to={to} className="inline-flex items-center gap-2 transition hover:translate-x-1 hover:text-white">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-5 font-sans text-xs font-bold uppercase tracking-[0.25em] !text-white">Contact</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex gap-3">
              <Icon name="pin" className="mt-0.5 h-4 w-4 shrink-0 text-navy-300" />
              {settings.address}
            </li>
            <li className="flex gap-3">
              <Icon name="phone" className="mt-0.5 h-4 w-4 shrink-0 text-navy-300" />
              {settings.phone}
            </li>
            <li className="flex gap-3">
              <Icon name="mail" className="mt-0.5 h-4 w-4 shrink-0 text-navy-300" />
              {settings.email}
            </li>
            <li className="flex gap-3">
              <Icon name="clock" className="mt-0.5 h-4 w-4 shrink-0 text-navy-300" />
              {settings.hours}
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-5 font-sans text-xs font-bold uppercase tracking-[0.25em] !text-white">Stay informed</h4>
          <p className="mb-4 text-sm">New launches and market insight, once a month.</p>
          <form onSubmit={subscribe} className="flex overflow-hidden rounded-full border border-white/15 bg-white/5 p-1">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email"
              aria-label="Email address"
              className="min-w-0 flex-1 bg-transparent px-4 text-sm text-white outline-none placeholder:text-white/40"
            />
            <button type="submit" className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-navy-900 transition hover:bg-navy-100">
              Join
            </button>
          </form>
        </div>
      </div>

      <div className="relative border-t border-white/10">
        <div className="container-x flex flex-col items-center justify-between gap-3 py-6 text-xs sm:flex-row">
          <p>
            © {new Date().getFullYear()} {settings.company}. All rights reserved.
          </p>
          <Link to="/admin" className="inline-flex items-center gap-2 text-white/50 transition hover:text-white">
            <Icon name="lock" className="h-3.5 w-3.5" />
            Admin panel
          </Link>
        </div>
      </div>
    </footer>
  );
}
