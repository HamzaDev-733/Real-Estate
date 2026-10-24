import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';
import Icon from '../components/Icon.jsx';
import PropertyCard from '../components/PropertyCard.jsx';
import ListingModal from '../components/ListingModal.jsx';
import { Badge, Counter, Img, Reveal, SectionTitle, WordReveal, statusTone } from '../components/ui.jsx';
import { useMoney, useStore } from '../store/StoreContext.jsx';
import { IMAGES, PROPERTY_TYPES } from '../data/seed.js';

const MARQUEE = [
  'Verified titles',
  'Transparent pricing',
  'Prime locations',
  'Expert advisors',
  'Flexible payment plans',
  'After-sales care',
  'Investment-grade assets',
  'Virtual tours',
];

const WHY = [
  { icon: 'shield', title: 'Verified & transparent', text: 'Every listing passes legal, title and pricing checks before it reaches you.' },
  { icon: 'trending', title: 'Investment minded', text: 'Yield modelling, market data and exit planning on every opportunity.' },
  { icon: 'users', title: 'Dedicated advisors', text: 'One senior advisor guides you from first viewing to the day you get the keys.' },
  { icon: 'clock', title: 'Fast, simple process', text: 'Book online, tour virtually, and complete paperwork digitally.' },
];

const STEPS = [
  { n: '01', title: 'Discover', text: 'Tell us your goals and budget. We shortlist the right properties.' },
  { n: '02', title: 'Visit', text: 'Tour in person or virtually with an advisor who knows every detail.' },
  { n: '03', title: 'Finance', text: 'Model payments, compare plans and secure the best terms.' },
  { n: '04', title: 'Move in', text: 'We handle documents, handover and after-sales support.' },
];

const TESTIMONIALS = [
  {
    quote: 'The whole process felt effortless. Our advisor found a penthouse we never would have discovered ourselves, and the paperwork was done in days.',
    name: 'Amelia R.',
    role: 'Penthouse owner',
  },
  {
    quote: 'Their investment modelling gave us real confidence. We now hold three rental units that outperform our original projections.',
    name: 'Karim S.',
    role: 'Portfolio investor',
  },
  {
    quote: 'Virtual tours meant we could buy from overseas without a single surprise on arrival. Genuinely premium service.',
    name: 'Julia & Marc T.',
    role: 'Villa buyers',
  },
];

