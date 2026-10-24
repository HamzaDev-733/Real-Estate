import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Icon from '../components/Icon.jsx';
import { AnimatedNumber, Counter, PageHero, Reveal, SectionTitle } from '../components/ui.jsx';
import { useMoney } from '../store/StoreContext.jsx';
import { IMAGES } from '../data/seed.js';

const PLANS = [
  {
    id: 'income',
    name: 'Income Builder',
    rate: 0.08,
    term: 3,
    min: 25000,
    tag: 'Steady rental income',
    points: ['Fractional rental portfolio', 'Quarterly payouts', 'Lowest volatility', 'Exit after 3 years'],
  },
  {
    id: 'growth',
    name: 'Growth Core',
    rate: 0.11,
    term: 5,
    min: 75000,
    tag: 'Balanced yield + appreciation',
    points: ['Off-plan project allocation', 'Milestone-linked entry pricing', 'Semi-annual reporting', 'Priority resale support'],
    popular: true,
  },
  {
    id: 'prime',
    name: 'Prime Capital',
    rate: 0.14,
    term: 7,
    min: 250000,
    tag: 'Maximum capital growth',
    points: ['Landmark development stakes', 'Dedicated portfolio advisor', 'Early-access launches', 'Custom exit strategy'],
  },
];

const BENEFITS = [
  { icon: 'shield', title: 'Asset-backed', text: 'Every plan is secured against physical, title-verified real estate.' },
  { icon: 'layers', title: 'Diversified', text: 'Spread across residential, commercial and off-plan developments.' },
  { icon: 'trending', title: 'Transparent reporting', text: 'Clear statements on valuation, occupancy and yield — every period.' },
];

const FAQS = [
  ['Are returns guaranteed?', 'No. The figures shown are illustrative projections based on historical performance and current assumptions. Property values and rents can go up as well as down.'],
  ['Who can invest?', 'Individuals and companies. Minimum amounts depend on the plan, and we complete a standard identity and source-of-funds check.'],
  ['Can I exit early?', 'Yes. Early exits are possible subject to resale demand and plan terms. Your advisor will explain liquidity options before you commit.'],
  ['How are payouts made?', 'Income plans pay quarterly to your nominated account. Growth plans realise most returns at exit or on project handover.'],
  ['Do you charge fees?', 'A transparent management fee is deducted from income and disclosed in your agreement. There are no hidden entry or exit charges.'],
];

