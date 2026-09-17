import { motion } from 'framer-motion';
import { proofCopy } from '../data/copy';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

export function Proof() {
  const reduced = usePrefersReducedMotion();

  return (
    <section className="proof" id={proofCopy.id} aria-labelledby="proof-title">
      <div className="container">
        <header className="section-head section-head--center">
          <p className="eyebrow">{proofCopy.eyebrow}</p>
          <h2 id="proof-title">{proofCopy.title}</h2>
        </header>

        <motion.div
          className="proof__grid"
          initial={reduced ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.55 }}
        >
          <article className="proof-card proof-card--outcome">
            <p className="proof-card__metric">{proofCopy.outcome.metric}</p>
            <p className="proof-card__label">{proofCopy.outcome.label}</p>
            <p className="proof-card__detail">{proofCopy.outcome.detail}</p>
          </article>

          <article className="proof-card proof-card--promise">
            <p className="eyebrow eyebrow--sm">Go-live</p>
            <h3>{proofCopy.promise}</h3>
            <p>{proofCopy.promiseDetail}</p>
            <div className="proof-card__bar" aria-hidden>
              <span />
              <span />
              <span />
              <span className="is-live">Live</span>
            </div>
          </article>
        </motion.div>

        <div className="logo-row">
          <p className="logo-row__label">{proofCopy.logosLabel}</p>
          <ul className="logo-row__list">
            {proofCopy.logos.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
