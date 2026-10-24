import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Icon from '../components/Icon.jsx';
import { AnimatedNumber, PageHero, Reveal } from '../components/ui.jsx';
import { useMoney } from '../store/StoreContext.jsx';
import { IMAGES } from '../data/seed.js';

function SliderField({ label, value, onChange, min, max, step = 1, format = (v) => v, hint }) {
  const clamp = (v) => Math.min(max, Math.max(min, Number.isFinite(v) ? v : min));
  // free typing while focused; the value is clamped to range when the box loses focus
  const [draft, setDraft] = useState(null);
  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-4">
        <label className="text-sm font-semibold text-navy-900">{label}</label>
        <input
          type="number"
          value={draft ?? value}
          min={min}
          max={max}
          step={step}
          aria-label={label}
          onChange={(e) => {
            setDraft(e.target.value);
            const n = Number(e.target.value);
            if (e.target.value !== '' && Number.isFinite(n) && n >= min && n <= max) onChange(n);
          }}
          onBlur={() => {
            if (draft !== null) onChange(clamp(draft === '' ? min : Number(draft)));
            setDraft(null);
          }}
          className="w-32 rounded-lg border border-mist-200 bg-mist-50 px-3 py-1.5 text-right text-sm font-bold text-navy-900 outline-none focus:border-navy-500"
        />
      </div>
      <input type="range" min={min} max={max} step={step} value={value} aria-label={`${label} slider`} onChange={(e) => onChange(Number(e.target.value))} />
      <div className="mt-2 flex justify-between text-xs text-mist-400">
        <span>{format(min)}</span>
        {hint && <span className="font-semibold text-navy-500">{hint}</span>}
        <span>{format(max)}</span>
      </div>
    </div>
  );
}

function monthlyPayment(principal, annualRate, years) {
  const n = Math.round(years * 12);
  const r = annualRate / 100 / 12;
  if (n <= 0 || principal <= 0) return 0;
  if (r === 0) return principal / n;
  const f = (1 + r) ** n;
  return (principal * r * f) / (f - 1);
}

function balanceAfter(principal, annualRate, years, months) {
  const n = Math.round(years * 12);
  const r = annualRate / 100 / 12;
  if (r === 0) return Math.max(0, principal * (1 - months / n));
  const f = (1 + r) ** n;
  const fk = (1 + r) ** months;
  return Math.max(0, (principal * (f - fk)) / (f - 1));
}