function Chart({ points, planId }) {
  const W = 640;
  const H = 280;
  const pad = { l: 12, r: 12, t: 20, b: 34 };
  const max = Math.max(...points.map((p) => p.v)) || 1;
  const min = points[0].v;
  const x = (i) => pad.l + (i / (points.length - 1)) * (W - pad.l - pad.r);
  const y = (v) => pad.t + (1 - (v - min * 0.9) / (max - min * 0.9)) * (H - pad.t - pad.b);
  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(p.v).toFixed(1)}`).join(' ');
  const area = `${line} L${x(points.length - 1).toFixed(1)},${H - pad.b} L${x(0).toFixed(1)},${H - pad.b} Z`;
  const step = Math.max(1, Math.ceil((points.length - 1) / 7));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Projected investment growth chart">
      <defs>
        <linearGradient id="inv-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#8CA5CB" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#8CA5CB" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 1, 2, 3].map((i) => {
        const gy = pad.t + (i / 3) * (H - pad.t - pad.b);
        return <line key={i} x1={pad.l} x2={W - pad.r} y1={gy} y2={gy} stroke="rgba(255,255,255,0.1)" strokeDasharray="4 6" />;
      })}
      <path d={area} fill="url(#inv-fill)" />
      <motion.path
        key={planId}
        d={line}
        fill="none"
        stroke="#fff"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.1, ease: 'easeOut' }}
      />
      {points.map((p, i) =>
        i % step === 0 || i === points.length - 1 ? (
          <g key={i}>
            <circle cx={x(i)} cy={y(p.v)} r={i === points.length - 1 ? 6 : 3.5} fill="#fff" />
            <text x={x(i)} y={H - 10} textAnchor="middle" fontSize="11" fill="rgba(255,255,255,0.55)">
              {i === 0 ? 'Now' : `Y${i}`}
            </text>
          </g>
        ) : null,
      )}
    </svg>
  );
}

export default function Investment() {
  const { money, compact } = useMoney();
  const [planId, setPlanId] = useState('growth');
  const plan = PLANS.find((p) => p.id === planId);
  const [amount, setAmount] = useState(100000);
  const [years, setYears] = useState(5);
  const [open, setOpen] = useState(0);

  const safeAmount = Math.max(amount, plan.min);
  const points = useMemo(
    () => Array.from({ length: years + 1 }, (_, i) => ({ y: i, v: safeAmount * (1 + plan.rate) ** i })),
    [safeAmount, years, plan.rate],
  );
  const finalValue = points[points.length - 1].v;
  const profit = finalValue - safeAmount;

  const pick = (p) => {
    setPlanId(p.id);
    setYears(p.term);
    setAmount((a) => Math.max(a, p.min));
  };

  return (
    <>
      <PageHero
        eyebrow="Investment"
        title="Put your capital to work in real assets"
        text="Choose a plan, model your returns and speak to an advisor — all in one place."
        image={IMAGES.office}
      />

      {/* ------- Plans ------- */}
      <section className="bg-white py-24">
        <div className="container-x">
          <SectionTitle eyebrow="Investment plans" title="Three ways to invest, one standard of care" />
          <div className="grid gap-6 lg:grid-cols-3">
            {PLANS.map((p, i) => {
              const active = p.id === planId;
              return (
                <Reveal key={p.id} delay={i * 0.1}>
                  <motion.div
                    whileHover={{ y: -10 }}
                    onClick={() => pick(p)}
                    className={`relative h-full cursor-pointer overflow-hidden rounded-[2rem] border p-8 transition-colors duration-500 ${
                      active ? 'border-navy-900 bg-navy-900 text-white shadow-2xl shadow-navy-900/25' : 'border-mist-200 bg-white hover:border-navy-300'
                    }`}
                  >
                    {p.popular && (
                      <span className="absolute right-6 top-6 rounded-full bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-navy-900">
                        Most popular
                      </span>
                    )}
                    <p className={`text-xs font-bold uppercase tracking-[0.25em] ${active ? 'text-navy-200' : 'text-navy-500'}`}>{p.tag}</p>
                    <h3 className={`mt-3 text-2xl font-semibold ${active ? '!text-white' : ''}`}>{p.name}</h3>
                    <p className={`mt-6 font-display text-6xl font-semibold ${active ? 'text-white' : 'text-navy-900'}`}>
                      {Math.round(p.rate * 100)}
                      <span className="text-3xl">%</span>
                    </p>
                    <p className={`text-sm ${active ? 'text-white/60' : 'text-mist-500'}`}>illustrative annual return · {p.term}-year term</p>
                    <p className={`mt-4 text-sm font-semibold ${active ? 'text-white' : 'text-navy-900'}`}>From {compact(p.min)}</p>
                    <ul className="mt-6 space-y-3 text-sm">
                      {p.points.map((pt) => (
                        <li key={pt} className="flex items-start gap-3">
                          <Icon name="check" className={`mt-0.5 h-4 w-4 shrink-0 ${active ? 'text-navy-200' : 'text-navy-500'}`} />
                          <span className={active ? 'text-white/80' : ''}>{pt}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      className={`mt-8 w-full ${active ? 'btn-light' : 'btn-outline'}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        pick(p);
                        document.getElementById('projection')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }}
                    >
                      Model this plan
                    </button>
                  </motion.div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ------- Projection ------- */}
      <section id="projection" className="relative overflow-hidden bg-navy-900 py-24">
        <div className="pointer-events-none absolute -left-24 top-0 h-96 w-96 rounded-full bg-navy-500/20 blur-3xl" />
        <div className="container-x relative">
          <SectionTitle light eyebrow="Return projector" title="See how your capital could grow" text="Illustrative only — projections are not guarantees." />
          <div className="grid gap-8 lg:grid-cols-5">
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-7 backdrop-blur lg:col-span-2">
              <div className="space-y-8">
                <div>
                  <div className="mb-3 flex justify-between text-sm">
                    <span className="font-semibold text-white/70">Investment amount</span>
                    <span className="font-bold text-white">{money(safeAmount)}</span>
                  </div>
                  <input
                    type="range"
                    min={plan.min}
                    max={1000000}
                    step={5000}
                    value={safeAmount}
                    aria-label="Investment amount"
                    onChange={(e) => setAmount(Number(e.target.value))}
                  />
                  <div className="mt-2 flex justify-between text-xs text-white/40">
                    <span>{compact(plan.min)}</span>
                    <span>{compact(1000000)}</span>
                  </div>
                </div>
                <div>
                  <div className="mb-3 flex justify-between text-sm">
                    <span className="font-semibold text-white/70">Holding period</span>
                    <span className="font-bold text-white">{years} years</span>
                  </div>
                  <input type="range" min={1} max={15} step={1} value={years} aria-label="Holding period in years" onChange={(e) => setYears(Number(e.target.value))} />
                  <div className="mt-2 flex justify-between text-xs text-white/40">
                    <span>1 yr</span>
                    <span>15 yrs</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {PLANS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => pick(p)}
                      className={`rounded-2xl border px-2 py-3 text-xs font-bold transition ${
                        p.id === planId ? 'border-white bg-white text-navy-900' : 'border-white/15 text-white/70 hover:border-white/50'
                      }`}
                    >
                      {p.name}
                      <span className="block font-medium opacity-70">{Math.round(p.rate * 100)}% p.a.</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-7 backdrop-blur lg:col-span-3">
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs uppercase tracking-widest text-white/50">Projected value</p>
                  <p className="mt-1 font-display text-3xl font-semibold text-white">
                    <AnimatedNumber value={finalValue} format={(v) => money(v)} />
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-white/50">Projected gain</p>
                  <p className="mt-1 font-display text-3xl font-semibold text-white">
                    <AnimatedNumber value={profit} format={(v) => money(v)} />
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-white/50">Multiple</p>
                  <p className="mt-1 font-display text-3xl font-semibold text-white">
                    <AnimatedNumber value={finalValue / safeAmount} format={(v) => `${v.toFixed(2)}x`} />
                  </p>
                </div>
              </div>
              <div className="mt-6">
                <Chart points={points} planId={planId} />
              </div>
              <p className="mt-4 text-xs leading-relaxed text-white/45">
                Assumes {Math.round(plan.rate * 100)}% annual compounding with income reinvested. Capital is at risk; past performance
                does not guarantee future results.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ------- Benefits + stats ------- */}
      <section className="bg-white py-24">
        <div className="container-x">
          <div className="grid gap-6 md:grid-cols-3">
            {BENEFITS.map((b, i) => (
              <Reveal key={b.title} delay={i * 0.1}>
                <div className="h-full rounded-3xl bg-mist-50 p-8 transition-all duration-500 hover:-translate-y-2 hover:bg-white hover:shadow-xl hover:shadow-navy-900/10">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-900 text-white">
                    <Icon name={b.icon} className="h-7 w-7" />
                  </span>
                  <h3 className="mt-6 text-xl font-semibold">{b.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed">{b.text}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="mt-16 grid grid-cols-2 gap-8 border-y border-mist-200 py-12 text-center lg:grid-cols-4">
            {[
              [320, 'M+', 'Capital managed'],
              [4200, '+', 'Active investors'],
              [11, '%', 'Average yearly return*'],
              [0, '', 'Hidden fees'],
            ].map(([n, s, l]) => (
              <div key={l}>
                <p className="font-display text-4xl font-semibold text-navy-900 sm:text-5xl">
                  <Counter to={n} suffix={s} />
                </p>
                <p className="mt-2 text-xs uppercase tracking-widest text-mist-500">{l}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-center text-xs text-mist-400">*Illustrative demo figure. Not a promise of future performance.</p>
        </div>
      </section>

      {/* ------- FAQ ------- */}
      <section className="bg-mist-50 py-24">
        <div className="container-x max-w-3xl">
          <SectionTitle eyebrow="Investor FAQ" title="Questions, answered plainly" />
          <div className="space-y-3">
            {FAQS.map(([q, a], i) => {
              const isOpen = open === i;
              return (
                <Reveal key={q} delay={i * 0.05}>
                  <div className="overflow-hidden rounded-2xl border border-mist-200 bg-white">
                    <button
                      type="button"
                      onClick={() => setOpen(isOpen ? -1 : i)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left font-semibold text-navy-900"
                    >
                      {q}
                      <motion.span animate={{ rotate: isOpen ? 180 : 0 }} className="shrink-0 text-navy-500">
                        <Icon name="chevron-down" />
                      </motion.span>
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.35 }}
                          className="overflow-hidden"
                        >
                          <p className="px-6 pb-6 text-sm leading-relaxed">{a}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </Reveal>
              );
            })}
          </div>
          <Reveal className="mt-12 text-center">
            <Link to="/meeting" className="btn-primary">
              <Icon name="calendar" className="h-4 w-4" />
              Book an investment consultation
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
