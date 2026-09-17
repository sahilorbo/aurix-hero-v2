import { useMemo, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { theaterCopy } from '../data/copy';
import {
  aurixProducts,
  beatLabels,
  beautyQuery,
  explainPanel,
  failProducts,
  parseChips,
  type ProductCard,
} from '../data/theater';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { beatFromProgress, useScrollProgress } from '../hooks/useScrollProgress';

function ProductTile({
  product,
  mode,
}: {
  product: ProductCard;
  mode: 'fail' | 'win';
}) {
  return (
    <div
      className={`product-tile ${product.highlight ? 'product-tile--hero' : ''} ${
        mode === 'fail' ? 'product-tile--fail' : ''
      }`}
    >
      <div className="product-tile__swatch" aria-hidden>
        <div className="product-tile__bottle" />
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
              <div className="fit-bar__fill" style={{ width: `${product.fit}%` }} />
            </div>
            <span className="fit-bar__label">{product.fit}% fit</span>
          </div>
        )}
      </div>
    </div>
  );
}

function ExplainPanel() {
  return (
    <aside className="explain" aria-label="Fit explanation">
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
  );
}

export function ShopperTheater() {
  const reduced = usePrefersReducedMotion();
  const containerRef = useRef<HTMLElement>(null);
  const progress = useScrollProgress(containerRef);
  const beat = reduced ? 4 : beatFromProgress(progress, 5);

  const typedLen = useMemo(() => {
    if (reduced) return beautyQuery.length;
    if (beat < 1) return 0;
    if (beat === 1) {
      // type through beat 1 portion of scroll
      const local = Math.min(1, Math.max(0, progress * 5 - 1));
      return Math.floor(local * beautyQuery.length);
    }
    return beautyQuery.length;
  }, [beat, progress, reduced]);

  const showChips = beat >= 2;
  const showAurix = beat >= 3;
  const showExplain = beat >= 3;
  const showRecover = beat >= 4;

  const products = showAurix ? aurixProducts : failProducts;
  const mode = showAurix ? 'win' : 'fail';

  return (
    <section
      ref={containerRef}
      className="theater-scroll"
      id={theaterCopy.id}
      aria-labelledby="theater-title"
    >
      <div className="theater-sticky">
        <div className="container theater">
          <header className="section-head">
            <p className="eyebrow">{theaterCopy.eyebrow}</p>
            <h2 id="theater-title">{theaterCopy.title}</h2>
            <p className="section-sub">{theaterCopy.subtitle}</p>
          </header>

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

            <div className="stage-card">
              <div className="search-bar" aria-live="polite">
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
                    initial={reduced ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35 }}
                  >
                    {parseChips.map((c, i) => (
                      <motion.span
                        key={c.id}
                        className={`chip chip--${c.tone}`}
                        initial={reduced ? false : { opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: reduced ? 0 : i * 0.08 }}
                      >
                        {c.label}
                      </motion.span>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className={`stage-body ${showExplain ? 'stage-body--split' : ''}`}>
                <div className="product-grid">
                  <AnimatePresence mode="popLayout">
                    {products.map((p) => (
                      <motion.div
                        key={`${mode}-${p.id}`}
                        layout
                        initial={reduced ? false : { opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        transition={{ duration: 0.35 }}
                      >
                        <ProductTile product={p} mode={mode} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                <AnimatePresence>
                  {showExplain && (
                    <motion.div
                      key="explain"
                      initial={reduced ? false : { opacity: 0, x: 24 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      <ExplainPanel />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <AnimatePresence>
                {showRecover && (
                  <motion.p
                    key="recover"
                    className="recover-banner"
                    initial={reduced ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
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
  );
}
