import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Icon from '../components/Icon.jsx';
import { Badge, Img, Modal, PageHero, Reveal, SectionTitle, statusTone } from '../components/ui.jsx';
import { useMoney, useStore } from '../store/StoreContext.jsx';
import { DEPLOYMENT_PHASES, IMAGES, PROJECT_STATUS } from '../data/seed.js';

const phaseIndex = (progress) => Math.min(DEPLOYMENT_PHASES.length - 1, Math.floor((Number(progress) || 0) / 20));

function ProgressRing({ value, size = 88 }) {
  const r = 36;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 88 88" className="h-full w-full -rotate-90">
        <circle cx="44" cy="44" r={r} fill="none" strokeWidth="7" className="stroke-mist-200" />
        <motion.circle
          cx="44"
          cy="44"
          r={r}
          fill="none"
          strokeWidth="7"
          strokeLinecap="round"
          className="stroke-navy-900"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          whileInView={{ strokeDashoffset: c * (1 - Math.min(100, Math.max(0, value)) / 100) }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-display text-lg font-semibold text-navy-900">{value}%</span>
    </div>
  );
}

function PhaseDots({ progress }) {
  const current = phaseIndex(progress);
  return (
    <div className="flex items-center gap-1.5" aria-label={`Phase: ${DEPLOYMENT_PHASES[current].name}`}>
      {DEPLOYMENT_PHASES.map((p, i) => (
        <span
          key={p.name}
          title={p.name}
          className={`h-1.5 flex-1 rounded-full transition-colors ${i < current ? 'bg-navy-900' : i === current ? 'bg-navy-500' : 'bg-mist-200'}`}
        />
      ))}
    </div>
  );
}

