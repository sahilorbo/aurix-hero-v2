import { useMemo, useRef, type CSSProperties } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { theaterCopy } from '../data/copy'
import {
  BEAT_COUNT,
  aurixProducts,
  beatLabels,
  beautyQuery,
  cartState,
  explainPanel,
  failProducts,
  goWildMonday,
  locationContext,
  parseChips,
  pdpHero,
  persona,
  routineItems,
  similarItems,
  type ProductCard,
} from '../data/theater'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { beatFromProgress, useScrollProgress } from '../hooks/useScrollProgress'
import { ScrollScrub } from './visuals/ScrollScrub'

const spring = { type: 'spring' as const, stiffness: 380, damping: 28 }
const softEase = [0.22, 1, 0.36, 1] as const

const bottlePalettes = [
  ['#93B78F', '#2a4030'],
  ['#7D9F73', '#1a2e24'],
  ['#c4a484', '#3d2e22'],
  ['#8bb8c9', '#1e3340'],
  ['#d4a5a5', '#3a2424'],
  ['#b8a0d4', '#2a2240'],
  ['#e8c87a', '#3a3020'],
  ['#93B78F', '#1A2947'],
]

function ProductTile({
  product,
  mode,
  index,
  showAttrs = false,
}: {
  product: ProductCard
  mode: 'fail' | 'win'
  index: number
  showAttrs?: boolean
}) {
  const [top, bottom] = bottlePalettes[index % bottlePalettes.length]
  return (
    <div
      className={`product-tile ${product.highlight ? 'product-tile--hero' : ''} ${
        mode === 'fail' ? 'product-tile--fail' : ''
      }`}
    >
      <div className="product-tile__swatch" aria-hidden>
        <div
          className="product-tile__bottle"
          style={
            {
              '--bottle-top': top,
              '--bottle-bot': bottom,
            } as CSSProperties
          }
        />
        {mode === 'win' && product.highlight && <span className="product-tile__halo" />}
      </div>
      <div className="product-tile__meta">
        <div className="product-tile__row">
          <span className="product-tile__name">{product.name}</span>
          {product.tag ? <span className="chip chip--mint">{product.tag}</span> : null}
        </div>
        <div className="product-tile__row product-tile__row--sub">
          <span className="product-tile__price">{product.price}</span>
          <span className="product-tile__rating">★ {product.rating}</span>
        </div>
        {mode === 'fail' && product.failReason ? (
          <p className="product-tile__fail">{product.failReason}</p>
        ) : null}
        {mode === 'win' ? (
          <div className="fit-bar" aria-label={`Compatibility ${product.fit}`}>
            <div className="fit-bar__track">
              <motion.div
                className="fit-bar__fill"
                initial={{ width: 0 }}
                animate={{ width: `${product.fit}%` }}
                transition={{ duration: 0.75, ease: softEase, delay: 0.1 + index * 0.05 }}
              />
            </div>
            <span className="fit-bar__label">{product.fit}%</span>
          </div>
        ) : null}
        {showAttrs && product.attrs ? (
          <div className="product-tile__attrs">
            {product.attrs.map((a) => (
              <span key={a} className="chip chip--ghost">
                {a}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}

function ContextRail({ reduced }: { reduced: boolean }) {
  return (
    <div className="context-rail" aria-label="Location and persona">
      <motion.div
        className="persona-card"
        initial={reduced ? false : { opacity: 0, x: -16, scale: 0.96 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ ...spring, delay: 0.05 }}
      >
        <span className="persona-card__avatar" aria-hidden>
          {persona.initials}
        </span>
        <div className="persona-card__body">
          <span className="persona-card__name">{persona.name}</span>
          <span className="persona-card__note">{persona.note}</span>
          <div className="persona-card__traits">
            {persona.traits.map((t) => (
              <span key={t} className="chip chip--mint">
                {t}
              </span>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div
        className="location-card"
        initial={reduced ? false : { opacity: 0, x: 16, scale: 0.96 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ ...spring, delay: 0.12 }}
      >
        <div className="location-card__pin" aria-hidden>
          <span className="location-card__dot" />
          <span className="location-card__rings" />
        </div>
        <div className="location-card__body">
          <span className="location-card__city">{locationContext.city}</span>
          <span className="location-card__climate">{locationContext.climate}</span>
          <div className="location-card__chips">
            {locationContext.chips.map((c) => (
              <span key={c.id} className={`chip chip--${c.tone}`}>
                {c.label}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

function ExplainPanel() {
  return (
    <aside className="explain" aria-label="Compatibility explanation">
      <div className="explain__scan" aria-hidden />
      <div className="explain__head">
        <span className="eyebrow eyebrow--sm">{explainPanel.title}</span>
        <span className="explain__score">
          <span className="explain__score-num">{explainPanel.fitScore}</span>
          <span className="explain__score-unit">fit</span>
        </span>
      </div>
      <p className="explain__product">{explainPanel.product}</p>
      <ul className="explain__attrs">
        {explainPanel.attributes.map((a) => (
          <li key={a.label}>
            <span>{a.label}</span>
            <strong>{a.value}</strong>
          </li>
        ))}
      </ul>
      <div className="explain__block">
        <span className="explain__label">Why it matches</span>
        <p>{explainPanel.compatibility}</p>
      </div>
      <div className="explain__block">
        <span className="explain__label">Sentiment</span>
        <p>{explainPanel.sentiment}</p>
      </div>
    </aside>
  )
}

function RoutineRail({ reduced, emphasis }: { reduced: boolean; emphasis?: boolean }) {
  return (
    <div className={`routine-rail ${emphasis ? 'routine-rail--hot' : ''}`}>
      <div className="routine-rail__head">
        <span className="eyebrow eyebrow--sm">Complete the routine</span>
        <span className="routine-rail__hint">look · AM path</span>
      </div>
      <div className="routine-rail__steps">
        {routineItems.map((item, i) => (
          <motion.div
            key={item.id}
            className={`routine-step ${item.primary ? 'routine-step--hero' : ''}`}
            initial={reduced ? false : { opacity: 0, y: 18, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ ...spring, delay: 0.06 + i * 0.08 }}
          >
            <span className="routine-step__badge">{item.step}</span>
            <div className="routine-step__swatch" aria-hidden>
              <span
                className="routine-step__bottle"
                style={
                  {
                    '--bottle-top': bottlePalettes[i][0],
                    '--bottle-bot': bottlePalettes[i][1],
                  } as CSSProperties
                }
              />
            </div>
            <div className="routine-step__meta">
              <span className="routine-step__name">{item.name}</span>
              <span className="routine-step__role">{item.role}</span>
              <div className="routine-step__row">
                <span>{item.price}</span>
                <span className="text-mint">{item.fit}% fit</span>
              </div>
            </div>
            {i < routineItems.length - 1 ? (
              <span className="routine-step__plus" aria-hidden>
                +
              </span>
            ) : null}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function PdpStage({ reduced }: { reduced: boolean }) {
  return (
    <div className="pdp-stage">
      <motion.div
        className="pdp-hero"
        initial={reduced ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: softEase }}
      >
        <div className="pdp-hero__visual" aria-hidden>
          <span
            className="pdp-hero__bottle"
            style={
              {
                '--bottle-top': bottlePalettes[0][0],
                '--bottle-bot': bottlePalettes[0][1],
              } as CSSProperties
            }
          />
          <span className="pdp-hero__glow" />
        </div>
        <div className="pdp-hero__copy">
          <div className="pdp-hero__badges">
            {pdpHero.badges.map((b) => (
              <span key={b} className="chip chip--mint">
                {b}
              </span>
            ))}
          </div>
          <h3 className="pdp-hero__name">{pdpHero.name}</h3>
          <div className="pdp-hero__row">
            <span className="pdp-hero__price">{pdpHero.price}</span>
            <span className="pdp-hero__fit">{pdpHero.fit}% compat</span>
          </div>
          <span className={`stock-pill stock-pill--${pdpHero.stockTone}`}>
            {pdpHero.stock}
          </span>
          <span className="pdp-hero__cta">Add to cart</span>
        </div>
      </motion.div>

      <div className="pdp-side">
        <div className="similar-rail">
          <span className="eyebrow eyebrow--sm">Similar items</span>
          <div className="similar-rail__row">
            {similarItems.map((s, i) => (
              <motion.div
                key={s.id}
                className="similar-card"
                initial={reduced ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...spring, delay: 0.08 + i * 0.07 }}
              >
                <span
                  className="similar-card__bottle"
                  aria-hidden
                  style={
                    {
                      '--bottle-top': bottlePalettes[i + 1][0],
                      '--bottle-bot': bottlePalettes[i + 1][1],
                    } as CSSProperties
                  }
                />
                <span className="similar-card__name">{s.name}</span>
                <span className="similar-card__meta">
                  {s.price} · {s.fit}%
                </span>
                <span className="similar-card__why">{s.why}</span>
              </motion.div>
            ))}
          </div>
        </div>
        <RoutineRail reduced={reduced} emphasis />
      </div>
    </div>
  )
}

function CartStage({ reduced }: { reduced: boolean }) {
  return (
    <div className="cart-stage">
      <motion.div
        className="gowild-bar"
        initial={reduced ? false : { opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring }}
      >
        <span className="gowild-bar__badge">{goWildMonday.title}</span>
        <span className="gowild-bar__offer">{goWildMonday.offer}</span>
        <span className="gowild-bar__sub">{goWildMonday.subtitle}</span>
      </motion.div>

      <div className="cart-stage__grid">
        <motion.div
          className="cart-card"
          initial={reduced ? false : { opacity: 0, x: -18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: softEase }}
        >
          <span className="eyebrow eyebrow--sm">Bag · make it a routine</span>
          <div className="cart-line">
            <span
              className="cart-line__bottle"
              aria-hidden
              style={
                {
                  '--bottle-top': bottlePalettes[0][0],
                  '--bottle-bot': bottlePalettes[0][1],
                } as CSSProperties
              }
            />
            <div>
              <p className="cart-line__name">{cartState.line.name}</p>
              <p className="cart-line__meta">
                Qty {cartState.line.qty} · {cartState.line.price}
              </p>
            </div>
            <span className="chip chip--mint">Added</span>
          </div>

          <div className="cart-attach">
            {cartState.routineAttach.map((item, i) => (
              <motion.div
                key={item.id}
                className={`cart-attach__row ${item.added ? 'is-on' : ''}`}
                initial={reduced ? false : { opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ...spring, delay: 0.1 + i * 0.08 }}
              >
                <span className="cart-attach__check" aria-hidden>
                  {item.added ? '✓' : '+'}
                </span>
                <span>{item.name}</span>
                <span className="cart-attach__price">{item.price}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="cart-side">
          <motion.div
            className="deals-panel"
            initial={reduced ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.42, ease: softEase, delay: 0.08 }}
          >
            <span className="eyebrow eyebrow--sm">Deals for you</span>
            {cartState.deals.map((d, i) => (
              <motion.div
                key={d.id}
                className="deal-card"
                initial={reduced ? false : { opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ ...spring, delay: 0.12 + i * 0.08 }}
              >
                <span className="deal-card__label">{d.label}</span>
                <p className="deal-card__offer">{d.offer}</p>
                <span className="deal-card__timer">{d.timer}</span>
              </motion.div>
            ))}
          </motion.div>

          <div className="urgency-rail">
            {cartState.urgency.map((u, i) => (
              <motion.div
                key={u.id}
                className={`urgency-pill urgency-pill--${u.tone}`}
                initial={reduced ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...spring, delay: 0.2 + i * 0.1 }}
              >
                <span className="urgency-pill__pulse" aria-hidden />
                {u.text}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function ShopperTheater() {
  const reduced = usePrefersReducedMotion()
  const containerRef = useRef<HTMLElement>(null)
  const progress = useScrollProgress(containerRef)
  const beat = reduced ? BEAT_COUNT - 1 : beatFromProgress(progress, BEAT_COUNT)

  const typedLen = useMemo(() => {
    if (reduced) return beautyQuery.length
    if (beat === 0) {
      const local = Math.min(1, Math.max(0, progress * BEAT_COUNT))
      return Math.floor(local * beautyQuery.length)
    }
    return beautyQuery.length
  }, [beat, progress, reduced])

  const showFail = beat === 0
  const showContext = beat === 1
  const showScored = beat === 2
  const showRoutine = beat === 3
  const showPdp = beat === 4
  const showCart = beat === 5
  const showParse = beat >= 1 && beat <= 3

  const stageClass = [
    'stage-card',
    beat >= 2 ? 'stage-card--live' : '',
    beat >= 5 ? 'stage-card--recover' : '',
    showPdp ? 'stage-card--pdp' : '',
    showCart ? 'stage-card--cart' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <section
      ref={containerRef}
      className="theater-scroll"
      id={theaterCopy.id}
      aria-labelledby="theater-title"
    >
      <div className="theater-sticky">
        <div className="theater__ambient" aria-hidden>
          <span className="theater__orb theater__orb--a" />
          <span className="theater__orb theater__orb--b" />
        </div>

        <div className="container theater">
          <div className="theater__top">
            <header className="section-head theater__head">
              <p className="eyebrow">{theaterCopy.eyebrow}</p>
              <h2 id="theater-title">{theaterCopy.title}</h2>
              <p className="section-sub">{theaterCopy.subtitle}</p>
            </header>
            <ScrollScrub progress={progress} label="theater" />
          </div>

          <div className="theater__stage">
            <div className="theater__beats" role="list" aria-label="Story beats">
              {beatLabels.map((label, i) => (
                <button
                  key={label}
                  type="button"
                  role="listitem"
                  className={`theater__beat ${i === beat ? 'is-active' : ''} ${
                    i < beat ? 'is-done' : ''
                  }`}
                  aria-current={i === beat ? 'step' : undefined}
                  tabIndex={-1}
                >
                  <span className="theater__beat-num">{i}</span>
                  <span className="theater__beat-label">{label}</span>
                </button>
              ))}
            </div>

            <div className={`gowild-strip ${beat >= 2 ? 'is-on' : ''}`} aria-hidden={beat < 2}>
              <span className="gowild-strip__badge">Go-wild Monday</span>
              <span className="gowild-strip__text">
                {beat >= 5 ? goWildMonday.offer : 'Persona deals unlock with fit scores'}
              </span>
            </div>

            <div className={stageClass}>
              <div className="stage-card__chrome" aria-hidden>
                <span />
                <span />
                <span />
                <em>
                  {showPdp ? 'aurix · pdp' : showCart ? 'aurix · cart' : 'aurix · live discovery'}
                </em>
              </div>

              {!showPdp && !showCart ? (
                <div
                  className={`search-bar ${beat === 0 && !reduced ? 'search-bar--typing' : ''}`}
                  aria-live="polite"
                >
                  <span className="search-bar__icon" aria-hidden>
                    ⌕
                  </span>
                  <span className="search-bar__query">
                    {beautyQuery.slice(0, typedLen)}
                    {beat === 0 && !reduced ? <span className="caret" aria-hidden /> : null}
                  </span>
                  {!typedLen ? (
                    <span className="search-bar__placeholder">Search products…</span>
                  ) : null}
                </div>
              ) : null}

              <AnimatePresence mode="wait">
                {showParse ? (
                  <motion.div
                    key="chips"
                    className="parse-chips"
                    initial={reduced ? false : { opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.35, ease: softEase }}
                  >
                    {parseChips.map((c, i) => (
                      <motion.span
                        key={c.id}
                        className={`chip chip--${c.tone}`}
                        initial={reduced ? false : { opacity: 0, scale: 0.65, y: 14 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={
                          reduced ? { duration: 0 } : { ...spring, delay: 0.04 + i * 0.08 }
                        }
                      >
                        {c.label}
                      </motion.span>
                    ))}
                  </motion.div>
                ) : null}
              </AnimatePresence>

              <AnimatePresence mode="wait">
                {showFail ? (
                  <motion.div
                    key="fail"
                    className="stage-body"
                    initial={reduced ? false : { opacity: 0, y: 24, filter: 'blur(8px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -16, filter: 'blur(6px)' }}
                    transition={{ duration: 0.4, ease: softEase }}
                  >
                    <div className="product-grid">
                      {failProducts.map((p, i) => (
                        <ProductTile key={p.id} product={p} mode="fail" index={i} />
                      ))}
                    </div>
                  </motion.div>
                ) : null}

                {showContext ? (
                  <motion.div
                    key="context"
                    className="stage-body"
                    initial={reduced ? false : { opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.4, ease: softEase }}
                  >
                    <ContextRail reduced={reduced} />
                    <p className="context-caption">
                      <span className="text-mint">Personalisation + location</span>
                      {' — '}shelf adapts before results land.
                    </p>
                  </motion.div>
                ) : null}

                {showScored ? (
                  <motion.div
                    key="scored"
                    className="stage-body stage-body--split"
                    initial={reduced ? false : { opacity: 0, y: 24, filter: 'blur(8px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.42, ease: softEase }}
                  >
                    <div className="product-grid">
                      {aurixProducts.map((p, i) => (
                        <ProductTile
                          key={p.id}
                          product={p}
                          mode="win"
                          index={i}
                          showAttrs
                        />
                      ))}
                    </div>
                    <ExplainPanel />
                  </motion.div>
                ) : null}

                {showRoutine ? (
                  <motion.div
                    key="routine"
                    className="stage-body"
                    initial={reduced ? false : { opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.42, ease: softEase }}
                  >
                    <div className="product-grid product-grid--hero-row">
                      {aurixProducts.slice(0, 2).map((p, i) => (
                        <ProductTile key={p.id} product={p} mode="win" index={i} />
                      ))}
                    </div>
                    <RoutineRail reduced={reduced} emphasis />
                  </motion.div>
                ) : null}

                {showPdp ? (
                  <motion.div
                    key="pdp"
                    className="stage-body"
                    initial={reduced ? false : { opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -14 }}
                    transition={{ duration: 0.42, ease: softEase }}
                  >
                    <PdpStage reduced={reduced} />
                  </motion.div>
                ) : null}

                {showCart ? (
                  <motion.div
                    key="cart"
                    className="stage-body"
                    initial={reduced ? false : { opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.42, ease: softEase }}
                  >
                    <CartStage reduced={reduced} />
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
