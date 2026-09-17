import { useRef } from 'react';
import { motion } from 'framer-motion';
import { merchCopy } from '../data/copy';
import { merchCards, type MerchCard } from '../data/merchDesk';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { useScrollProgress } from '../hooks/useScrollProgress';

function InboxCard({
  card,
  index,
  visible,
  reduced,
}: {
  card: MerchCard;
  index: number;
  visible: boolean;
  reduced: boolean;
}) {
  return (
    <motion.article
      className={`inbox-card inbox-card--${card.tone}`}
      initial={reduced ? false : { opacity: 0, y: 40, rotate: -1.5 + index * 0.4 }}
      animate={
        visible
          ? { opacity: 1, y: 0, rotate: 0 }
          : reduced
            ? { opacity: 1, y: 0, rotate: 0 }
            : { opacity: 0, y: 40, rotate: -1.5 + index * 0.4 }
      }
      transition={{
        duration: 0.45,
        delay: reduced ? 0 : index * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <header className="inbox-card__head">
        <span className={`inbox-card__type inbox-card__type--${card.tone}`}>
          {card.typeLabel}
        </span>
        <span className="inbox-card__impact">{card.impact}</span>
      </header>
      <h3 className="inbox-card__title">{card.title}</h3>
      <div className="inbox-card__body">
        <div>
          <span className="inbox-card__label">Problem</span>
          <p>{card.problem}</p>
        </div>
        <div>
          <span className="inbox-card__label">Proposal</span>
          <p>{card.proposal}</p>
        </div>
      </div>
      <footer className="inbox-card__actions">
        <button type="button" className="btn btn--primary btn--sm" tabIndex={-1}>
          Approve
        </button>
        <button type="button" className="btn btn--ghost btn--sm" tabIndex={-1}>
          Edit
        </button>
      </footer>
    </motion.article>
  );
}

export function MerchDesk() {
  const reduced = usePrefersReducedMotion();
  const containerRef = useRef<HTMLElement>(null);
  const progress = useScrollProgress(containerRef);

  // Cascade: cards appear as progress advances
  const visibleCount = reduced
    ? merchCards.length
    : Math.min(
        merchCards.length,
        Math.max(0, Math.ceil(progress * (merchCards.length + 0.4))),
      );

  return (
    <section
      ref={containerRef}
      className="merch-scroll"
      id={merchCopy.id}
      aria-labelledby="merch-title"
    >
      <div className="merch-sticky">
        <div className="container merch">
          <header className="section-head">
            <p className="eyebrow">{merchCopy.eyebrow}</p>
            <h2 id="merch-title">{merchCopy.title}</h2>
            <p className="section-sub">{merchCopy.subtitle}</p>
          </header>

          <div className="merch__desk">
            <div className="merch__rail" aria-hidden>
              <div className="merch__rail-label">Inbox · overnight</div>
              <div className="merch__rail-count">
                {visibleCount}/{merchCards.length} proposals
              </div>
            </div>

            <div className="inbox-cascade">
              {merchCards.map((card, i) => (
                <InboxCard
                  key={card.id}
                  card={card}
                  index={i}
                  visible={i < visibleCount}
                  reduced={reduced}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
