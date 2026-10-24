import { useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Icon from '../components/Icon.jsx';
import { PageHero } from '../components/ui.jsx';
import { useStore } from '../store/StoreContext.jsx';
import { MEETING_TYPES, TIME_SLOTS, IMAGES } from '../data/seed.js';
import { addDays, downloadFile, formatDateLong, formatTime, parseISODate, toISODate } from '../utils/helpers.js';

const STEPS = ['Meeting type', 'Date & time', 'Your details'];
const EMPTY = { name: '', email: '', phone: '', note: '' };

const pad = (n) => String(n).padStart(2, '0');
const icsStamp = (d) =>
  `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;

function groupSlots(slots) {
  return [
    ['Morning', slots.filter((s) => Number(s.split(':')[0]) < 12)],
    ['Afternoon', slots.filter((s) => Number(s.split(':')[0]) >= 12 && Number(s.split(':')[0]) < 17)],
    ['Evening', slots.filter((s) => Number(s.split(':')[0]) >= 17)],
  ].filter(([, list]) => list.length);
}

export default function Meeting() {
  const { meetings, add, settings } = useStore();
  const location = useLocation();
  const preset = location.state || {};
  const presetType = MEETING_TYPES.find((t) => t.id === preset.type)?.id || '';

  const [step, setStep] = useState(presetType ? 1 : 0);
  const [type, setType] = useState(presetType);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [form, setForm] = useState({ ...EMPTY, note: preset.note || '' });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [booking, setBooking] = useState(null);
  const stripRef = useRef(null);

  const days = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return Array.from({ length: 21 }, (_, i) => addDays(start, i));
  }, []);

  const booked = useMemo(() => {
    const set = new Set();
    meetings.forEach((m) => {
      if (m.status !== 'Cancelled') set.add(`${m.date}T${m.time}`);
    });
    return set;
  }, [meetings]);

  const now = new Date();
  const isPast = (d, t) => {
    if (d !== toISODate(now)) return false;
    return Number(t.split(':')[0]) <= now.getHours();
  };

  const typeInfo = MEETING_TYPES.find((t) => t.id === type);
  const where = type === 'Virtual Tour' ? 'Video call (link sent by email)' : settings.address;

  const canNext = step === 0 ? !!type : step === 1 ? !!date && !!time : true;

  const scrollStrip = (dir) => stripRef.current?.scrollBy({ left: dir * 320, behavior: 'smooth' });

  const setField = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrors((er) => ({ ...er, [k]: undefined }));
  };

  const confirm = async (e) => {
    e.preventDefault();
    const er = {};
    if (!form.name.trim()) er.name = 'Please enter your name';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) er.email = 'Enter a valid email';
    if (form.phone.replace(/\D/g, '').length < 7) er.phone = 'Enter a valid phone number';
    setErrors(er);
    if (Object.keys(er).length) return;

    // someone may have taken the slot while we were filling the form
    if (booked.has(`${date}T${time}`)) {
      setTime('');
      setStep(1);
      setErrors({ slot: 'That slot was just taken — please choose another time.' });
      return;
    }

    setBusy(true);
    const ref = `AUR-${Math.floor(1000 + Math.random() * 9000)}`;
    const saved = await add('meetings', { ...form, type, date, time, status: 'Pending', ref });
    setBusy(false);
    if (saved) setBooking(saved);
  };

  const downloadIcs = () => {
    if (!booking) return;
    const [h, m] = booking.time.split(':').map(Number);
    const start = parseISODate(booking.date);
    start.setHours(h, m, 0, 0);
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      `PRODID:-//${settings.company}//Meeting//EN`,
      'BEGIN:VEVENT',
      `UID:${booking.ref}@${settings.company.replace(/\s+/g, '').toLowerCase()}`,
      `DTSTAMP:${icsStamp(new Date())}`,
      `DTSTART:${icsStamp(start)}`,
      `DTEND:${icsStamp(end)}`,
      `SUMMARY:${booking.type} with ${settings.company}`,
      `LOCATION:${(booking.type === 'Virtual Tour' ? 'Video call' : settings.address).replace(/,/g, '\\,')}`,
      `DESCRIPTION:Booking reference ${booking.ref}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');
    downloadFile(`${booking.ref}.ics`, ics, 'text/calendar');
  };

  const reset = () => {
    setBooking(null);
    setStep(0);
    setType('');
    setDate('');
    setTime('');
    setForm(EMPTY);
    setErrors({});
  };

  const ticketRows = [
    ['Meeting', type, 'briefcase'],
    ['Date', date ? formatDateLong(date) : '', 'calendar'],
    ['Time', time ? formatTime(time) : '', 'clock'],
    ['Where', type ? where : '', 'pin'],
  ];

  return (
    <>
      <PageHero
        eyebrow="Schedule a meeting"
        title="Reserve your time with an advisor"
        text="Three quick steps. Pick a format, choose a slot, and you are done — no phone tag."
        image={IMAGES.living}
      />

      <section className="bg-mist-50 pb-24">
        <div className="container-x">
          <div className="relative z-20 -mt-8 grid gap-8 lg:grid-cols-5">
            {/* ---------------- Wizard / success ---------------- */}
            <div className="lg:col-span-3">
              <div className="overflow-hidden rounded-[2rem] border border-mist-200 bg-white shadow-xl shadow-navy-900/5">
                <AnimatePresence mode="wait" initial={false}>
                  {booking ? (
                    <motion.div
                      key="done"
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center px-8 py-16 text-center"
                    >
                      <div className="relative">
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 220, damping: 14 }}
                          className="flex h-24 w-24 items-center justify-center rounded-full bg-navy-900 text-white"
                        >
                          <svg viewBox="0 0 24 24" className="h-12 w-12" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                            <motion.path d="M5 12.5l4.5 4.5L19 7.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.35, duration: 0.6 }} />
                          </svg>
                        </motion.span>
                        <motion.span
                          className="absolute inset-0 rounded-full border-2 border-navy-500"
                          initial={{ scale: 1, opacity: 0.6 }}
                          animate={{ scale: 1.8, opacity: 0 }}
                          transition={{ duration: 1.4, repeat: 2 }}
                        />
                      </div>
                      <h2 className="mt-8 text-3xl font-semibold">You&apos;re booked, {booking.name.split(' ')[0]}!</h2>
                      <p className="mt-3 max-w-md">
                        We have reserved your {booking.type.toLowerCase()} on <b>{formatDateLong(booking.date)}</b> at <b>{formatTime(booking.time)}</b>. A
                        confirmation will follow at <b>{booking.email}</b>.
                      </p>
                      <p className="mt-6 rounded-full bg-mist-100 px-5 py-2 font-mono text-sm font-bold tracking-widest text-navy-900">{booking.ref}</p>
                      <div className="mt-8 flex flex-wrap justify-center gap-3">
                        <button type="button" onClick={downloadIcs} className="btn-primary">
                          <Icon name="download" className="h-4 w-4" />
                          Add to calendar
                        </button>
                        <button type="button" onClick={reset} className="btn-outline">
                          Book another meeting
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div key="wizard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      {/* stepper */}
                      <div className="border-b border-mist-100 px-6 py-6 sm:px-10">
                        <ol className="flex items-center">
                          {STEPS.map((label, i) => (
                            <li key={label} className="flex flex-1 items-center last:flex-none">
                              <button
                                type="button"
                                disabled={i > step}
                                onClick={() => setStep(i)}
                                className="flex items-center gap-3 disabled:cursor-default"
                                aria-current={i === step ? 'step' : undefined}
                              >
                                <motion.span
                                  animate={{
                                    backgroundColor: i <= step ? '#0A1A33' : '#E2E6EC',
                                    color: i <= step ? '#ffffff' : '#6B7689',
                                    scale: i === step ? 1.1 : 1,
                                  }}
                                  className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold"
                                >
                                  {i < step ? <Icon name="check" className="h-4 w-4" strokeWidth={3} /> : i + 1}
                                </motion.span>
                                <span className={`hidden text-sm font-semibold sm:block ${i === step ? 'text-navy-900' : 'text-mist-400'}`}>{label}</span>
                              </button>
                              {i < STEPS.length - 1 && (
                                <span className="mx-3 h-px flex-1 overflow-hidden bg-mist-200">
                                  <motion.span className="block h-full origin-left bg-navy-900" animate={{ scaleX: i < step ? 1 : 0 }} transition={{ duration: 0.5 }} />
                                </span>
                              )}
                            </li>
                          ))}
                        </ol>
                      </div>

                      <div className="min-h-[430px] p-6 sm:p-10">
                        <AnimatePresence mode="wait" initial={false}>
                          {step === 0 && (
                            <motion.div key="s0" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.35 }}>
                              <h2 className="text-2xl font-semibold">How would you like to meet?</h2>
                              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                {MEETING_TYPES.map((t) => {
                                  const on = type === t.id;
                                  return (
                                    <motion.button
                                      key={t.id}
                                      type="button"
                                      whileHover={{ y: -4 }}
                                      whileTap={{ scale: 0.98 }}
                                      onClick={() => setType(t.id)}
                                      aria-pressed={on}
                                      className={`relative rounded-3xl border-2 p-6 text-left transition-colors ${
                                        on ? 'border-navy-900 bg-navy-900 text-white' : 'border-mist-200 hover:border-navy-300'
                                      }`}
                                    >
                                      <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${on ? 'bg-white/15' : 'bg-navy-50 text-navy-700'}`}>
                                        <Icon name={t.icon} className="h-6 w-6" />
                                      </span>
                                      <p className={`mt-4 font-display text-lg font-semibold ${on ? 'text-white' : 'text-navy-900'}`}>{t.id}</p>
                                      <p className={`mt-1 text-sm ${on ? 'text-white/70' : 'text-mist-500'}`}>{t.blurb}</p>
                                      <p className={`mt-3 text-xs font-bold uppercase tracking-wider ${on ? 'text-navy-200' : 'text-navy-500'}`}>{t.duration}</p>
                                      {on && (
                                        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-white text-navy-900">
                                          <Icon name="check" className="h-4 w-4" strokeWidth={3} />
                                        </motion.span>
                                      )}
                                    </motion.button>
                                  );
                                })}
                              </div>
                            </motion.div>
                          )}

                          {step === 1 && (
                            <motion.div key="s1" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.35 }}>
                              <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-semibold">Pick a day and time</h2>
                                <div className="flex gap-2">
                                  <button type="button" onClick={() => scrollStrip(-1)} aria-label="Earlier days" className="flex h-9 w-9 items-center justify-center rounded-full border border-mist-200 hover:bg-navy-900 hover:text-white">
                                    <Icon name="chevron-left" className="h-4 w-4" />
                                  </button>
                                  <button type="button" onClick={() => scrollStrip(1)} aria-label="Later days" className="flex h-9 w-9 items-center justify-center rounded-full border border-mist-200 hover:bg-navy-900 hover:text-white">
                                    <Icon name="chevron-right" className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                              {errors.slot && <p className="mt-3 rounded-xl bg-rose-50 px-4 py-2 text-sm text-rose-600">{errors.slot}</p>}

                              <div ref={stripRef} className="no-scrollbar -mx-2 mt-6 flex gap-3 overflow-x-auto px-2 pb-2">
                                {days.map((d) => {
                                  const iso = toISODate(d);
                                  const closed = d.getDay() === 0;
                                  const allGone = TIME_SLOTS.every((t) => booked.has(`${iso}T${t}`) || isPast(iso, t));
                                  const disabled = closed || allGone;
                                  const on = date === iso;
                                  return (
                                    <button
                                      key={iso}
                                      type="button"
                                      disabled={disabled}
                                      onClick={() => {
                                        setDate(iso);
                                        setTime('');
                                        setErrors({});
                                      }}
                                      aria-pressed={on}
                                      className={`relative flex h-28 w-[72px] shrink-0 flex-col items-center justify-center rounded-3xl border-2 transition-colors ${
                                        on ? 'border-navy-900 text-white' : disabled ? 'border-mist-100 text-mist-300' : 'border-mist-200 text-navy-900 hover:border-navy-400'
                                      }`}
                                    >
                                      {on && <motion.span layoutId="day-pill" className="absolute inset-0 rounded-[1.35rem] bg-navy-900" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />}
                                      <span className="relative text-[11px] font-bold uppercase tracking-wider opacity-70">
                                        {d.toLocaleDateString('en-US', { weekday: 'short' })}
                                      </span>
                                      <span className="relative font-display text-2xl font-semibold">{d.getDate()}</span>
                                      <span className="relative text-[11px] opacity-70">{closed ? 'Closed' : d.toLocaleDateString('en-US', { month: 'short' })}</span>
                                    </button>
                                  );
                                })}
                              </div>

                              <AnimatePresence mode="wait">
                                {date ? (
                                  <motion.div key={date} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-6 space-y-5">
                                    {groupSlots(TIME_SLOTS).map(([label, list]) => (
                                      <div key={label}>
                                        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-mist-400">{label}</p>
                                        <div className="flex flex-wrap gap-2">
                                          {list.map((t) => {
                                            const taken = booked.has(`${date}T${t}`) || isPast(date, t);
                                            const on = time === t;
                                            return (
                                              <motion.button
                                                key={t}
                                                type="button"
                                                disabled={taken}
                                                whileHover={taken ? undefined : { scale: 1.06 }}
                                                whileTap={taken ? undefined : { scale: 0.95 }}
                                                onClick={() => {
                                                  setTime(t);
                                                  setErrors({});
                                                }}
                                                aria-pressed={on}
                                                className={`rounded-full border-2 px-5 py-2.5 text-sm font-semibold transition-colors ${
                                                  on
                                                    ? 'border-navy-900 bg-navy-900 text-white'
                                                    : taken
                                                      ? 'border-mist-100 text-mist-300 line-through'
                                                      : 'border-mist-200 text-navy-900 hover:border-navy-500'
                                                }`}
                                              >
                                                {formatTime(t)}
                                              </motion.button>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    ))}
                                  </motion.div>
                                ) : (
                                  <motion.p key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-10 rounded-2xl bg-mist-50 p-6 text-center text-sm text-mist-500">
                                    Select a date above to see available time slots. We are closed on Sundays.
                                  </motion.p>
                                )}
                              </AnimatePresence>
                            </motion.div>
                          )}

                          {step === 2 && (
                            <motion.form
                              key="s2"
                              id="meeting-form"
                              onSubmit={confirm}
                              noValidate
                              initial={{ opacity: 0, x: 40 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -40 }}
                              transition={{ duration: 0.35 }}
                              className="space-y-5"
                            >
                              <h2 className="text-2xl font-semibold">Almost there — who are we meeting?</h2>
                              <div>
                                <label className="label" htmlFor="m-name">Full name</label>
                                <input id="m-name" className={`input ${errors.name ? '!border-rose-400' : ''}`} value={form.name} onChange={setField('name')} placeholder="Jane Doe" autoComplete="name" />
                                {errors.name && <p className="mt-1 text-xs text-rose-500">{errors.name}</p>}
                              </div>
                              <div className="grid gap-5 sm:grid-cols-2">
                                <div>
                                  <label className="label" htmlFor="m-email">Email</label>
                                  <input id="m-email" type="email" className={`input ${errors.email ? '!border-rose-400' : ''}`} value={form.email} onChange={setField('email')} placeholder="you@email.com" autoComplete="email" />
                                  {errors.email && <p className="mt-1 text-xs text-rose-500">{errors.email}</p>}
                                </div>
                                <div>
                                  <label className="label" htmlFor="m-phone">Phone</label>
                                  <input id="m-phone" type="tel" className={`input ${errors.phone ? '!border-rose-400' : ''}`} value={form.phone} onChange={setField('phone')} placeholder="+1 555 000 0000" autoComplete="tel" />
                                  {errors.phone && <p className="mt-1 text-xs text-rose-500">{errors.phone}</p>}
                                </div>
                              </div>
                              <div>
                                <label className="label" htmlFor="m-note">Anything we should prepare? (optional)</label>
                                <textarea id="m-note" rows={3} className="input resize-none" value={form.note} onChange={setField('note')} placeholder="Budget, preferred area, properties you like…" />
                              </div>
                            </motion.form>
                          )}
                        </AnimatePresence>
                      </div>

                      <div className="flex items-center justify-between border-t border-mist-100 bg-mist-50 px-6 py-5 sm:px-10">
                        <button
                          type="button"
                          onClick={() => setStep((s) => Math.max(0, s - 1))}
                          disabled={step === 0}
                          className="inline-flex items-center gap-2 text-sm font-semibold text-mist-600 transition hover:text-navy-900 disabled:invisible"
                        >
                          <Icon name="chevron-left" className="h-4 w-4" />
                          Back
                        </button>
                        {step < 2 ? (
                          <button type="button" disabled={!canNext} onClick={() => setStep((s) => s + 1)} className="btn-primary">
                            Continue
                            <Icon name="arrow-right" className="h-4 w-4" />
                          </button>
                        ) : (
                          <button type="submit" form="meeting-form" disabled={busy} className="btn-primary">
                            {busy ? 'Booking…' : 'Confirm booking'}
                            <Icon name="check" className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* ---------------- Ticket ---------------- */}
            <aside className="lg:col-span-2">
              <div className="lg:sticky lg:top-28">
                <motion.div layout className="relative overflow-hidden rounded-[2rem] bg-navy-900 text-white shadow-2xl shadow-navy-900/30">
                  <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-navy-500/30 blur-3xl" />
                  <div className="relative p-8">
                    <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-navy-200">Meeting pass</p>
                    <h3 className="mt-2 font-display text-2xl font-semibold !text-white">{settings.company}</h3>
                    <p className="mt-1 text-sm text-white/60">{typeInfo ? `${typeInfo.duration} · ${typeInfo.id}` : 'Choose a meeting type to begin'}</p>
                  </div>

                  <div className="relative flex items-center">
                    <span className="absolute -left-3 h-6 w-6 rounded-full bg-mist-50" />
                    <span className="absolute -right-3 h-6 w-6 rounded-full bg-mist-50" />
                    <span className="mx-6 w-full border-t-2 border-dashed border-white/20" />
                  </div>

                  <dl className="relative space-y-5 p-8">
                    {ticketRows.map(([k, v, icon]) => (
                      <div key={k} className="flex items-start gap-4">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
                          <Icon name={icon} className="h-5 w-5 text-navy-200" />
                        </span>
                        <div className="min-w-0">
                          <dt className="text-[11px] font-bold uppercase tracking-widest text-white/40">{k}</dt>
                          <AnimatePresence mode="wait" initial={false}>
                            <motion.dd
                              key={v || 'empty'}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -8 }}
                              transition={{ duration: 0.2 }}
                              className={`mt-0.5 text-sm font-semibold ${v ? 'text-white' : 'text-white/30'}`}
                            >
                              {v || 'Not selected yet'}
                            </motion.dd>
                          </AnimatePresence>
                        </div>
                      </div>
                    ))}
                  </dl>

                  <div className="relative flex items-end justify-between border-t border-white/10 bg-white/5 px-8 py-5">
                    <div>
                      <p className="text-[11px] uppercase tracking-widest text-white/40">Reference</p>
                      <p className="font-mono text-sm font-bold tracking-widest">{booking ? booking.ref : 'AUR-••••'}</p>
                    </div>
                    <div className="flex h-10 items-end gap-[3px]" aria-hidden="true">
                      {[14, 28, 18, 34, 22, 30, 12, 26, 36, 16, 30, 20].map((h, i) => (
                        <span key={i} className="w-[3px] rounded-sm bg-white/70" style={{ height: h }} />
                      ))}
                    </div>
                  </div>
                </motion.div>

                <p className="mt-5 flex items-start gap-2 px-2 text-xs text-mist-500">
                  <Icon name="shield" className="mt-0.5 h-4 w-4 shrink-0 text-navy-500" />
                  Free to book and reschedule. Your details are only used to arrange this meeting.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
