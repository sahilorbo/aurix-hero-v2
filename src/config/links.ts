/**
 * CTA and external URLs for Aurix Hero v2.
 * Placeholder destinations — replace when product URLs are finalized.
 */
export const links = {
  /** Primary CTA — Search Audit (no in-app audit UI; outbound link only) */
  searchAudit: 'https://aurix.ai/search-audit',
  /** Secondary CTA — strategy demo booking */
  demo: 'https://aurix.ai/demo',
  home: 'https://aurix.ai',
  privacy: 'https://aurix.ai/privacy',
  terms: 'https://aurix.ai/terms',
} as const;

export type LinkKey = keyof typeof links;
