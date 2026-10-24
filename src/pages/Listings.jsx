import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Icon from '../components/Icon.jsx';
import PropertyCard from '../components/PropertyCard.jsx';
import ListingModal from '../components/ListingModal.jsx';
import { AnimatedNumber, PageHero } from '../components/ui.jsx';
import { useMoney, useStore } from '../store/StoreContext.jsx';
import { IMAGES, PROPERTY_TYPES } from '../data/seed.js';

const PAGE_SIZE = 9;

const SORTS = [
  { id: 'new', label: 'Newest first' },
  { id: 'low', label: 'Price: low to high' },
  { id: 'high', label: 'Price: high to low' },
  { id: 'area', label: 'Largest area' },
];

export default function Listings() {
  const { listings, favs } = useStore();
  const { money } = useMoney();
  const [sp] = useSearchParams();

  const [q, setQ] = useState(sp.get('q') || '');
  const [purpose, setPurpose] = useState(sp.get('purpose') || 'All');
  const [type, setType] = useState(sp.get('type') || 'All');
  const [beds, setBeds] = useState(0);
  const [price, setPrice] = useState(null);
  const [sort, setSort] = useState('new');
  const [savedOnly, setSavedOnly] = useState(sp.get('saved') === '1');
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [selected, setSelected] = useState(null);

  // react to links like /listings?purpose=Rent while already on this page
  useEffect(() => {
    setQ(sp.get('q') || '');
    setPurpose(sp.get('purpose') || 'All');
    setType(sp.get('type') || 'All');
    setSavedOnly(sp.get('saved') === '1');
    setPrice(null);
    setVisible(PAGE_SIZE);
  }, [sp]);

  const priceCap = useMemo(() => {
    const pool = purpose === 'All' ? [] : listings.filter((l) => l.purpose === purpose);
    return pool.length ? Math.max(...pool.map((l) => Number(l.price) || 0)) : 0;
  }, [listings, purpose]);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    let list = listings.filter((l) => {
      if (purpose !== 'All' && l.purpose !== purpose) return false;
      if (type !== 'All' && l.type !== type) return false;
      if (beds > 0 && (Number(l.beds) || 0) < beds) return false;
      if (savedOnly && !favs.includes(l.id)) return false;
      if (price !== null && priceCap > 0 && Number(l.price) > price) return false;
      if (term) {
        const hay = `${l.title} ${l.city} ${l.address} ${l.type} ${(l.features || []).join(' ')}`.toLowerCase();
        if (!hay.includes(term)) return false;
      }
      return true;
    });
    list = [...list];
    if (sort === 'low') list.sort((a, b) => a.price - b.price);
    if (sort === 'high') list.sort((a, b) => b.price - a.price);
    if (sort === 'area') list.sort((a, b) => b.sqft - a.sqft);
    if (sort === 'new') list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return list;
  }, [listings, q, purpose, type, beds, price, sort, savedOnly, favs, priceCap]);

  const clear = () => {
    setQ('');
    setPurpose('All');
    setType('All');
    setBeds(0);
    setPrice(null);
    setSavedOnly(false);
    setSort('new');
    setVisible(PAGE_SIZE);
  };

  const reset = (fn) => (v) => {
    fn(v);
    setVisible(PAGE_SIZE);
  };

  const activeFilters = q || purpose !== 'All' || type !== 'All' || beds > 0 || price !== null || savedOnly;
  const sliderValue = price === null ? priceCap : Math.min(price, priceCap);

  return (
    <>
      <PageHero
        eyebrow="Property listings"
        title="Find your next address"
        text="Filter by what matters — location, type, bedrooms and budget."
        image={IMAGES.tower}
      />

      <section className="bg-mist-50 pb-24">
        <div className="container-x">
          {/* ------------ Filters ------------ */}
          <div className="relative z-20 -mt-10 rounded-3xl border border-mist-200 bg-white p-4 shadow-xl shadow-navy-900/10 sm:p-5">
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1fr]">
              <label className="flex items-center gap-3 rounded-xl border border-mist-200 px-4 py-3 focus-within:border-navy-500 focus-within:ring-4 focus-within:ring-navy-500/10">
                <Icon name="search" className="h-5 w-5 text-mist-400" />
                <input
                  value={q}
                  onChange={(e) => reset(setQ)(e.target.value)}
                  placeholder="Search title, area, feature…"
                  aria-label="Search listings"
                  className="w-full bg-transparent text-sm text-navy-900 outline-none placeholder:text-mist-400"
                />
              </label>

              <select className="input" aria-label="Purpose" value={purpose} onChange={(e) => { reset(setPurpose)(e.target.value); setPrice(null); }}>
                <option value="All">Buy or rent</option>
                <option value="Sale">For sale</option>
                <option value="Rent">For rent</option>
              </select>

              <select className="input" aria-label="Property type" value={type} onChange={(e) => reset(setType)(e.target.value)}>
                <option value="All">All types</option>
                {PROPERTY_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>

              <select className="input" aria-label="Bedrooms" value={beds} onChange={(e) => reset(setBeds)(Number(e.target.value))}>
                <option value={0}>Any bedrooms</option>
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n}+ bedrooms
                  </option>
                ))}
              </select>

              <select className="input" aria-label="Sort" value={sort} onChange={(e) => setSort(e.target.value)}>
                {SORTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
              <div className={`flex min-w-[240px] flex-1 items-center gap-4 ${priceCap ? '' : 'opacity-50'}`}>
                <span className="whitespace-nowrap text-xs font-semibold uppercase tracking-wider text-mist-500">Max price</span>
                <input
                  type="range"
                  min={0}
                  max={priceCap || 1}
                  step={Math.max(1, Math.round((priceCap || 1) / 100))}
                  value={sliderValue}
                  disabled={!priceCap}
                  aria-label="Maximum price"
                  onChange={(e) => reset(setPrice)(Number(e.target.value))}
                />
                <span className="w-28 text-right text-sm font-semibold text-navy-900">
                  {priceCap ? money(sliderValue) : 'Select buy/rent'}
                </span>
              </div>

              <button
                type="button"
                onClick={() => reset(setSavedOnly)(!savedOnly)}
                aria-pressed={savedOnly}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  savedOnly ? 'border-navy-900 bg-navy-900 text-white' : 'border-mist-200 text-navy-900 hover:border-navy-900'
                }`}
              >
                <Icon name="heart" className={`h-4 w-4 ${savedOnly ? 'fill-current' : ''}`} />
                Saved ({favs.length})
              </button>

              {activeFilters && (
                <button type="button" onClick={clear} className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-500 hover:text-navy-900">
                  <Icon name="refresh" className="h-4 w-4" />
                  Clear filters
                </button>
              )}
            </div>
          </div>

          {/* ------------ Results ------------ */}
          <div className="mb-8 mt-10 flex items-center justify-between">
            <p className="text-sm text-mist-500">
              Showing{' '}
              <span className="font-bold text-navy-900">
                <AnimatedNumber value={Math.min(visible, results.length)} />
              </span>{' '}
              of <span className="font-bold text-navy-900">{results.length}</span> properties
            </p>
          </div>

          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence>
              {results.slice(0, visible).map((l, i) => (
                <PropertyCard key={l.id} listing={l} index={i} onOpen={setSelected} />
              ))}
            </AnimatePresence>
          </div>

          {results.length === 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-md py-20 text-center">
              <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white text-navy-300 shadow-lg">
                <Icon name="search" className="h-9 w-9" />
              </span>
              <h3 className="mt-6 text-2xl font-semibold">No properties match</h3>
              <p className="mt-2 text-mist-500">Try widening your filters — or tell us what you need and we will find it off-market.</p>
              <button type="button" onClick={clear} className="btn-primary mt-6">
                Reset filters
              </button>
            </motion.div>
          )}

          {results.length > visible && (
            <div className="mt-12 text-center">
              <button type="button" onClick={() => setVisible((v) => v + PAGE_SIZE)} className="btn-outline">
                Load more properties
                <Icon name="chevron-down" className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </section>

      <ListingModal listing={selected} onClose={() => setSelected(null)} />
    </>
  );
}