export default function Projects() {
  const { projects } = useStore();
  const { compact } = useMoney();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');
  const [selected, setSelected] = useState(null);

  const list = filter === 'All' ? projects : projects.filter((p) => p.status === filter);
  const sel = selected ? projects.find((p) => p.id === selected) : null;
  const [lastSel, setLastSel] = useState(null);
  const shown = sel || lastSel;

  const open = (p) => {
    setLastSel(p);
    setSelected(p.id);
  };

  return (
    <>
      <PageHero
        eyebrow="Projects & deployment"
        title="Watch every landmark take shape"
        text="Live construction progress, deployment phases and handover dates — fully transparent."
        image={IMAGES.skyline}
      />

      {/* ------------- Projects ------------- */}
      <section className="bg-white py-20">
        <div className="container-x">
          <div className="mb-10 flex flex-wrap gap-2">
            {['All', ...PROJECT_STATUS].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setFilter(s)}
                className="relative rounded-full px-5 py-2.5 text-sm font-semibold"
              >
                {filter === s && (
                  <motion.span layoutId="proj-filter" className="absolute inset-0 rounded-full bg-navy-900" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />
                )}
                <span className={`relative transition-colors ${filter === s ? 'text-white' : 'text-mist-600 hover:text-navy-900'}`}>{s}</span>
              </button>
            ))}
          </div>

          <div className="space-y-8">
            <AnimatePresence mode="popLayout">
              {list.map((p, i) => (
                <motion.article
                  key={p.id}
                  layout
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.6, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                  className="group grid overflow-hidden rounded-[2rem] border border-mist-200 bg-white shadow-sm transition-shadow duration-500 hover:shadow-2xl hover:shadow-navy-900/10 lg:grid-cols-5"
                >
                  <div className={`relative min-h-[260px] overflow-hidden lg:col-span-2 ${i % 2 ? 'lg:order-2' : ''}`}>
                    <Img src={p.image} alt={p.name} className="absolute inset-0 transition-transform duration-[1200ms] group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-950/50 to-transparent" />
                    <Badge tone={statusTone(p.status)} className="absolute left-5 top-5">
                      {p.status}
                    </Badge>
                  </div>

                  <div className="flex flex-col justify-between p-7 sm:p-10 lg:col-span-3">
                    <div className="flex items-start justify-between gap-6">
                      <div>
                        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-navy-500">
                          <Icon name="pin" className="h-3.5 w-3.5" />
                          {p.location}
                        </p>
                        <h3 className="mt-2 text-3xl font-semibold">{p.name}</h3>
                      </div>
                      <ProgressRing value={Number(p.progress) || 0} />
                    </div>

                    <p className="mt-4 leading-relaxed">{p.description}</p>

                    <div className="mt-6 grid grid-cols-3 gap-4 border-y border-mist-100 py-5">
                      {[
                        ['Units', p.units],
                        ['From', compact(p.startingPrice)],
                        ['Handover', p.handover],
                      ].map(([k, v]) => (
                        <div key={k}>
                          <p className="text-xs uppercase tracking-wider text-mist-400">{k}</p>
                          <p className="mt-1 font-semibold text-navy-900">{v}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 space-y-4">
                      <div>
                        <div className="mb-2 flex justify-between text-xs font-semibold text-mist-500">
                          <span>Current phase</span>
                          <span className="text-navy-900">{DEPLOYMENT_PHASES[phaseIndex(p.progress)].name}</span>
                        </div>
                        <PhaseDots progress={p.progress} />
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <button type="button" onClick={() => open(p)} className="btn-primary">
                          Deployment details
                          <Icon name="arrow-right" className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate('/meeting', { state: { type: 'Office Visit', note: `Interested in ${p.name}` } })}
                          className="btn-outline"
                        >
                          <Icon name="calendar" className="h-4 w-4" />
                          Book a site visit
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </div>

          {list.length === 0 && <p className="py-16 text-center text-mist-500">No projects in this stage right now.</p>}
        </div>
      </section>

      {/* ------------- Deployment roadmap ------------- */}
      <section className="relative overflow-hidden bg-navy-900 py-24">
        <div className="pointer-events-none absolute -right-32 top-10 h-96 w-96 rounded-full bg-navy-500/20 blur-3xl" />
        <div className="container-x relative">
          <SectionTitle
            light
            eyebrow="Deployment roadmap"
            title="How every project is delivered"
            text="Five audited phases, the same rigorous standard on every site."
          />
          <div className="relative grid gap-6 md:grid-cols-5">
            <motion.div
              className="absolute left-[10%] right-[10%] top-7 hidden h-px origin-left bg-gradient-to-r from-white/60 to-white/10 md:block"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.6, ease: 'easeInOut' }}
            />
            {DEPLOYMENT_PHASES.map((ph, i) => (
              <Reveal key={ph.name} delay={i * 0.1} className="relative text-center">
                <motion.span
                  whileHover={{ scale: 1.12, backgroundColor: '#fff', color: '#0A1A33' }}
                  className="relative z-10 mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-white/30 bg-navy-800 font-display text-lg font-semibold text-white"
                >
                  {i + 1}
                </motion.span>
                <h3 className="mt-5 text-lg font-semibold !text-white">{ph.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">{ph.text}</p>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-14 text-center">
            <Link to="/investment" className="btn-light">
              Invest in an upcoming project
              <Icon name="arrow-right" className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ------------- Detail modal ------------- */}
      <Modal open={!!sel} onClose={() => setSelected(null)} maxWidth="max-w-3xl">
        {shown && (
          <div>
            <div className="relative aspect-[16/8] bg-navy-900">
              <Img src={shown.image} alt={shown.name} />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 to-transparent" />
              <div className="absolute bottom-5 left-6 right-6">
                <Badge tone={statusTone(shown.status)}>{shown.status}</Badge>
                <h2 className="mt-2 text-3xl font-semibold !text-white">{shown.name}</h2>
              </div>
            </div>
            <div className="p-6 sm:p-8">
              <p className="leading-relaxed">{shown.description}</p>
              <h4 className="mb-4 mt-8 font-sans text-xs font-bold uppercase tracking-[0.25em] text-navy-500">Deployment tracker</h4>
              <ol className="space-y-1">
                {DEPLOYMENT_PHASES.map((ph, i) => {
                  const cur = phaseIndex(shown.progress);
                  const done = i < cur || Number(shown.progress) >= 100;
                  const active = i === cur && !done;
                  return (
                    <li key={ph.name} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <span
                          className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-bold ${
                            done
                              ? 'border-navy-900 bg-navy-900 text-white'
                              : active
                                ? 'border-navy-500 bg-navy-50 text-navy-700'
                                : 'border-mist-200 text-mist-400'
                          }`}
                        >
                          {done ? <Icon name="check" className="h-4 w-4" strokeWidth={3} /> : i + 1}
                        </span>
                        {i < DEPLOYMENT_PHASES.length - 1 && <span className={`my-1 w-px flex-1 ${done ? 'bg-navy-900' : 'bg-mist-200'}`} />}
                      </div>
                      <div className="pb-5">
                        <p className={`font-semibold ${done || active ? 'text-navy-900' : 'text-mist-400'}`}>
                          {ph.name}
                          {active && <span className="ml-2 rounded-full bg-navy-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-navy-600">In progress</span>}
                        </p>
                        <p className="text-sm text-mist-500">{ph.text}</p>
                      </div>
                    </li>
                  );
                })}
              </ol>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => navigate('/meeting', { state: { type: 'Office Visit', note: `Interested in ${shown.name}` } })}
                >
                  <Icon name="calendar" className="h-4 w-4" />
                  Book a site visit
                </button>
                <button type="button" className="btn-outline" onClick={() => setSelected(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