function Donut({ a, b, labelA, labelB, colorA = '#fff', colorB = '#5A7FB5' }) {
  const total = a + b || 1;
  const r = 70;
  const c = 2 * Math.PI * r;
  const aLen = (a / total) * c;
  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 180 180" className="h-36 w-36 shrink-0 -rotate-90">
        <circle cx="90" cy="90" r={r} fill="none" stroke={colorB} strokeWidth="22" />
        <motion.circle
          cx="90"
          cy="90"
          r={r}
          fill="none"
          stroke={colorA}
          strokeWidth="22"
          strokeDasharray={`${aLen} ${c}`}
          initial={false}
          animate={{ strokeDasharray: `${aLen} ${c}` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </svg>
      <ul className="space-y-3 text-sm">
        <li className="flex items-center gap-3 text-white/80">
          <span className="h-3 w-3 rounded-full" style={{ background: colorA }} />
          {labelA}
        </li>
        <li className="flex items-center gap-3 text-white/80">
          <span className="h-3 w-3 rounded-full" style={{ background: colorB }} />
          {labelB}
        </li>
      </ul>
    </div>
  );
}

function BalanceChart({ principal, rate, years }) {
  const W = 560;
  const H = 200;
  const pts = Array.from({ length: Math.round(years) + 1 }, (_, i) => balanceAfter(principal, rate, years, i * 12));
  const max = principal || 1;
  const x = (i) => (i / Math.max(1, pts.length - 1)) * W;
  const y = (v) => 8 + (1 - v / max) * (H - 24);
  const line = pts.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Loan balance over time">
      <defs>
        <linearGradient id="bal-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${line} L${W},${H - 16} L0,${H - 16} Z`} fill="url(#bal-fill)" />
      <path d={line} fill="none" stroke="#fff" strokeWidth="2.5" strokeLinejoin="round" />
      <text x="0" y={H - 2} fontSize="11" fill="rgba(255,255,255,0.5)">
        Today
      </text>
      <text x={W} y={H - 2} fontSize="11" fill="rgba(255,255,255,0.5)" textAnchor="end">
        Year {Math.round(years)}
      </text>
    </svg>
  );
}

export default function Calculator() {
  const { money, compact } = useMoney();
  const [tab, setTab] = useState('mortgage');

  // Mortgage
  const [price, setPrice] = useState(500000);
  const [down, setDown] = useState(20);
  const [rate, setRate] = useState(6.5);
  const [years, setYears] = useState(25);

  // ROI
  const [rPrice, setRPrice] = useState(500000);
  const [rent, setRent] = useState(3000);
  const [exp, setExp] = useState(20);
  const [growth, setGrowth] = useState(4);
  const [hold, setHold] = useState(5);

  const m = useMemo(() => {
    const downAmt = (price * down) / 100;
    const loan = price - downAmt;
    const monthly = monthlyPayment(loan, rate, years);
    const total = monthly * years * 12;
    const rows = Array.from({ length: years }, (_, i) => {
      const startBal = balanceAfter(loan, rate, years, i * 12);
      const endBal = balanceAfter(loan, rate, years, (i + 1) * 12);
      const paid = monthly * 12;
      const principalPaid = startBal - endBal;
      return { year: i + 1, principalPaid, interestPaid: Math.max(0, paid - principalPaid), balance: endBal };
    });
    return { downAmt, loan, monthly, total, interest: Math.max(0, total - loan), rows };
  }, [price, down, rate, years]);

  const roi = useMemo(() => {
    const annualRent = rent * 12;
    const netIncome = annualRent * (1 - exp / 100);
    const futureValue = rPrice * (1 + growth / 100) ** hold;
    const gain = futureValue - rPrice;
    const incomeTotal = netIncome * hold;
    const totalReturn = gain + incomeTotal;
    return {
      gross: rPrice ? (annualRent / rPrice) * 100 : 0,
      net: rPrice ? (netIncome / rPrice) * 100 : 0,
      netIncome,
      futureValue,
      gain,
      incomeTotal,
      totalReturn,
      annualised: rPrice && hold ? (totalReturn / rPrice / hold) * 100 : 0,
    };
  }, [rPrice, rent, exp, growth, hold]);

  return (
    <>
      <PageHero
        eyebrow="Calculator"
        title="Know your numbers before you decide"
        text="Estimate mortgage payments and rental returns instantly — no sign-up required."
        image={IMAGES.living}
      />

      <section className="bg-mist-50 pb-24">
        <div className="container-x">
          <div className="relative z-20 -mt-8 mb-10 flex w-fit gap-1 rounded-full border border-mist-200 bg-white p-1.5 shadow-xl shadow-navy-900/10">
            {[
              ['mortgage', 'Mortgage', 'calc'],
              ['roi', 'Rental ROI', 'trending'],
            ].map(([id, label, icon]) => (
              <button key={id} type="button" onClick={() => setTab(id)} className="relative flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold">
                {tab === id && (
                  <motion.span layoutId="calc-tab" className="absolute inset-0 rounded-full bg-navy-900" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />
                )}
                <Icon name={icon} className={`relative h-4 w-4 ${tab === id ? 'text-white' : 'text-mist-500'}`} />
                <span className={`relative ${tab === id ? 'text-white' : 'text-mist-600'}`}>{label}</span>
              </button>
            ))}
          </div>

          {tab === 'mortgage' ? (
            <div key="mortgage" className="grid gap-8 lg:grid-cols-5">
              <Reveal className="lg:col-span-2">
                <div className="space-y-8 rounded-[2rem] border border-mist-200 bg-white p-8 shadow-sm">
                  <SliderField label="Property price" value={price} onChange={setPrice} min={50000} max={5000000} step={10000} format={compact} />
                  <SliderField label="Down payment (%)" value={down} onChange={setDown} min={5} max={60} step={1} format={(v) => `${v}%`} hint={money(m.downAmt)} />
                  <SliderField label="Interest rate (% / yr)" value={rate} onChange={setRate} min={1} max={20} step={0.1} format={(v) => `${v}%`} />
                  <SliderField label="Loan term (years)" value={years} onChange={setYears} min={5} max={30} step={1} format={(v) => `${v} yrs`} />
                </div>
              </Reveal>

              <Reveal delay={0.1} className="lg:col-span-3">
                <div className="relative h-full overflow-hidden rounded-[2rem] bg-navy-900 p-8 text-white">
                  <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-navy-500/30 blur-3xl" />
                  <p className="relative text-xs font-bold uppercase tracking-[0.25em] text-navy-200">Estimated monthly payment</p>
                  <p className="relative mt-2 font-display text-5xl font-semibold sm:text-6xl">
                    <AnimatedNumber value={m.monthly} format={(v) => money(v)} />
                  </p>

                  <div className="relative mt-8 grid gap-4 sm:grid-cols-3">
                    {[
                      ['Loan amount', m.loan],
                      ['Total interest', m.interest],
                      ['Total repaid', m.total],
                    ].map(([k, v]) => (
                      <div key={k} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="text-xs uppercase tracking-wider text-white/50">{k}</p>
                        <p className="mt-1 text-lg font-semibold">
                          <AnimatedNumber value={v} format={(x) => compact(x)} />
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="relative mt-8 grid items-center gap-8 sm:grid-cols-2">
                    <Donut a={m.loan} b={m.interest} labelA="Principal" labelB="Interest" />
                    <div>
                      <p className="mb-2 text-xs font-bold uppercase tracking-widest text-white/50">Loan balance</p>
                      <BalanceChart principal={m.loan} rate={rate} years={years} />
                    </div>
                  </div>
                </div>
              </Reveal>

              <Reveal className="lg:col-span-5">
                <div className="overflow-hidden rounded-[2rem] border border-mist-200 bg-white">
                  <div className="flex items-center justify-between border-b border-mist-100 px-8 py-5">
                    <h3 className="text-xl font-semibold">Year-by-year breakdown</h3>
                    <Link to="/meeting" className="text-sm font-semibold text-navy-500 hover:text-navy-900">
                      Talk to a financing advisor →
                    </Link>
                  </div>
                  <div className="max-h-72 overflow-auto">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-mist-50 text-left text-xs uppercase tracking-wider text-mist-500">
                        <tr>
                          <th className="px-8 py-3">Year</th>
                          <th className="px-4 py-3">Principal paid</th>
                          <th className="px-4 py-3">Interest paid</th>
                          <th className="px-8 py-3 text-right">Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {m.rows.map((r) => (
                          <tr key={r.year} className="border-t border-mist-100 hover:bg-mist-50">
                            <td className="px-8 py-3 font-semibold text-navy-900">{r.year}</td>
                            <td className="px-4 py-3">{money(r.principalPaid)}</td>
                            <td className="px-4 py-3">{money(r.interestPaid)}</td>
                            <td className="px-8 py-3 text-right font-semibold text-navy-900">{money(r.balance)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </Reveal>
            </div>
          ) : (
            <div key="roi" className="grid gap-8 lg:grid-cols-5">
              <Reveal className="lg:col-span-2">
                <div className="space-y-8 rounded-[2rem] border border-mist-200 bg-white p-8 shadow-sm">
                  <SliderField label="Purchase price" value={rPrice} onChange={setRPrice} min={50000} max={5000000} step={10000} format={compact} />
                  <SliderField label="Monthly rent" value={rent} onChange={setRent} min={200} max={50000} step={100} format={compact} />
                  <SliderField label="Running costs (% of rent)" value={exp} onChange={setExp} min={0} max={60} step={1} format={(v) => `${v}%`} />
                  <SliderField label="Value growth (% / yr)" value={growth} onChange={setGrowth} min={0} max={15} step={0.5} format={(v) => `${v}%`} />
                  <SliderField label="Holding period (years)" value={hold} onChange={setHold} min={1} max={20} step={1} format={(v) => `${v} yrs`} />
                </div>
              </Reveal>

              <Reveal delay={0.1} className="lg:col-span-3">
                <div className="relative h-full overflow-hidden rounded-[2rem] bg-navy-900 p-8 text-white">
                  <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-navy-500/30 blur-3xl" />
                  <p className="relative text-xs font-bold uppercase tracking-[0.25em] text-navy-200">Net rental yield</p>
                  <p className="relative mt-2 font-display text-5xl font-semibold sm:text-6xl">
                    <AnimatedNumber value={roi.net} format={(v) => `${v.toFixed(2)}%`} />
                  </p>
                  <p className="relative mt-1 text-sm text-white/60">
                    Gross yield <AnimatedNumber value={roi.gross} format={(v) => `${v.toFixed(2)}%`} /> · annualised total return{' '}
                    <AnimatedNumber value={roi.annualised} format={(v) => `${v.toFixed(2)}%`} />
                  </p>

                  <div className="relative mt-8 grid gap-4 sm:grid-cols-2">
                    {[
                      ['Net income per year', roi.netIncome],
                      [`Property value in ${hold} yrs`, roi.futureValue],
                      ['Capital gain', roi.gain],
                      ['Total net rent earned', roi.incomeTotal],
                    ].map(([k, v]) => (
                      <div key={k} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                        <p className="text-xs uppercase tracking-wider text-white/50">{k}</p>
                        <p className="mt-1 text-xl font-semibold">
                          <AnimatedNumber value={v} format={(x) => money(x)} />
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="relative mt-8 rounded-2xl bg-white p-6 text-navy-900">
                    <p className="text-xs font-bold uppercase tracking-widest text-mist-500">Total projected return</p>
                    <p className="mt-1 font-display text-4xl font-semibold">
                      <AnimatedNumber value={roi.totalReturn} format={(v) => money(v)} />
                    </p>
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-mist-100">
                      <motion.div
                        className="h-full rounded-full bg-navy-900"
                        animate={{ width: `${Math.min(100, (roi.gain / Math.max(1, roi.totalReturn)) * 100)}%` }}
                        transition={{ duration: 0.6 }}
                      />
                    </div>
                    <div className="mt-2 flex justify-between text-xs text-mist-500">
                      <span>Capital gain</span>
                      <span>Rental income</span>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          )}

          <p className="mt-8 text-center text-xs text-mist-400">
            Calculations are estimates for guidance only and do not constitute financial advice or a loan offer.
          </p>
        </div>
      </section>
    </>
  );
}
