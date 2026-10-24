import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, animate, motion, useInView, useScroll, useTransform } from 'framer-motion';
import Icon from './Icon.jsx';
import { cn } from '../utils/helpers.js';

/* ---------- Image with graceful fallback ---------- */
export function Img({ src, alt = '', className = '', ...rest }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);

  if (!src || failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={cn('flex items-center justify-center bg-gradient-to-br from-navy-800 to-navy-600', className)}
      >
        <Icon name="building" className="h-10 w-10 text-white/30" />
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={cn('h-full w-full object-cover', className)}
      {...rest}
    />
  );
}

/* ---------- Scroll reveal ---------- */
export function Reveal({ children, delay = 0, y = 32, className = '', as = 'div' }) {
  const Tag = motion[as] || motion.div;
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-70px' }}
      transition={{ duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Tag>
  );
}

/* ---------- Headline that reveals word by word ---------- */
export function WordReveal({ text, className = '', delay = 0.35, as = 'h1' }) {
  const Tag = as;
  const words = String(text).split(' ');
  return (
    <Tag className={className} aria-label={text}>
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.12em] align-bottom" aria-hidden="true">
          <motion.span
            className="inline-block"
            initial={{ y: '110%', opacity: 0 }}
            animate={{ y: '0%', opacity: 1 }}
            transition={{ duration: 0.85, delay: delay + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
          >
            {w}
            {i < words.length - 1 ? ' ' : ''}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

/* ---------- Section heading ---------- */
export function SectionTitle({ eyebrow, title, text, align = 'center', light = false, className = '' }) {
  return (
    <Reveal className={cn('mb-12 max-w-2xl', align === 'center' && 'mx-auto text-center', className)}>
      {eyebrow && (
        <span className={cn('eyebrow', light && '!text-navy-200', align === 'center' && 'justify-center')}>
          <span className={cn('h-px w-8', light ? 'bg-navy-200' : 'bg-navy-500')} />
          {eyebrow}
        </span>
      )}
      <h2
        className={cn(
          'mt-4 text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl',
          light && '!text-white',
        )}
      >
        {title}
      </h2>
      {text && <p className={cn('mt-4 text-base leading-relaxed sm:text-lg', light ? 'text-white/70' : 'text-mist-500')}>{text}</p>}
    </Reveal>
  );
}

/* ---------- Counters ---------- */
export function Counter({ to, prefix = '', suffix = '', duration = 2 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  useEffect(() => {
    if (!inView) return undefined;
    const controls = animate(0, to, {
      duration,
      ease: 'easeOut',
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = `${prefix}${Math.round(v).toLocaleString()}${suffix}`;
      },
    });
    return () => controls.stop();
  }, [inView, to, duration, prefix, suffix]);

  return <span ref={ref}>{`${prefix}0${suffix}`}</span>;
}

export function AnimatedNumber({ value, format = (v) => Math.round(v).toLocaleString(), className = '' }) {
  const ref = useRef(null);
  const current = useRef(Number(value) || 0);

  useEffect(() => {
    const target = Number(value) || 0;
    const controls = animate(current.current, target, {
      duration: 0.6,
      ease: 'easeOut',
      onUpdate: (v) => {
        current.current = v;
        if (ref.current) ref.current.textContent = format(v);
      },
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <span ref={ref} className={className}>
      {format(Number(value) || 0)}
    </span>
  );
}

/* ---------- Page hero (inner pages) ---------- */
export function PageHero({ eyebrow, title, text, image, children }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);
  const scale = useTransform(scrollYProgress, [0, 1], [1.05, 1.2]);

  return (
    <section ref={ref} className="relative flex min-h-[460px] items-end overflow-hidden bg-navy-900 pb-16 pt-40 sm:min-h-[520px]">
      <motion.div style={{ y, scale }} className="absolute inset-0">
        <Img src={image} alt="" loading="eager" />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-b from-navy-950/80 via-navy-900/60 to-navy-900/95" />
      <div className="container-x relative z-10">
        {eyebrow && (
          <motion.span
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="eyebrow !text-navy-200"
          >
            <span className="h-px w-8 bg-navy-200" />
            {eyebrow}
          </motion.span>
        )}
        <WordReveal
          text={title}
          as="h1"
          className="mt-4 max-w-3xl font-display text-4xl font-semibold leading-[1.08] !text-white sm:text-5xl lg:text-6xl"
        />
        {text && (
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.7 }}
            className="mt-5 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg"
          >
            {text}
          </motion.p>
        )}
        {children}
      </div>
    </section>
  );
}

/* ---------- Modal ---------- */
export function Modal({ open, onClose, children, maxWidth = 'max-w-3xl' }) {
  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-navy-950/70 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            role="dialog"
            aria-modal="true"
            className={cn(
              'relative max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl',
              maxWidth,
            )}
            initial={{ y: 60, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-navy-900 shadow-md backdrop-blur transition hover:bg-navy-900 hover:text-white"
            >
              <Icon name="x" className="h-5 w-5" />
            </button>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------- Badge ---------- */
export function Badge({ children, tone = 'navy', className = '' }) {
  const tones = {
    navy: 'bg-navy-900 text-white',
    light: 'bg-white/90 text-navy-900 backdrop-blur',
    grey: 'bg-mist-100 text-mist-600',
    glass: 'bg-white/15 text-white backdrop-blur border border-white/25',
    green: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    red: 'bg-rose-50 text-rose-700',
    blue: 'bg-navy-50 text-navy-600',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider',
        tones[tone] || tones.navy,
        className,
      )}
    >
      {children}
    </span>
  );
}

export const statusTone = (s) =>
  ({
    Available: 'green',
    Reserved: 'amber',
    Sold: 'grey',
    Pending: 'amber',
    Confirmed: 'green',
    Completed: 'blue',
    Cancelled: 'red',
    New: 'amber',
    Contacted: 'blue',
    Closed: 'grey',
    Planning: 'grey',
    'Under Construction': 'amber',
    Ready: 'green',
    Delivered: 'blue',
  })[s] || 'grey';
