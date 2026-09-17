# Aurix Hero v2

Production marketing landing page for **Aurix** — *the self-driving beauty shelf*.

Vite + React + TypeScript + Framer Motion. Story-driven sticky scroll theater for DT and marketing heads.

## Run locally

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

## Build

```bash
npm run build
npm run preview
```

## Page structure

| Section | ID | Role |
|---------|-----|------|
| Sticky nav | — | Product anchors + dual CTAs |
| §0 Hook | `#top` | H1, sub, dual CTA, “Live in under four hours” |
| §1 Shopper theater | `#theater` | Scroll-scrub sticky stage (signature) |
| §2 Merch Desk | `#merch` | Overnight inbox cascade (signature) |
| §3 Proof | `#proof` | One static outcome + go-live promise + logos |
| §4 Final CTA | `#cta` | Dual CTA band |
| Footer | — | Links + copyright |

## CTAs / placeholder URLs

Configured in [`src/config/links.ts`](src/config/links.ts):

- Primary: **Run Search Audit on your site** → `https://aurix.ai/search-audit`
- Secondary: **Book a strategy demo** → `https://aurix.ai/demo`

No audit UI or forms — outbound links only.

## Content modules

Edit copy without hunting JSX:

- `src/data/copy.ts` — nav, hook, section heads, proof, footer
- `src/data/theater.ts` — beauty query, chips, products, explain panel
- `src/data/merchDesk.ts` — Merch Desk inbox cards

## Motion / a11y

- Framer Motion + CSS sticky scroll sections for theater and Merch Desk
- `prefers-reduced-motion: reduce` jumps to final theater / inbox states

## Palette

Official brief tokens in `src/index.css`: blues #0F1B39 / #0A1124 / #1A2947, greens #93B78F + bright oklch, coral loss, fonts Sora / Inter / IBM Plex Mono.
