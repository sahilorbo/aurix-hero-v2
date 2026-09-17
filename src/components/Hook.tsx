import { motion } from 'framer-motion'
import { links } from '../config/links'
import { hook } from '../data/copy'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { ShelfMesh } from './visuals/ShelfMesh'

const ease = [0.22, 1, 0.36, 1] as const

export function Hook() {
  const reduced = usePrefersReducedMotion()

  return (
    <section className="hook" id="top" aria-labelledby="hook-title">
      <div className="hook__glow" aria-hidden />
      <div className="hook__grid-fade" aria-hidden />

      <div className="container hook__layout">
        <div className="hook__copy">
          <motion.p
            className="eyebrow"
            initial={reduced ? false : { opacity: 0, y: 14, letterSpacing: '0.22em' }}
            animate={{ opacity: 1, y: 0, letterSpacing: '0.12em' }}
            transition={{ duration: 0.7, ease }}
          >
            {hook.eyebrow}
          </motion.p>

          <motion.h1
            id="hook-title"
            className="hook__title"
            initial={reduced ? false : { opacity: 0, y: 40, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.85, delay: reduced ? 0 : 0.08, ease }}
          >
            The self-driving
            <br />
            <span className="text-mint">beauty shelf</span>
          </motion.h1>

          <motion.div
            className="hook__ctas"
            initial={reduced ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: reduced ? 0 : 0.28, ease }}
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
            transition={{ duration: 0.5, delay: reduced ? 0 : 0.4 }}
          >
            <span className="pulse-dot" aria-hidden />
            {hook.promise}
          </motion.p>
        </div>

        <motion.div
          className="hook__visual"
          initial={reduced ? false : { opacity: 0, scale: 0.94, x: 28 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 1, delay: reduced ? 0 : 0.2, ease }}
        >
          <ShelfMesh />
          <div className="hook__visual-stats" aria-hidden>
            <div className="hook__stat">
              <span className="hook__stat-val">intent</span>
              <span className="hook__stat-lab">parsed live</span>
            </div>
            <div className="hook__stat">
              <span className="hook__stat-val">rank</span>
              <span className="hook__stat-lab">self-driving</span>
            </div>
            <div className="hook__stat">
              <span className="hook__stat-val">you</span>
              <span className="hook__stat-lab">approve</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
