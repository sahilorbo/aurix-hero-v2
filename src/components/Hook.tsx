import { motion } from 'framer-motion';
import { links } from '../config/links';
import { hook } from '../data/copy';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

export function Hook() {
  const reduced = usePrefersReducedMotion();

  return (
    <section className="hook" id="top" aria-labelledby="hook-title">
      <div className="hook__glow" aria-hidden />
      <div className="container hook__inner">
        <motion.p
          className="eyebrow"
          initial={reduced ? false : { opacity: 0, y: 16, letterSpacing: '0.2em' }}
          animate={{ opacity: 1, y: 0, letterSpacing: '0.12em' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {hook.eyebrow}
        </motion.p>

        <motion.h1
          id="hook-title"
          className="hook__title"
          initial={reduced ? false : { opacity: 0, y: 32, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.75, delay: reduced ? 0 : 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          The self-driving{' '}
          <span className="text-mint">beauty shelf</span>
        </motion.h1>

        <motion.p
          className="hook__sub"
          initial={reduced ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: reduced ? 0 : 0.16 }}
        >
          {hook.sub}
        </motion.p>

        <motion.div
          className="hook__ctas"
          initial={reduced ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: reduced ? 0 : 0.24 }}
        >
          <a className="btn btn--primary btn--lg" href={links.searchAudit}>
            {hook.primaryCta}
          </a>
          <a className="btn btn--outline btn--lg" href={links.demo}>
            {hook.secondaryCta}
          </a>
        </motion.div>

        <motion.p
          className="hook__promise"
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: reduced ? 0 : 0.36 }}
        >
          <span className="pulse-dot" aria-hidden />
          {hook.promise}
        </motion.p>
      </div>
    </section>
  );
}