export default function Home() {
  const { listings, projects, settings } = useStore();
  const { compact } = useMoney();
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const [purpose, setPurpose] = useState('Sale');
  const [type, setType] = useState('');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [tIndex, setTIndex] = useState(0);

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const imgY = useTransform(scrollYProgress, [0, 1], ['0%', '28%']);
  const imgScale = useTransform(scrollYProgress, [0, 1], [1.05, 1.25]);
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '-12%']);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  useEffect(() => {
    const id = setInterval(() => setTIndex((i) => (i + 1) % TESTIMONIALS.length), 7000);
    return () => clearInterval(id);
  }, []);

  const pool = listings.filter((l) => l.status !== 'Sold');
  const featured = [...pool.filter((l) => l.featured), ...pool.filter((l) => !l.featured)].slice(0, 3);
  const spotlight = projects.slice(0, 3);

  const search = (e) => {
    e.preventDefault();
    const p = new URLSearchParams();
    p.set('purpose', purpose);
    if (type) p.set('type', type);
    if (query.trim()) p.set('q', query.trim());
    navigate(`/listings?${p.toString()}`);
  };

  const t = TESTIMONIALS[tIndex];

  return (
    <>
      {/* ---------------- HERO ---------------- */}
      <section ref={heroRef} className="relative flex min-h-screen items-center overflow-hidden bg-navy-900">
        <motion.div style={{ y: imgY, scale: imgScale }} className="absolute inset-0">
          <Img src={settings.heroImage || IMAGES.hero} alt="Landmark glass building" loading="eager" fetchPriority="high" />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-b from-navy-950/75 via-navy-900/45 to-navy-950/95" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-950/60 via-transparent to-transparent" />

        <motion.div style={{ y: contentY, opacity: contentOpacity }} className="container-x relative z-10 pb-28 pt-40">
          <motion.span
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
            className="eyebrow !text-navy-200"
          >
            <span className="h-px w-8 bg-navy-200" />
            {settings.tagline}
          </motion.span>

          <WordReveal
            as="h1"
            text="Find the space that defines your future"
            delay={0.6}
            className="mt-5 max-w-4xl font-display text-5xl font-semibold leading-[1.05] !text-white sm:text-6xl lg:text-7xl"
          />

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="mt-6 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg"
          >
            Landmark towers, private villas and high-yield investments — curated, verified and delivered with
            uncompromising transparency.
          </motion.p>

          <motion.form
            onSubmit={search}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="mt-10 max-w-4xl rounded-3xl border border-white/25 bg-white/10 p-3 shadow-2xl shadow-navy-950/30 backdrop-blur-2xl"
          >
            <div className="mb-3 flex gap-1 rounded-full bg-white/10 p-1 sm:w-fit">
              {['Sale', 'Rent'].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPurpose(p)}
                  className="relative rounded-full px-6 py-2 text-sm font-semibold"
                >
                  {purpose === p && (
                    <motion.span
                      layoutId="hero-purpose"
                      className="absolute inset-0 rounded-full bg-white"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                  )}
                  <span className={`relative ${purpose === p ? 'text-navy-900' : 'text-white/80'}`}>{p === 'Sale' ? 'Buy' : 'Rent'}</span>
                </button>
              ))}
            </div>
            <div className="grid gap-3 md:grid-cols-[1.4fr_1fr_auto]">
              <label className="flex items-center gap-3 rounded-2xl bg-white/90 px-4 py-3.5">
                <Icon name="search" className="h-5 w-5 shrink-0 text-navy-500" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Location, project or keyword"
                  aria-label="Search location"
                  className="w-full bg-transparent text-sm text-navy-900 outline-none placeholder:text-mist-400"
                />
              </label>
              <label className="flex items-center gap-3 rounded-2xl bg-white/90 px-4 py-3.5">
                <Icon name="building" className="h-5 w-5 shrink-0 text-navy-500" />
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  aria-label="Property type"
                  className="w-full bg-transparent text-sm text-navy-900 outline-none"
                >
                  <option value="">All property types</option>
                  {PROPERTY_TYPES.map((t2) => (
                    <option key={t2} value={t2}>
                      {t2}
                    </option>
                  ))}
                </select>
              </label>
              <button type="submit" className="btn bg-navy-900 px-8 py-3.5 text-white hover:bg-navy-700">
                Search
                <Icon name="arrow-right" className="h-4 w-4" />
              </button>
            </div>
          </motion.form>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8, duration: 0.8 }}
          className="absolute inset-x-0 bottom-0 z-10"
        >
          <div className="container-x">
            <div className="grid grid-cols-3 divide-x divide-white/15 rounded-t-3xl border border-b-0 border-white/20 bg-white/10 backdrop-blur-xl">
              {[
                [1200, '+', 'Homes delivered'],
                [18, '', 'Landmark projects'],
                [98, '%', 'Client satisfaction'],
              ].map(([n, s, label]) => (
                <div key={label} className="px-3 py-5 text-center sm:px-8">
                  <p className="font-display text-2xl font-semibold text-white sm:text-4xl">
                    <Counter to={n} suffix={s} duration={2.4} />
                  </p>
                  <p className="mt-1 text-[11px] uppercase tracking-widest text-white/60 sm:text-xs">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ---------------- MARQUEE ---------------- */}
      <div className="overflow-hidden border-b border-mist-200 bg-white py-5">
        <div className="flex w-max animate-marquee gap-12">
          {[...MARQUEE, ...MARQUEE].map((m, i) => (
            <span key={i} className="flex items-center gap-12 whitespace-nowrap font-display text-lg text-mist-400">
              {m}
              <span className="h-1.5 w-1.5 rounded-full bg-navy-300" />
            </span>
          ))}
        </div>
      </div>

      {/* ---------------- FEATURED ---------------- */}
      <section className="bg-white py-24">
        <div className="container-x">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
            <SectionTitle
              align="left"
              eyebrow="Featured properties"
              title="Handpicked residences, ready for you"
              className="!mb-0"
            />
            <Reveal>
              <Link to="/listings" className="btn-outline">
                View all listings
                <Icon name="arrow-right" className="h-4 w-4" />
              </Link>
            </Reveal>
          </div>
          <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
            {featured.map((l, i) => (
              <PropertyCard key={l.id} listing={l} index={i} onOpen={setSelected} />
            ))}
          </div>
          {featured.length === 0 && <p className="py-10 text-center text-mist-500">No listings published yet.</p>}
        </div>
      </section>

      {/* ---------------- WHY US ---------------- */}
      <section className="relative overflow-hidden bg-navy-900 py-24 text-white">
        <div className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-navy-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-navy-400/10 blur-3xl" />
        <div className="container-x relative">
          <SectionTitle
            light
            eyebrow="Why choose us"
            title="Real estate, done with rigour and care"
            text="We combine institutional-grade analysis with a genuinely personal service."
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {WHY.map((w, i) => (
              <Reveal key={w.title} delay={i * 0.08}>
                <motion.div
                  whileHover={{ y: -8 }}
                  className="group h-full rounded-3xl border border-white/10 bg-white/5 p-7 backdrop-blur transition-colors duration-500 hover:border-white/30 hover:bg-white/10"
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-white transition-all duration-500 group-hover:rotate-6 group-hover:bg-white group-hover:text-navy-900">
                    <Icon name={w.icon} className="h-7 w-7" />
                  </span>
                  <h3 className="mt-6 text-xl font-semibold !text-white">{w.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/65">{w.text}</p>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- PROJECT SPOTLIGHT ---------------- */}
      <section className="bg-mist-50 py-24">
        <div className="container-x">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
            <SectionTitle align="left" eyebrow="Projects & deployment" title="Landmarks rising across the city" className="!mb-0" />
            <Reveal>
              <Link to="/projects" className="btn-outline">
                Track all projects
                <Icon name="arrow-right" className="h-4 w-4" />
              </Link>
            </Reveal>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {spotlight.map((p, i) => (
              <Reveal key={p.id} delay={i * 0.1}>
                <Link to="/projects" className="group relative block aspect-[3/4] overflow-hidden rounded-3xl bg-navy-900">
                  <Img src={p.image} alt={p.name} className="transition-transform duration-[1200ms] group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/30 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <Badge tone={statusTone(p.status)}>{p.status}</Badge>
                    <h3 className="mt-3 text-2xl font-semibold !text-white">{p.name}</h3>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-white/70">
                      <Icon name="pin" className="h-4 w-4" />
                      {p.location}
                    </p>
                    <div className="mt-5">
                      <div className="mb-2 flex justify-between text-xs text-white/70">
                        <span>Completion</span>
                        <span>{p.progress}%</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-white/20">
                        <motion.div
                          className="h-full rounded-full bg-white"
                          initial={{ width: 0 }}
                          whileInView={{ width: `${p.progress}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1.4, delay: 0.3, ease: 'easeOut' }}
                        />
                      </div>
                      <p className="mt-4 text-sm text-white/80">From {compact(p.startingPrice)}</p>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- PROCESS ---------------- */}
      <section className="bg-white py-24">
        <div className="container-x">
          <SectionTitle eyebrow="How it works" title="From first hello to the front door" />
          <div className="relative grid gap-10 md:grid-cols-4">
            <motion.div
              className="absolute left-0 right-0 top-8 hidden h-px origin-left bg-gradient-to-r from-navy-900 via-navy-300 to-navy-100 md:block"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.6, ease: 'easeInOut' }}
            />
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 0.12} className="relative">
                <span className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full border border-mist-200 bg-white font-display text-xl font-semibold text-navy-900 shadow-lg shadow-navy-900/5">
                  {s.n}
                </span>
                <h3 className="mt-6 text-xl font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-mist-500">{s.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- TESTIMONIALS ---------------- */}
      <section className="bg-mist-50 py-24">
        <div className="container-x max-w-4xl">
          <SectionTitle eyebrow="Client stories" title="Trusted by owners and investors" />
          <div className="relative min-h-[260px] rounded-[2rem] bg-white p-8 text-center shadow-xl shadow-navy-900/5 sm:p-14">
            <div className="mx-auto mb-6 flex w-fit gap-1 text-navy-500">
              {[0, 1, 2, 3, 4].map((i) => (
                <Icon key={i} name="star" className="h-5 w-5 fill-current" />
              ))}
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={tIndex}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.45 }}
              >
                <p className="font-display text-xl leading-relaxed text-navy-900 sm:text-2xl">“{t.quote}”</p>
                <p className="mt-6 font-semibold text-navy-900">{t.name}</p>
                <p className="text-sm text-mist-500">{t.role}</p>
              </motion.div>
            </AnimatePresence>
            <div className="mt-8 flex justify-center gap-2">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setTIndex(i)}
                  aria-label={`Show testimonial ${i + 1}`}
                  className={`h-2 rounded-full transition-all duration-500 ${i === tIndex ? 'w-8 bg-navy-900' : 'w-2 bg-mist-300'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- CTA ---------------- */}
      <section className="bg-white px-5 pb-24 sm:px-8">
        <Reveal>
          <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-navy-900 px-8 py-16 text-center sm:px-16 sm:py-20">
            <Img src={IMAGES.skyline} alt="" className="absolute inset-0 opacity-25" />
            <div className="absolute inset-0 bg-gradient-to-br from-navy-900/90 to-navy-700/70" />
            <div className="relative">
              <h2 className="mx-auto max-w-2xl text-3xl font-semibold !text-white sm:text-5xl">Ready to see it in person?</h2>
              <p className="mx-auto mt-4 max-w-xl text-white/70">
                Choose a time that works for you. Our advisors will prepare a tailored shortlist before you arrive.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Link to="/meeting" className="btn-light">
                  <Icon name="calendar" className="h-4 w-4" />
                  Schedule a meeting
                </Link>
                <Link to="/investment" className="btn-ghost">
                  Explore investing
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <ListingModal listing={selected} onClose={() => setSelected(null)} />
    </>
  );
}
