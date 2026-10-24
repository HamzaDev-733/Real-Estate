import { useEffect, useState } from 'react';
import { useStore } from '../store/StoreContext.jsx';
import { cn } from '../utils/helpers.js';

export function LogoMark({ className = 'h-10 w-10', light = true }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect width="64" height="64" rx="18" fill={light ? 'rgba(255,255,255,0.14)' : '#0A1A33'} />
      <rect
        x="1"
        y="1"
        width="62"
        height="62"
        rx="17"
        fill="none"
        stroke={light ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.0)'}
        strokeWidth="2"
      />
      <path d="M15 49V25l17-11 17 11v24" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinejoin="round" strokeLinecap="round" />
      <path d="M25 49V34h14v15" fill="none" stroke="#8CA5CB" strokeWidth="3.4" strokeLinejoin="round" strokeLinecap="round" />
      <path d="M32 23v4" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Brand logo. Uses the uploaded logo (Admin → Settings) when set, otherwise the built-in mark.
 * `tone="light"` → white text (for dark / glass backgrounds); `tone="dark"` → navy text.
 */
export default function Logo({ tone = 'light', compact = false, className = '' }) {
  const { settings } = useStore();
  const [broken, setBroken] = useState(false);
  useEffect(() => setBroken(false), [settings.logoUrl]);

  const light = tone === 'light';
  const hasCustom = settings.logoUrl && !broken;

  return (
    <span className={cn('inline-flex items-center gap-3', className)}>
      {hasCustom ? (
        <img
          src={settings.logoUrl}
          alt={settings.company}
          onError={() => setBroken(true)}
          className="h-10 w-auto max-w-[140px] object-contain"
        />
      ) : (
        <LogoMark light={light} className="h-10 w-10 shrink-0" />
      )}
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className={cn('font-display text-lg font-semibold tracking-wide', light ? 'text-white' : 'text-navy-900')}>
            {settings.company}
          </span>
          <span
            className={cn(
              'mt-1 hidden text-[9px] font-semibold uppercase tracking-[0.3em] sm:block',
              light ? 'text-white/60' : 'text-mist-500',
            )}
          >
            Real Estate
          </span>
        </span>
      )}
    </span>
  );
}
