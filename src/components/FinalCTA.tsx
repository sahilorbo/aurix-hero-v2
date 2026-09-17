import { motion } from 'framer-motion';
import { links } from '../config/links';
import { finalCta } from '../data/copy';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

export function FinalCTA() {
  const reduced = usePrefersReducedMotion();

  return (
    <section className="final-cta" id="cta" aria-labelledby="final-cta-title">
      <div className="container">
        <motion.div
          className="final-cta__card"
          initial={reduced ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5 }}
        >
          <h2 id="final-cta-title">{finalCta.title}</h2>
          <p>{finalCta.sub}</p>
          <div className="final-cta__actions">
            <a className="btn btn--primary btn--lg" href={links.searchAudit}>
              {finalCta.primaryCta}
            </a>
            <a className="btn btn--outline btn--lg" href={links.demo}>
              {finalCta.secondaryCta}
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
