import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import Icon from '../components/Icon.jsx';
import { Counter, Img, PageHero, Reveal, SectionTitle } from '../components/ui.jsx';
import { useStore } from '../store/StoreContext.jsx';
import { IMAGES, img } from '../data/seed.js';

const VALUES = [
  { icon: 'shield', title: 'Integrity', text: 'We say what we know, show what we have, and never hide a fee.' },
  { icon: 'award', title: 'Craft', text: 'From site selection to snagging, we obsess over the details buyers feel every day.' },
  { icon: 'eye', title: 'Transparency', text: 'Live project tracking, open pricing and honest advice — even when it costs us a sale.' },
  { icon: 'users', title: 'Partnership', text: 'Your advisor stays with you long after the keys change hands.' },
];

const MILESTONES = [
  ['2009', 'Founded', 'Started as a three-person brokerage focused on honest advice for first-time buyers.'],
  ['2013', 'First development', 'Delivered our first 60-unit residential community, on time and on budget.'],
  ['2018', 'Investment arm', 'Launched fractional investment plans for individual investors.'],
  ['2022', 'Digital-first', 'Introduced virtual tours, e-signing and live project tracking.'],
  ['2026', 'Skyline Tower', 'Broke ground on our tallest landmark — 58 storeys in the heart of the city.'],
];

const TEAM = [
  { name: 'Alexandra Reed', role: 'Founder & CEO' },
  { name: 'Marcus Lindqvist', role: 'Head of Development' },
  { name: 'Nadia Farouk', role: 'Director of Investments' },
  { name: 'Daniel Okafor', role: 'Lead Advisor, Residential' },
];

export default function About() {
  const { settings } = useStore();
  const collage = useRef(null);
  const { scrollYProgress } = useScroll({ target: collage, offset: ['start end', 'end start'] });
  const y1 = useTransform(scrollYProgress, [0, 1], ['6%', '-10%']);
  const y2 = useTransform(scrollYProgress, [0, 1], ['-6%', '12%']);

  return (
    <>
      <PageHero
        eyebrow="About us"
        title={`The people behind ${settings.company}`}
        text="For over fifteen years we have helped families, founders and investors find property they are proud to own."
        image={IMAGES.skyline}
      />

      {/* Story */}
      <section className="bg-white py-24">
        <div className="container-x grid items-center gap-16 lg:grid-cols-2">
          <div>
            <Reveal>
              <span className="eyebrow">
                <span className="h-px w-8 bg-navy-500" />
                Our story
              </span>
              <h2 className="mt-4 text-3xl font-semibold leading-tight sm:text-5xl">Built on trust, shaped by design</h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-6 text-lg leading-relaxed">
                {settings.company} began with a simple belief: buying property should feel exciting, not intimidating. We combine
                architects, financiers and advisors under one roof so every decision — from location to payment plan — is made with
                complete information.
              </p>
              <p className="mt-4 leading-relaxed">
                Today we develop landmark projects, represent buyers and sellers, and manage investments for thousands of clients.
                Our standard has never changed: transparent pricing, verified titles and service that lasts.
              </p>
            </Reveal>
            <Reveal delay={0.2} className="mt-8 grid grid-cols-3 gap-6 border-t border-mist-200 pt-8">
              {[
                [15, '+', 'Years'],
                [1200, '+', 'Homes'],
                [18, '', 'Projects'],
              ].map(([n, s, l]) => (
                <div key={l}>
                  <p className="font-display text-4xl font-semibold text-navy-900">
                    <Counter to={n} suffix={s} />
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-widest text-mist-500">{l}</p>
                </div>
              ))}
            </Reveal>
          </div>

          <div ref={collage} className="relative grid grid-cols-2 gap-5">
            <motion.div style={{ y: y1 }} className="aspect-[3/4] overflow-hidden rounded-[2rem] shadow-2xl shadow-navy-900/15">
              <Img src={img('photo-1545324418-cc1a3fa10c00', 900)} alt="Skyscraper facade" />
            </motion.div>
            <motion.div style={{ y: y2 }} className="mt-14 aspect-[3/4] overflow-hidden rounded-[2rem] shadow-2xl shadow-navy-900/15">
              <Img src={img('photo-1613490493576-7fde63acd811', 900)} alt="Luxury villa" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-navy-900 py-24">
        <div className="container-x">
          <SectionTitle light eyebrow="What we stand for" title="Four principles behind every deal" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((v, i) => (
              <Reveal key={v.title} delay={i * 0.08}>
                <motion.div
                  whileHover={{ y: -8 }}
                  className="group h-full rounded-3xl border border-white/10 bg-white/5 p-7 transition-colors duration-500 hover:bg-white"
                >
                  <Icon name={v.icon} className="h-9 w-9 text-navy-200 transition-colors duration-500 group-hover:text-navy-900" />
                  <h3 className="mt-6 text-xl font-semibold !text-white transition-colors duration-500 group-hover:!text-navy-900">{v.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/60 transition-colors duration-500 group-hover:text-mist-500">{v.text}</p>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="bg-white py-24">
        <div className="container-x max-w-4xl">
          <SectionTitle eyebrow="Our journey" title="Milestones along the way" />
          <div className="relative">
            <motion.div
              className="absolute bottom-0 left-4 top-0 w-px origin-top bg-gradient-to-b from-navy-900 to-navy-100 md:left-1/2"
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.6, ease: 'easeInOut' }}
            />
            <ol className="space-y-12">
              {MILESTONES.map(([year, title, text], i) => (
                <Reveal key={year} as="li" className="relative grid gap-2 pl-12 md:grid-cols-2 md:gap-16 md:pl-0">
                  <span className="absolute left-4 top-2 z-10 h-3 w-3 -translate-x-1/2 rounded-full border-2 border-navy-900 bg-white md:left-1/2" />
                  <div className={i % 2 ? 'md:order-2 md:text-left' : 'md:text-right'}>
                    <p className="font-display text-4xl font-semibold text-navy-900">{year}</p>
                  </div>
                  <div className={i % 2 ? 'md:order-1 md:text-right' : ''}>
                    <h3 className="text-xl font-semibold">{title}</h3>
                    <p className="mt-1 text-sm leading-relaxed">{text}</p>
                  </div>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="bg-mist-50 py-24">
        <div className="container-x">
          <SectionTitle eyebrow="Leadership" title="Meet the team" text="Sample profiles — replace with your own people." />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {TEAM.map((t, i) => (
              <Reveal key={t.name} delay={i * 0.08}>
                <motion.div whileHover={{ y: -8 }} className="card p-8 text-center transition-shadow hover:shadow-xl hover:shadow-navy-900/10">
                  <span className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-navy-900 to-navy-500 font-display text-3xl font-semibold text-white">
                    {t.name
                      .split(' ')
                      .map((p) => p[0])
                      .join('')}
                  </span>
                  <h3 className="mt-5 text-lg font-semibold">{t.name}</h3>
                  <p className="mt-1 text-sm text-mist-500">{t.role}</p>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <Reveal className="container-x text-center">
          <h2 className="mx-auto max-w-2xl text-3xl font-semibold sm:text-4xl">Let&apos;s talk about what you are looking for</h2>
          <Link to="/meeting" className="btn-primary mt-8">
            <Icon name="calendar" className="h-4 w-4" />
            Schedule a meeting
          </Link>
        </Reveal>
      </section>
    </>
  );
}
