import { motion } from 'framer-motion';
import Logo from './Logo.jsx';

/**
 * Navy curtain that sweeps up over the screen, holds while the new page mounts underneath,
 * then lifts away. Keyed by route in App.jsx so it replays on every navigation.
 */
export function Curtain() {
  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center bg-navy-900"
      initial={{ y: '100%' }}
      animate={{ y: ['100%', '0%', '0%', '-100%'] }}
      transition={{ duration: 1.2, times: [0, 0.4, 0.52, 1], ease: [0.76, 0, 0.24, 1] }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-navy-800/60 to-navy-950" />
      <motion.div
        className="relative"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: [0, 1, 1, 0], scale: [0.9, 1, 1, 1.05] }}
        transition={{ duration: 1.2, times: [0.15, 0.4, 0.55, 0.75] }}
      >
        <Logo />
      </motion.div>
    </motion.div>
  );
}

/** Wraps each page: stays visible while the curtain covers it, then the next page fades in underneath. */
export function PageWrap({ children, simple = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: simple ? 10 : 0 }}
      animate={{ opacity: 1, y: 0, transition: { duration: simple ? 0.35 : 0.6, delay: simple ? 0 : 0.5 } }}
      exit={{ opacity: 0.98, transition: { duration: simple ? 0.15 : 0.5 } }}
    >
      {children}
    </motion.div>
  );
}
