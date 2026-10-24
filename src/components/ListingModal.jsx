import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Badge, Img, Modal, statusTone } from './ui.jsx';
import Icon from './Icon.jsx';
import InquiryForm from './InquiryForm.jsx';
import { priceLabel } from './PropertyCard.jsx';
import { useMoney, useStore } from '../store/StoreContext.jsx';

export default function ListingModal({ listing, onClose }) {
  const navigate = useNavigate();
  const { favs, toggleFav } = useStore();
  const { money } = useMoney();
  const [active, setActive] = useState(0);

  // keep last listing mounted while the exit animation plays
  const last = useRef(listing);
  if (listing) last.current = listing;
  const l = listing || last.current;

  useEffect(() => setActive(0), [listing?.id]);

  if (!l) return null;
  const images = [l.image, ...(l.gallery || [])].filter(Boolean);
  const saved = favs.includes(l.id);

  const book = () => {
    onClose();
    navigate('/meeting', { state: { type: 'Property Viewing', note: `Viewing request: ${l.title}` } });
  };

  return (
    <Modal open={!!listing} onClose={onClose} maxWidth="max-w-5xl">
      <div className="grid lg:grid-cols-5">
        <div className="lg:col-span-3">
          <div className="relative aspect-[16/11] overflow-hidden bg-navy-900">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={images[active] || 'none'}
                className="absolute inset-0"
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Img src={images[active]} alt={l.title} />
              </motion.div>
            </AnimatePresence>
            <div className="absolute left-4 top-4 flex gap-2">
              <Badge tone="light">For {l.purpose}</Badge>
              <Badge tone={statusTone(l.status)}>{l.status}</Badge>
            </div>
          </div>

          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto p-4 no-scrollbar">
              {images.map((src, i) => (
                <button
                  key={`${src}-${i}`}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={`Photo ${i + 1}`}
                  className={`h-16 w-24 shrink-0 overflow-hidden rounded-xl border-2 transition ${
                    i === active ? 'border-navy-900' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <Img src={src} alt="" />
                </button>
              ))}
            </div>
          )}

          <div className="space-y-6 p-6 sm:p-8">
            <div>
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-navy-500">
                <Icon name="pin" className="h-3.5 w-3.5" />
                {l.address}, {l.city}
              </p>
              <h2 className="mt-2 text-3xl font-semibold">{l.title}</h2>
              <p className="mt-2 font-display text-3xl font-semibold text-navy-600">{priceLabel(l, money)}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                ['Type', l.type, 'building'],
                ['Bedrooms', l.beds || '—', 'bed'],
                ['Bathrooms', l.baths || '—', 'bath'],
                ['Area', `${Number(l.sqft).toLocaleString()} sqft`, 'area'],
              ].map(([k, v, icon]) => (
                <div key={k} className="rounded-2xl bg-mist-50 p-4">
                  <Icon name={icon} className="h-5 w-5 text-navy-500" />
                  <p className="mt-2 text-xs uppercase tracking-wider text-mist-400">{k}</p>
                  <p className="font-semibold text-navy-900">{v}</p>
                </div>
              ))}
            </div>

            <p className="leading-relaxed">{l.description}</p>

            {l.features?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {l.features.map((f) => (
                  <span key={f} className="inline-flex items-center gap-1.5 rounded-full border border-mist-200 px-3 py-1.5 text-sm text-navy-900">
                    <Icon name="check" className="h-3.5 w-3.5 text-navy-500" />
                    {f}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <aside className="border-t border-mist-100 bg-mist-50 p-6 sm:p-8 lg:col-span-2 lg:border-l lg:border-t-0">
          <div className="flex gap-3">
            <button type="button" onClick={book} className="btn-primary flex-1">
              <Icon name="calendar" className="h-4 w-4" />
              Schedule viewing
            </button>
            <button
              type="button"
              onClick={() => toggleFav(l.id)}
              aria-pressed={saved}
              aria-label={saved ? 'Remove from saved' : 'Save property'}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-navy-900/20 text-navy-900 transition hover:bg-navy-900 hover:text-white"
            >
              <Icon name="heart" className={`h-5 w-5 ${saved ? 'fill-current' : ''}`} />
            </button>
          </div>

          <div className="my-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-widest text-mist-400">
            <span className="h-px flex-1 bg-mist-200" />
            or ask a question
            <span className="h-px flex-1 bg-mist-200" />
          </div>

          <InquiryForm listing={l} />
        </aside>
      </div>
    </Modal>
  );
}
