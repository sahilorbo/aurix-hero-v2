export const brand = {
  name: 'aurix',
  tagline: 'The self-driving beauty shelf',
} as const;

export const nav = {
  links: [
    { label: 'Product', href: '#theater' },
    { label: 'How it works', href: '#merch' },
    { label: 'Proof', href: '#proof' },
  ],
  primaryCta: 'Run Search Audit',
  secondaryCta: 'Book a demo',
} as const;

export const hook = {
  eyebrow: 'Beauty discovery · Merch Studio',
  h1: 'The self-driving beauty shelf',
  sub: 'Your catalog finds, ranks, and completes what shoppers mean — you approve what goes live.',
  primaryCta: 'Run Search Audit on your site',
  secondaryCta: 'Book a strategy demo',
  promise: 'Live in under four hours',
} as const;

export const theaterCopy = {
  id: 'theater',
  eyebrow: 'Act 1 · Shopper theater',
  title: 'She typed what she meant. Ordinary search heard keywords.',
  subtitle:
    'Watch Aurix parse a real beauty query, re-rank the shelf, and explain the fit — in one scroll.',
} as const;

export const merchCopy = {
  id: 'merch',
  eyebrow: 'Act 2 · Merch Desk',
  title: 'Overnight, the shelf wrote you a brief.',
  subtitle:
    'Unmet demand, ranking moves, and routine gaps arrive as proposals. You approve. Nothing ships without you.',
} as const;

export const proofCopy = {
  id: 'proof',
  eyebrow: 'Proof',
  title: 'One outcome. No vanity roulette.',
  outcome: {
    metric: '+52%',
    label: 'search-led conversion lift',
    detail: 'vs. baseline keyword search on a beauty catalog after Aurix went live.',
  },
  promise: 'Live in under four hours',
  promiseDetail: 'Point Aurix at your catalog. Search that understands intent — without a six-month rebuild.',
  logosLabel: 'Trusted by beauty & lifestyle teams',
  logos: ['Lumina Beauty', 'Velvet Cart', 'SkinLane', 'Orbital Mart', 'Nectar Co'],
} as const;

export const finalCta = {
  title: 'Ready to see what your shelf is missing?',
  sub: 'Run a Search Audit on your site — or book a strategy demo with the Aurix team.',
  primaryCta: 'Run Search Audit on your site',
  secondaryCta: 'Book a strategy demo',
} as const;

export const footer = {
  blurb: 'Aurix is the self-driving beauty shelf — discovery that understands intent, merchandising you still control.',
  columns: [
    {
      title: 'Product',
      links: [
        { label: 'Shopper search', href: '#theater' },
        { label: 'Merch Desk', href: '#merch' },
        { label: 'Search Audit', href: 'searchAudit' as const },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'Book a demo', href: 'demo' as const },
        { label: 'Privacy', href: 'privacy' as const },
        { label: 'Terms', href: 'terms' as const },
      ],
    },
  ],
  copyright: `© ${new Date().getFullYear()} Aurix. All rights reserved.`,
} as const;
