import { useRef } from 'react'
import { motion } from 'framer-motion'
import { merchCopy } from '../data/copy'
import { merchCards, type MerchCard } from '../data/merchDesk'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { useScrollProgress } from '../hooks/useScrollProgress'
import { ScrollScrub } from './visuals/ScrollScrub'

const softEase = [0.22, 1, 0.36, 1] as const

function InboxCard({
  card,
  index,
  visible,
  reduced,
  depth,
}: {
  card: MerchCard
  index: number
  visible: boolean
  reduced: boolean
  depth: number
}) {
  const hidden = {
    opacity: 0,
    y: 110 + index * 18,
    z: -180,
    scale: 0.82,
    rotateX: 28,
    rotateZ: -4 + index * 1.4,
    filter: 'blur(12px)',
  }
  const shown = {
    opacity: 1,
    y: 0,
    z: 0,
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
        duration: 0.7,
        delay: reduced ? 0 : index * 0.06,
        ease: softEase,
      }}
      style={{
        transformOrigin: '50% 100%',
        transformStyle: 'preserve-3d',
        zIndex: visible ? 10 + index : 1,
        ['--card-depth' as string]: depth,
      }}
    >
      <div className="inbox-card__shine" aria-hidden />
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

  const visibleCount = reduced
    ? merchCards.length
    : Math.min(
        merchCards.length,
        Math.max(0, Math.ceil(progress * (merchCards.length + 0.65))),
      )

  return (
    <section
      ref={containerRef}
      className="merch-scroll"
      id={merchCopy.id}
      aria-labelledby="merch-title"
    >
      <div className="merch-sticky">
        <div className="merch__ambient" aria-hidden>
          <span className="merch__beam" />
        </div>

        <div className="container merch">
          <div className="merch__top">
            <header className="section-head merch__head">
              <p className="eyebrow">{merchCopy.eyebrow}</p>
              <h2 id="merch-title">{merchCopy.title}</h2>
              <p className="section-sub">{merchCopy.subtitle}</p>
            </header>
            <ScrollScrub progress={progress} label="inbox" />
          </div>

          <div className="merch__desk">
            <div className="merch__rail" aria-hidden>
              <div className="merch__rail-label">
                <span className="merch__rail-dot" />
                Inbox · overnight
              </div>
              <motion.div
                className="merch__rail-count"
                key={visibleCount}
                initial={reduced ? false : { scale: 0.8, opacity: 0.4 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 440, damping: 20 }}
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
                  depth={i}
                />
              ))}
            </div>

            <motion.p
              className="merch__footnote"
              initial={false}
              animate={{
                opacity: visibleCount >= merchCards.length ? 1 : 0.35,
              }}
            >
              Nothing ships without you. Approve, edit, or dismiss — Aurix waits.
            </motion.p>
          </div>
        </div>
      </div>
    </section>
  )
}
