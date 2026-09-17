import { useRef } from 'react'
import { motion } from 'framer-motion'
import { merchCopy } from '../data/copy'
import { merchCards, type MerchCard } from '../data/merchDesk'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { useScrollProgress } from '../hooks/useScrollProgress'

const softEase = [0.22, 1, 0.36, 1] as const

function InboxCard({
  card,
  index,
  visible,
  reduced,
}: {
  card: MerchCard
  index: number
  visible: boolean
  reduced: boolean
}) {
  const hidden = {
    opacity: 0,
    y: 72,
    scale: 0.9,
    rotateX: 12,
    rotateZ: -2.5 + index * 0.7,
    filter: 'blur(8px)',
  }
  const shown = {
    opacity: 1,
    y: 0,
    scale: 1,
    rotateX: 0,
    rotateZ: 0,
    filter: 'blur(0px)',
  }

  return (
    <motion.article
      className={`inbox-card inbox-card--${card.tone}${visible ? ' is-entering' : ''}`}
      initial={reduced ? false : hidden}
      animate={visible || reduced ? shown : hidden}
      transition={{
        duration: 0.55,
        delay: reduced ? 0 : index * 0.1,
        ease: softEase,
      }}
      style={{ transformOrigin: 'center top' }}
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
  )
}

export function MerchDesk() {
  const reduced = usePrefersReducedMotion()
  const containerRef = useRef<HTMLElement>(null)
  const progress = useScrollProgress(containerRef)

  // Staggered cascade tied to scroll — cards slam in one-by-one
  const visibleCount = reduced
    ? merchCards.length
    : Math.min(
        merchCards.length,
        Math.max(0, Math.ceil(progress * (merchCards.length + 0.55))),
      )

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
              <motion.div
                className="merch__rail-count"
                key={visibleCount}
                initial={reduced ? false : { scale: 0.85, opacity: 0.5 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 420, damping: 22 }}
              >
                {visibleCount}/{merchCards.length} proposals
              </motion.div>
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
  )
}
