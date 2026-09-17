import { useMemo, useRef, type CSSProperties } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { theaterCopy } from '../data/copy'
import {
  aurixProducts,
  beatLabels,
  beautyQuery,
  explainPanel,
  failProducts,
  parseChips,
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
}: {
  product: ProductCard
  mode: 'fail' | 'win'
  index: number
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
        {mode === 'win' && product.highlight && (
          <span className="product-tile__halo" />
        )}
      </div>
      <div className="product-tile__meta">
        <div className="product-tile__row">
          <span className="product-tile__name">{product.name}</span>
          {product.tag && <span className="chip chip--mint">{product.tag}</span>}
        </div>
        <div className="product-tile__row product-tile__row--sub">
          <span className="product-tile__price">{product.price}</span>
          <span className="product-tile__rating">★ {product.rating}</span>
        </div>
        {mode === 'fail' && product.failReason && (
          <p className="product-tile__fail">{product.failReason}</p>
        )}
        {mode === 'win' && (
          <div className="fit-bar" aria-label={`Fit score ${product.fit}`}>
            <div className="fit-bar__track">
              <motion.div
                className="fit-bar__fill"
                initial={{ width: 0 }}
                animate={{ width: `${product.fit}%` }}
                transition={{ duration: 0.75, ease: softEase, delay: 0.12 + index * 0.05 }}
              />
            </div>
            <span className="fit-bar__label">{product.fit}%</span>
          </div>
        )}
      </div>
    </div>
  )
}

function ExplainPanel() {
  return (
    <aside className="explain" aria-label="Fit explanation">
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
        <span className="explain__label">Compatibility</span>
        <p>{explainPanel.compatibility}</p>
      </div>
      <div className="explain__block">
        <span className="explain__label">Sentiment</span>
        <p>{explainPanel.sentiment}</p>
      </div>
    </aside>
  )
}

export function ShopperTheater() {
  const reduced = usePrefersReducedMotion()
  const containerRef = useRef<HTMLElement>(null)
  const progress = useScrollProgress(containerRef)
  const beat = reduced ? 4 : beatFromProgress(progress, 5)

  const typedLen = useMemo(() => {
    if (reduced) return beautyQuery.length
    if (beat < 1) return 0
    if (beat === 1) {
      const local = Math.min(1, Math.max(0, progress * 5 - 1))
      return Math.floor(local * beautyQuery.length)
    }
    return beautyQuery.length
  }, [beat, progress, reduced])

  const showChips = beat >= 2
  const showAurix = beat >= 3
  const showExplain = beat >= 3
  const showRecover = beat >= 4

  const products = showAurix ? aurixProducts : failProducts
  const mode = showAurix ? 'win' : 'fail'

  const stageClass = [
    'stage-card',
    showAurix ? 'stage-card--live' : '',
    showRecover ? 'stage-card--recover' : '',
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

            <div className={stageClass}>
              <div className="stage-card__chrome" aria-hidden>
                <span />
                <span />
                <span />
                <em>aurix · live query</em>
              </div>

              <div
                className={`search-bar ${beat === 1 && !reduced ? 'search-bar--typing' : ''}`}
                aria-live="polite"
              >
                <span className="search-bar__icon" aria-hidden>
                  ⌕
                </span>
                <span className="search-bar__query">
                  {beautyQuery.slice(0, typedLen)}
                  {beat === 1 && !reduced && <span className="caret" aria-hidden />}
                </span>
                {!typedLen && (
                  <span className="search-bar__placeholder">Search products…</span>
                )}
              </div>

              <AnimatePresence mode="wait">
                {showChips && (
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
                          reduced
                            ? { duration: 0 }
                            : { ...spring, delay: 0.04 + i * 0.09 }
                        }
                      >
                        {c.label}
                      </motion.span>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className={`stage-body ${showExplain ? 'stage-body--split' : ''}`}>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={mode}
                    className="product-grid"
                    initial={
                      reduced ? false : { opacity: 0, y: 32, filter: 'blur(10px)' }
                    }
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -22, filter: 'blur(8px)', scale: 0.98 }}
                    transition={{ duration: 0.42, ease: softEase }}
                  >
                    {products.map((p, i) => (
                      <motion.div
                        key={p.id}
                        initial={reduced ? false : { opacity: 0, y: 26, scale: 0.92 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={
                          reduced
                            ? { duration: 0 }
                            : { duration: 0.42, ease: softEase, delay: 0.04 + i * 0.07 }
                        }
                      >
                        <ProductTile product={p} mode={mode} index={i} />
                      </motion.div>
                    ))}
                  </motion.div>
                </AnimatePresence>

                <AnimatePresence mode="wait">
                  {showExplain && (
                    <motion.div
                      key="explain"
                      initial={reduced ? false : { opacity: 0, x: 40, scale: 0.94 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: 18 }}
                      transition={{ duration: 0.48, ease: softEase }}
                    >
                      <ExplainPanel />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <AnimatePresence mode="wait">
                {showRecover && (
                  <motion.p
                    key="recover"
                    className="recover-banner"
                    initial={reduced ? false : { opacity: 0, y: 18, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.48, ease: softEase }}
                  >
                    <span className="text-mint">Moment recovered.</span> She found the
                    serum she meant — explained, priced, and in stock.
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
