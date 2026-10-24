import { motion } from 'framer-motion';
import Icon from './Icon.jsx';
import { Badge, Img } from './ui.jsx';
import { useMoney, useStore } from '../store/StoreContext.jsx';

export function priceLabel(listing, money) {
  return listing.purpose === 'Rent' ? `${money(listing.price)}/mo` : money(listing.price);
}

export default function PropertyCard({ listing, onOpen, index = 0 }) {
  const { favs, toggleFav } = useStore();
  const { money } = useMoney();
  const saved = favs.includes(listing.id);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 40, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={{ duration: 0.55, delay: Math.min(index, 8) * 0.05, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -8 }}
      className="group card cursor-pointer overflow-hidden transition-shadow duration-500 hover:shadow-2xl hover:shadow-navy-900/10"
      onClick={() => onOpen(listing)}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Img
          src={listing.image}
          alt={listing.title}
          className="transition-transform duration-[900ms] ease-out group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/60 via-transparent to-transparent" />
        <div className="absolute left-4 top-4 flex gap-2">
          <Badge tone="light">For {listing.purpose}</Badge>
          {listing.status !== 'Available' && <Badge tone="navy">{listing.status}</Badge>}
        </div>
        <button
          type="button"
          aria-label={saved ? 'Remove from saved' : 'Save property'}
          aria-pressed={saved}
          onClick={(e) => {
            e.stopPropagation();
            toggleFav(listing.id);
          }}
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/85 text-navy-900 backdrop-blur transition hover:scale-110"
        >
          <motion.span key={String(saved)} initial={{ scale: 0.4 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 15 }}>
            <Icon name="heart" className={`h-5 w-5 ${saved ? 'fill-navy-900' : ''}`} />
          </motion.span>
        </button>
        <p className="absolute bottom-4 left-4 font-display text-2xl font-semibold text-white">{priceLabel(listing, money)}</p>
      </div>

      <div className="p-5">
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-navy-500">
          <Icon name="pin" className="h-3.5 w-3.5" />
          {listing.city}
        </p>
        <h3 className="mt-2 line-clamp-1 text-xl font-semibold">{listing.title}</h3>

        <div className="mt-4 flex items-center gap-5 border-t border-mist-100 pt-4 text-sm text-mist-500">
          {listing.beds > 0 && (
            <span className="flex items-center gap-1.5">
              <Icon name="bed" className="h-4 w-4" />
              {listing.beds}
            </span>
          )}
          {listing.baths > 0 && (
            <span className="flex items-center gap-1.5">
              <Icon name="bath" className="h-4 w-4" />
              {listing.baths}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Icon name="area" className="h-4 w-4" />
            {Number(listing.sqft).toLocaleString()} sqft
          </span>
          <span className="ml-auto flex h-8 w-8 items-center justify-center rounded-full bg-mist-100 text-navy-900 transition-all duration-300 group-hover:bg-navy-900 group-hover:text-white">
            <Icon name="arrow-up-right" className="h-4 w-4" />
          </span>
        </div>
      </div>
    </motion.article>
  );
}
