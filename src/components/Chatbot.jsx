import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Icon from './Icon.jsx';
import { LogoMark } from './Logo.jsx';
import { useStore } from '../store/StoreContext.jsx';
import { fillTemplate, findAnswer } from '../utils/chatEngine.js';

const FALLBACK =
  "I'm a demo assistant with a fixed set of answers, so I couldn't find that one. Try one of the suggested questions below, or book a meeting and a human advisor will help.";

export default function Chatbot() {
  const { faqs, settings, listings, projects } = useStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState('');
  const [tip, setTip] = useState(false);
  const [messages, setMessages] = useState(() => [
    {
      id: 'welcome',
      role: 'bot',
      text: `Hi! I'm the ${settings.company} AI assistant. Ask me about listings, projects, investment returns, mortgage estimates or booking a meeting.`,
    },
  ]);
  const scroller = useRef(null);
  const timer = useRef(null);
  const counter = useRef(0);

  const suggestions = useMemo(
    () => faqs.filter((f) => !/^(hello|hi)$/i.test(f.question.trim())).slice(0, 12),
    [faqs],
  );

  const ctx = useMemo(
    () => ({
      company: settings.company,
      phone: settings.phone,
      email: settings.email,
      address: settings.address,
      hours: settings.hours,
      listings: listings.filter((l) => l.status === 'Available').length,
      projects: projects.length,
    }),
    [settings, listings, projects],
  );

  useEffect(() => {
    const t = setTimeout(() => setTip(true), 3500);
    const h = setTimeout(() => setTip(false), 11000);
    return () => {
      clearTimeout(t);
      clearTimeout(h);
    };
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  useEffect(() => {
    if (scroller.current) scroller.current.scrollTo({ top: scroller.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing, open]);

  const send = (text) => {
    const clean = String(text || '').trim();
    if (!clean || typing) return;
    const userMsg = { id: `u${++counter.current}`, role: 'user', text: clean };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setTyping(true);

    const match = findAnswer(clean, faqs);
    const reply = match
      ? { text: fillTemplate(match.answer, ctx), link: match.link }
      : { text: FALLBACK, link: { label: 'Book a meeting', to: '/meeting' } };

    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setMessages((m) => [...m, { id: `b${++counter.current}`, role: 'bot', ...reply }]);
      setTyping(false);
    }, 650 + Math.min(reply.text.length * 6, 900));
  };

  const go = (to) => {
    navigate(to);
    setOpen(false);
  };

  return (
    <div className="fixed bottom-5 right-4 z-[55] sm:right-6">
      <AnimatePresence>
        {open && (
          <motion.section
            key="panel"
            aria-label="AI assistant"
            initial={{ opacity: 0, y: 30, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            style={{ transformOrigin: 'bottom right' }}
            className="absolute bottom-20 right-0 flex h-[min(620px,calc(100vh-8rem))] w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-3xl border border-mist-200 bg-white shadow-2xl shadow-navy-950/25 sm:w-[390px]"
          >
            <header className="relative flex items-center gap-3 overflow-hidden bg-navy-900 px-5 py-4 text-white">
              <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-navy-500/30 blur-2xl" />
              <LogoMark className="relative h-10 w-10" />
              <div className="relative flex-1">
                <p className="font-display text-base font-semibold leading-tight">AI Property Assistant</p>
                <p className="flex items-center gap-1.5 text-xs text-white/70">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                  Online · demo mode
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="relative flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/15"
              >
                <Icon name="x" className="h-5 w-5" />
              </button>
            </header>

            <div ref={scroller} className="flex-1 space-y-4 overflow-y-auto bg-mist-50 px-4 py-5">
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 12, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      m.role === 'user'
                        ? 'rounded-br-md bg-navy-900 text-white'
                        : 'rounded-bl-md border border-mist-200 bg-white text-mist-700 shadow-sm'
                    }`}
                  >
                    {m.text}
                    {m.link && (
                      <button
                        type="button"
                        onClick={() => go(m.link.to)}
                        className="mt-3 flex items-center gap-1.5 rounded-full bg-navy-50 px-3.5 py-1.5 text-xs font-bold text-navy-700 transition hover:bg-navy-900 hover:text-white"
                      >
                        {m.link.label}
                        <Icon name="arrow-right" className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}

              {typing && (
                <div className="flex justify-start">
                  <div className="flex gap-1.5 rounded-2xl rounded-bl-md border border-mist-200 bg-white px-4 py-3.5 shadow-sm" aria-label="Assistant is typing">
                    {[0, 1, 2].map((i) => (
                      <span key={i} className="h-2 w-2 animate-dots rounded-full bg-navy-400" style={{ animationDelay: `${i * 0.18}s` }} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-mist-200 bg-white">
              <p className="px-4 pt-3 text-[10px] font-bold uppercase tracking-widest text-mist-400">Try asking</p>
              <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-3 pt-2">
                {suggestions.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    disabled={typing}
                    onClick={() => send(f.question)}
                    className="shrink-0 rounded-full border border-navy-100 bg-navy-50/60 px-3.5 py-1.5 text-xs font-semibold text-navy-700 transition hover:border-navy-900 hover:bg-navy-900 hover:text-white disabled:opacity-50"
                  >
                    {f.question}
                  </button>
                ))}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  send(input);
                }}
                className="flex items-center gap-2 border-t border-mist-100 p-3"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your question…"
                  aria-label="Type your question"
                  className="min-w-0 flex-1 rounded-full bg-mist-100 px-4 py-2.5 text-sm text-navy-900 outline-none placeholder:text-mist-400 focus:ring-2 focus:ring-navy-500/30"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || typing}
                  aria-label="Send"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-900 text-white transition hover:bg-navy-700 disabled:opacity-40"
                >
                  <Icon name="send" className="h-4 w-4" />
                </button>
              </form>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {tip && !open && (
          <motion.div
            initial={{ opacity: 0, x: 16, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 16 }}
            className="absolute bottom-3 right-20 whitespace-nowrap rounded-2xl rounded-br-sm bg-white px-4 py-2.5 text-sm font-semibold text-navy-900 shadow-xl shadow-navy-950/15"
          >
            Questions? Ask our AI assistant
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={() => {
          setOpen((o) => !o);
          setTip(false);
        }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        aria-label={open ? 'Close AI assistant' : 'Open AI assistant'}
        aria-expanded={open}
        className="relative flex h-16 w-16 items-center justify-center rounded-full bg-navy-900 text-white shadow-2xl shadow-navy-900/40"
      >
        {!open && <span className="absolute inset-0 animate-ping rounded-full bg-navy-500/30" />}
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={open ? 'x' : 'chat'}
            initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.2 }}
            className="relative"
          >
            <Icon name={open ? 'x' : 'sparkle'} className="h-7 w-7" />
          </motion.span>
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
