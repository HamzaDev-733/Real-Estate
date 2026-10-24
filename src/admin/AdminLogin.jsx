import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Icon from '../components/Icon.jsx';
import Logo from '../components/Logo.jsx';
import { Img } from '../components/ui.jsx';
import { useStore } from '../store/StoreContext.jsx';
import { IMAGES } from '../data/seed.js';

export default function AdminLogin() {
  const { login, isAdmin, settings } = useStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [shake, setShake] = useState(0);

  if (isAdmin) return <Navigate to="/admin" replace />;

  const submit = (e) => {
    e.preventDefault();
    if (login(email, password)) {
      navigate('/admin', { replace: true });
    } else {
      setError('Incorrect email or password.');
      setShake((s) => s + 1);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-navy-900 px-5 py-10">
      <div className="absolute inset-0">
        <Img src={IMAGES.tower} alt="" loading="eager" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-navy-950/90 to-navy-800/80" />

      <motion.div
        key={shake}
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1, x: shake ? [0, -10, 10, -8, 8, 0] : 0 }}
        transition={{ duration: shake ? 0.4 : 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md rounded-[2rem] border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-2xl sm:p-10"
      >
        <Link to="/" className="mb-8 block">
          <Logo />
        </Link>
        <h1 className="font-display text-3xl font-semibold !text-white">Admin sign in</h1>
        <p className="mt-2 text-sm text-white/60">Manage listings, projects, meetings and the chatbot.</p>

        <form onSubmit={submit} className="mt-8 space-y-5" noValidate>
          <div>
            <label htmlFor="a-email" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/60">Email</label>
            <input
              id="a-email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/60"
              placeholder="admin@aurelia.com"
            />
          </div>
          <div>
            <label htmlFor="a-pw" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/60">Password</label>
            <input
              id="a-pw"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/60"
              placeholder="••••••••"
            />
          </div>
          {error && (
            <p role="alert" className="rounded-xl bg-rose-500/20 px-4 py-2.5 text-sm text-rose-200">
              {error}
            </p>
          )}
          <button type="submit" className="btn-light w-full">
            Sign in
            <Icon name="arrow-right" className="h-4 w-4" />
          </button>
        </form>

        <div className="mt-6 rounded-2xl border border-white/15 bg-white/5 p-4 text-xs text-white/60">
          <p className="mb-2 font-bold uppercase tracking-widest text-white/80">Demo credentials</p>
          <p>
            Email: <button type="button" onClick={() => setEmail(settings.adminEmail)} className="font-mono text-white underline-offset-2 hover:underline">{settings.adminEmail}</button>
          </p>
          <p className="mt-1">
            Password: <button type="button" onClick={() => setPassword(settings.adminPassword)} className="font-mono text-white underline-offset-2 hover:underline">{settings.adminPassword}</button>
          </p>
          <p className="mt-2 text-white/40">Click a value to fill it. Remove this box before going live.</p>
        </div>
      </motion.div>
    </div>
  );
}
