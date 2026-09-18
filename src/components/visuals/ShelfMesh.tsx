import { useEffect, useRef, useState } from 'react'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'

type SkuRole = 'winner' | 'weak' | 'neutral'
type SkuKind = 'bottle' | 'brush'

type SkuNode = {
  x: number
  y: number
  r: number
  role: SkuRole
  kind: SkuKind
  score: number
  phase: number
}

const C = {
  mint: '#93B78F',
  mintBright: '#A8E89C',
  coral: '#E07A5F',
  amber: '#FFC857',
  white: '#FFFFFF',
  navy: '#1A2947',
}

/** Total loop length in seconds — readable ~16s pass */
const LOOP = 16

const BEATS: { at: number; until: number; caption: string }[] = [
  { at: 0.0, until: 2.8, caption: 'Query enters' },
  { at: 2.8, until: 5.8, caption: 'Catalog fan-out' },
  { at: 5.8, until: 8.8, caption: 'Compatibility scores' },
  { at: 8.8, until: 11.6, caption: 'Weak matches fade' },
  { at: 11.6, until: 16.0, caption: 'Winners + routine' },
]

function beatIndexFor(t: number) {
  for (let i = 0; i < BEATS.length; i++) {
    if (t >= BEATS[i].at && t < BEATS[i].until) return i
  }
  return BEATS.length - 1
}

/** Active = 1, past (persisted dim) = dim, future = 0 */
function beatFocus(t: number, i: number, dim = 0.38) {
  const active = beatIndexFor(t)
  if (i > active) return 0
  if (i === active) return 1
  return dim
}

/**
 * Staged discovery story: query → fan-out → scores → weak fade → winners pulse.
 * ~16s loop; canvas prior beats persist dimmed. Beat captions show only the active
 * step, then clear. Prefers-reduced-motion → final winning state.
 * SKU nodes are beauty product silhouettes (bottles / brushes), not abstract dots.
 */
export function ShelfMesh() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduced = usePrefersReducedMotion()
  const [activeBeat, setActiveBeat] = useState(reduced ? BEATS.length - 1 : 0)
  const activeBeatRef = useRef(activeBeat)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    let start = performance.now()
    let w = 0
    let h = 0
    let dpr = 1

    let hub = { x: 0, y: 0, r: 9 }
    let skus: SkuNode[] = []
    let winners: number[] = []
    let queryStart = { x: 0, y: 0 }

    const layout = () => {
      const rect = canvas.getBoundingClientRect()
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = rect.width
      h = rect.height
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      hub = { x: w * 0.26, y: h * 0.48, r: Math.max(9, Math.min(12, w * 0.02)) }
      queryStart = { x: w * 0.06, y: h * 0.48 }

      // Curated shelf positions — winners clustered mid-right for a clean ending
      // (avoids grid spaghetti / overlapping edge fan on the right)
      const slots: { nx: number; ny: number; role: SkuRole; kind: SkuKind; score: number }[] = [
        // Top shelf — periphery + one weak
        { nx: 0.48, ny: 0.24, role: 'neutral', kind: 'bottle', score: 0.48 },
        { nx: 0.62, ny: 0.22, role: 'weak', kind: 'brush', score: 0.22 },
        { nx: 0.78, ny: 0.24, role: 'neutral', kind: 'bottle', score: 0.52 },
        { nx: 0.9, ny: 0.26, role: 'weak', kind: 'bottle', score: 0.18 },
        // Mid shelf — winners clustered, one weak on edge
        { nx: 0.5, ny: 0.48, role: 'neutral', kind: 'brush', score: 0.44 },
        { nx: 0.64, ny: 0.44, role: 'winner', kind: 'bottle', score: 0.92 },
        { nx: 0.74, ny: 0.52, role: 'winner', kind: 'brush', score: 0.88 },
        { nx: 0.86, ny: 0.46, role: 'weak', kind: 'bottle', score: 0.24 },
        // Lower shelf — third winner + periphery
        { nx: 0.52, ny: 0.72, role: 'weak', kind: 'brush', score: 0.28 },
        { nx: 0.66, ny: 0.68, role: 'winner', kind: 'bottle', score: 0.96 },
        { nx: 0.8, ny: 0.74, role: 'neutral', kind: 'brush', score: 0.46 },
        { nx: 0.9, ny: 0.7, role: 'neutral', kind: 'bottle', score: 0.5 },
      ]

      skus = []
      winners = []
      for (let i = 0; i < slots.length; i++) {
        const s = slots[i]
        skus.push({
          x: w * s.nx,
          y: h * s.ny,
          r: s.role === 'winner' ? 11 : 9,
          role: s.role,
          kind: s.kind,
          score: s.score,
          phase: i * 0.45,
        })
        if (s.role === 'winner') winners.push(skus.length - 1)
      }
    }

    const easeInOut = (t: number) =>
      t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
    const clamp01 = (t: number) => Math.max(0, Math.min(1, t))
    const seg = (t: number, a: number, b: number) =>
      clamp01((t - a) / Math.max(0.001, b - a))

    const updateActiveBeat = (t: number) => {
      const next = beatIndexFor(t)
      if (next !== activeBeatRef.current) {
        activeBeatRef.current = next
        setActiveBeat(next)
      }
    }

    const drawShelfFrame = () => {
      const left = w * 0.4
      const right = w * 0.96
      const top = h * 0.12
      const bottom = h * 0.86

      ctx.save()
      ctx.strokeStyle = 'rgba(122, 148, 196, 0.35)'
      ctx.lineWidth = 1.25
      roundRect(ctx, left, top, right - left, bottom - top, 6)
      ctx.stroke()

      for (let i = 1; i < 3; i++) {
        const y = top + ((bottom - top) * i) / 3
        ctx.beginPath()
        ctx.moveTo(left + 8, y)
        ctx.lineTo(right - 8, y)
        ctx.strokeStyle = 'rgba(180, 200, 230, 0.14)'
        ctx.lineWidth = 1
        ctx.stroke()
      }
      ctx.restore()
    }

    const drawGrid = () => {
      ctx.save()
      ctx.strokeStyle = 'rgba(26, 41, 71, 0.7)'
      ctx.lineWidth = 1
      const step = 40
      for (let x = 0; x < w; x += step) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, h)
        ctx.stroke()
      }
      for (let y = 0; y < h; y += step) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(w, y)
        ctx.stroke()
      }
      ctx.restore()
    }

    const drawLegend = () => {
      ctx.save()
      ctx.font = '600 9px "IBM Plex Mono", monospace'
      const chips: { label: string; fill: string; stroke: string }[] = [
        { label: 'AURIX', fill: 'rgba(168, 232, 156, 0.95)', stroke: C.mintBright },
        { label: 'SKU', fill: 'rgba(147, 183, 143, 0.9)', stroke: C.mint },
        { label: 'SIGNAL', fill: 'rgba(255, 200, 87, 0.95)', stroke: C.amber },
        { label: 'LOSS', fill: 'rgba(224, 122, 95, 0.95)', stroke: C.coral },
      ]
      let cx = w - 12
      for (let i = chips.length - 1; i >= 0; i--) {
        const chip = chips[i]
        const cw = ctx.measureText(chip.label).width + 26
        cx -= cw + 5
        roundRect(ctx, cx, 8, cw, 20, 4)
        ctx.fillStyle = 'rgba(10, 17, 36, 0.9)'
        ctx.fill()
        ctx.strokeStyle = chip.stroke
        ctx.lineWidth = 1
        ctx.stroke()
        ctx.beginPath()
        ctx.arc(cx + 10, 18, 3.5, 0, Math.PI * 2)
        ctx.fillStyle = chip.fill
        ctx.fill()
        ctx.fillStyle = 'rgba(255,255,255,0.88)'
        ctx.fillText(chip.label, cx + 18, 21.5)
      }

      const title = 'DISCOVERY · LIVE'
      const tw = ctx.measureText(title).width
      roundRect(ctx, 10, 8, tw + 16, 20, 4)
      ctx.fillStyle = 'rgba(15, 27, 57, 0.85)'
      ctx.fill()
      ctx.strokeStyle = 'rgba(168, 232, 156, 0.5)'
      ctx.lineWidth = 1
      ctx.stroke()
      ctx.fillStyle = C.mintBright
      ctx.fillText(title, 18, 21.5)
      ctx.restore()
    }

    const drawHub = (glow: number, queryArrived: boolean) => {
      const r = hub.r
      ctx.beginPath()
      ctx.arc(hub.x, hub.y, r * (2.8 + glow * 0.6), 0, Math.PI * 2)
      ctx.fillStyle = `rgba(168, 232, 156, ${0.06 + glow * 0.1})`
      ctx.fill()
      ctx.beginPath()
      ctx.arc(hub.x, hub.y, r * 1.7, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(168, 232, 156, ${0.35 + glow * 0.4})`
      ctx.lineWidth = 1.5
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(hub.x, hub.y, r, 0, Math.PI * 2)
      ctx.fillStyle = queryArrived ? C.mintBright : 'rgba(147, 183, 143, 0.55)'
      ctx.fill()
      ctx.strokeStyle = C.white
      ctx.lineWidth = 1.25
      ctx.stroke()

      ctx.font = '600 9px "IBM Plex Mono", monospace'
      ctx.fillStyle = 'rgba(255,255,255,0.72)'
      ctx.textAlign = 'center'
      ctx.fillText('Aurix', hub.x, hub.y + r + 14)
      ctx.textAlign = 'left'
    }

    /** Beat 0 — query travels in; stays as dim marker after arrival */
    const drawQuery = (t: number) => {
      const focus = beatFocus(t, 0)
      if (focus <= 0) return false

      const p = easeInOut(seg(t, 0.2, 2.4))
      const arrived = p >= 0.98
      const qx = arrived
        ? hub.x
        : queryStart.x + (hub.x - queryStart.x) * Math.min(1, p)
      const qy = arrived
        ? hub.y
        : queryStart.y + (hub.y - queryStart.y) * Math.min(1, p)

      ctx.beginPath()
      ctx.moveTo(queryStart.x, queryStart.y)
      ctx.lineTo(arrived ? hub.x : qx, arrived ? hub.y : qy)
      ctx.strokeStyle = `rgba(255, 200, 87, ${(0.2 + p * 0.4) * focus})`
      ctx.lineWidth = focus >= 1 ? 2 : 1.25
      ctx.stroke()

      if (!arrived) {
        ctx.beginPath()
        ctx.arc(qx, qy, 5, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 200, 87, ${0.95 * focus})`
        ctx.fill()
        ctx.beginPath()
        ctx.arc(qx, qy, 10, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 200, 87, ${0.2 * focus})`
        ctx.fill()
      } else {
        ctx.beginPath()
        ctx.arc(queryStart.x, queryStart.y, 3.5, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 200, 87, ${0.55 * focus})`
        ctx.fill()

        if (focus >= 1 && t < 3.1) {
          const fade = 1 - seg(t, 2.4, 3.1)
          ctx.beginPath()
          ctx.arc(hub.x, hub.y, hub.r * (1.4 + fade), 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(255, 200, 87, ${0.5 * fade})`
          ctx.lineWidth = 2
          ctx.stroke()
        }
      }

      const labelX = queryStart.x + (hub.x - queryStart.x) * 0.35
      const labelY = queryStart.y - 12
      ctx.font = '600 9px "IBM Plex Mono", monospace'
      ctx.fillStyle =
        focus >= 1
          ? C.amber
          : `rgba(255, 200, 87, ${0.45 * focus / 0.38})`
      ctx.fillText('query', labelX, labelY)

      return arrived
    }

    /**
     * Beat 1 — catalog fan-out.
     * After scores begin, spokes stay only as a faint memory (no double-draw spaghetti).
     */
    const drawFanOut = (t: number) => {
      const focus = beatFocus(t, 1)
      if (focus <= 0) return

      const p = easeInOut(seg(t, 2.8, 5.5))
      if (p <= 0) return

      // Once scoring / later beats take over, keep spokes very faint only
      const pastMul = focus >= 1 ? 1 : 0.35

      for (let i = 0; i < skus.length; i++) {
        const sku = skus[i]
        const stagger = (i / skus.length) * 0.4
        const lp = clamp01((p - stagger) / Math.max(0.25, 1 - stagger * 0.5))
        if (lp <= 0) continue

        const ex = hub.x + (sku.x - hub.x) * lp
        const ey = hub.y + (sku.y - hub.y) * lp

        const alpha =
          focus >= 1
            ? 0.12 + lp * 0.28
            : 0.04 * pastMul * lp
        ctx.beginPath()
        ctx.moveTo(hub.x, hub.y)
        ctx.lineTo(ex, ey)
        ctx.strokeStyle = `rgba(255, 200, 87, ${alpha})`
        ctx.lineWidth = focus >= 1 ? 1.15 : 0.9
        ctx.stroke()

        if (focus >= 1 && lp < 1) {
          drawDiamond(ctx, ex, ey, 2.8)
          ctx.fillStyle = 'rgba(255, 200, 87, 0.9)'
          ctx.fill()
        }
      }
    }

    /**
     * Beat 2 — compatibility scores.
     * Only draw score rings + labels; edges only for winners / a few samples
     * to avoid a solid amber mesh on the right.
     */
    const drawScores = (t: number) => {
      const focus = beatFocus(t, 2)
      if (focus <= 0) return 0

      const p = t >= 5.8 ? easeInOut(seg(t, 5.8, 8.4)) : 0
      if (p <= 0) return 0

      const weakP = t >= 8.8 ? easeInOut(seg(t, 8.8, 11.3)) : 0
      const winActive = t >= 11.6

      for (let i = 0; i < skus.length; i++) {
        const sku = skus[i]
        const stagger = (i % 4) * 0.09
        const sp = clamp01((p - stagger) / 0.7)
        if (sp <= 0) continue

        const roleDim =
          sku.role === 'weak' && weakP > 0 ? 1 - weakP * 0.85 : 1
        // After winners beat, mute non-winner score chrome
        const lateDim =
          winActive && sku.role !== 'winner' ? 0.25 : 1
        const aMul = focus * roleDim * lateDim

        // Sparse edges: winners always; others every 3rd only during active score beat
        const drawEdge =
          sku.role === 'winner' ||
          (focus >= 1 && sku.role !== 'weak' && i % 3 === 0)
        if (drawEdge && !winActive) {
          ctx.beginPath()
          ctx.moveTo(hub.x, hub.y)
          ctx.lineTo(sku.x, sku.y)
          ctx.strokeStyle =
            sku.role === 'winner'
              ? `rgba(168, 232, 156, ${(0.1 + sp * 0.32) * aMul})`
              : `rgba(255, 200, 87, ${(0.05 + sp * 0.12) * aMul})`
          ctx.lineWidth = sku.role === 'winner' ? 1.5 : 1
          ctx.stroke()
        }

        const ringR = sku.r + 7
        ctx.beginPath()
        ctx.arc(
          sku.x,
          sku.y,
          ringR,
          -Math.PI / 2,
          -Math.PI / 2 + Math.PI * 2 * sku.score * sp,
        )
        const ringColor =
          sku.role === 'winner'
            ? C.mintBright
            : sku.role === 'weak'
              ? C.coral
              : C.amber
        ctx.globalAlpha = aMul
        ctx.strokeStyle = ringColor
        ctx.lineWidth = focus >= 1 ? 2 : 1.35
        ctx.stroke()
        ctx.globalAlpha = 1

        // Readable scores on winners always; a couple neutrals while scoring
        if (
          sp > 0.5 &&
          (sku.role === 'winner' || (focus >= 1 && sku.role === 'neutral' && i % 3 === 0))
        ) {
          ctx.font = '600 9px "IBM Plex Mono", monospace'
          ctx.fillStyle =
            sku.role === 'winner'
              ? `rgba(168, 232, 156, ${Math.min(1, aMul + 0.15)})`
              : `rgba(255, 200, 87, ${0.85 * aMul})`
          ctx.textAlign = 'center'
          ctx.fillText(`${Math.round(sku.score * 100)}`, sku.x, sku.y - ringR - 5)
          ctx.textAlign = 'left'
        }
      }
      return p
    }

    const drawWeakFade = (t: number) => easeInOut(seg(t, 8.8, 11.3))

    /** Beat 4 — winners + routine mint pulse; only winner edges remain */
    const drawWinners = (t: number, pulseT: number) => {
      const focus = beatFocus(t, 4, 0.55)
      if (focus <= 0) return 0

      const p = t >= 11.6 ? easeInOut(seg(t, 11.6, 14.0)) : 0
      if (p <= 0) return 0

      if (winners.length >= 2) {
        const pairs: [number, number, string][] = [
          [winners[0], winners[1], 'similar'],
          [winners[1], winners[2] ?? winners[0], 'routine'],
        ]
        for (const [a, b, label] of pairs) {
          if (a === b || a == null || b == null) continue
          const na = skus[a]
          const nb = skus[b]
          const pulse = 0.55 + Math.sin(pulseT * 1.6) * 0.35
          ctx.beginPath()
          ctx.moveTo(na.x, na.y)
          ctx.lineTo(nb.x, nb.y)
          ctx.strokeStyle = `rgba(168, 232, 156, ${p * pulse * 0.8 * focus})`
          ctx.lineWidth = 2.1
          ctx.setLineDash([4, 4])
          ctx.stroke()
          ctx.setLineDash([])

          if (p > 0.4) {
            const mx = (na.x + nb.x) / 2
            const my = (na.y + nb.y) / 2
            ctx.font = '600 8px "IBM Plex Mono", monospace'
            const lw = ctx.measureText(label).width
            roundRect(ctx, mx - lw / 2 - 5, my - 8, lw + 10, 14, 3)
            ctx.fillStyle = 'rgba(10, 17, 36, 0.9)'
            ctx.fill()
            ctx.strokeStyle = `rgba(168, 232, 156, ${0.55 * p * focus})`
            ctx.lineWidth = 1
            ctx.stroke()
            ctx.fillStyle =
              focus >= 1 ? C.mintBright : `rgba(168, 232, 156, ${0.7})`
            ctx.textAlign = 'center'
            ctx.fillText(label, mx, my + 3)
            ctx.textAlign = 'left'
          }
        }
      }

      for (const wi of winners) {
        const sku = skus[wi]
        const pulse = 0.6 + Math.sin(pulseT * 1.5 + sku.phase) * 0.4
        ctx.beginPath()
        ctx.moveTo(hub.x, hub.y)
        ctx.lineTo(sku.x, sku.y)
        ctx.strokeStyle = `rgba(168, 232, 156, ${p * pulse * 0.72 * focus})`
        ctx.lineWidth = 2
        ctx.stroke()
      }

      return p
    }

    const drawContextRing = (t: number) => {
      const p = easeInOut(seg(t, 13.2, 15.2))
      if (p <= 0) return
      ctx.beginPath()
      ctx.arc(hub.x, hub.y, hub.r * 4.2, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(122, 148, 196, ${0.15 + p * 0.35})`
      ctx.lineWidth = 1.5
      ctx.setLineDash([3, 5])
      ctx.stroke()
      ctx.setLineDash([])
      if (p > 0.35) {
        ctx.font = '600 8px "IBM Plex Mono", monospace'
        ctx.fillStyle = `rgba(180, 200, 230, ${p * 0.85})`
        ctx.textAlign = 'center'
        ctx.fillText('persona · locale', hub.x, hub.y - hub.r * 4.2 - 6)
        ctx.textAlign = 'left'
      }
    }

    const drawSkus = (
      t: number,
      scoreP: number,
      weakP: number,
      winP: number,
      pulseT: number,
    ) => {
      for (let i = 0; i < skus.length; i++) {
        const sku = skus[i]
        let fill = 'rgba(147, 183, 143, 0.55)'
        let stroke: string = C.mint
        let scale = 1
        let alpha = 1

        if (t < 2.8) {
          fill = 'rgba(122, 148, 196, 0.4)'
          stroke = 'rgba(122, 148, 196, 0.55)'
        } else if (t < 5.8) {
          const wake = clamp01((seg(t, 2.8, 5.5) * skus.length - i) / 3)
          const a = 0.35 + wake * 0.5
          fill = `rgba(147, 183, 143, ${a})`
          stroke = C.mint
        } else if (scoreP > 0 && weakP < 0.08) {
          if (sku.role === 'winner') {
            fill = `rgba(168, 232, 156, ${0.6 + scoreP * 0.35})`
            stroke = C.mintBright
            scale = 1 + scoreP * 0.12
          } else if (sku.role === 'weak') {
            fill = `rgba(255, 200, 87, ${0.45 + scoreP * 0.2})`
            stroke = C.amber
          } else {
            fill = `rgba(147, 183, 143, ${0.4 + scoreP * 0.2})`
            stroke = C.mint
          }
        } else {
          if (sku.role === 'weak') {
            alpha = 1 - weakP * 0.82
            fill = `rgba(224, 122, 95, ${0.2 + alpha * 0.4})`
            stroke = `rgba(224, 122, 95, ${0.3 + alpha * 0.4})`
          } else if (sku.role === 'winner') {
            const pulse =
              1 + Math.sin(pulseT * 1.55 + sku.phase) * 0.1 * Math.max(winP, 0.25)
            scale = pulse * (1 + winP * 0.18)
            fill = `rgba(168, 232, 156, ${0.75 + winP * 0.2})`
            stroke = C.mintBright
            // Soft mint glow behind winner product
            ctx.beginPath()
            ctx.arc(sku.x, sku.y, sku.r * scale * 1.85, 0, Math.PI * 2)
            ctx.fillStyle = `rgba(168, 232, 156, ${0.1 + winP * 0.16})`
            ctx.fill()
          } else {
            alpha = 0.35 + (1 - weakP) * 0.35
            fill = `rgba(122, 148, 196, ${0.22 + (1 - weakP) * 0.18})`
            stroke = 'rgba(122, 148, 196, 0.5)'
          }
        }

        ctx.save()
        ctx.globalAlpha = Math.max(0.08, alpha)
        drawProductIcon(ctx, sku.x, sku.y, sku.r * scale, sku.kind, fill, stroke)
        ctx.restore()
      }
    }

    const drawBeatDots = (t: number) => {
      ctx.save()
      const dotY = h - 14
      const total = BEATS.length
      const startX = w / 2 - ((total - 1) * 12) / 2
      const active = beatIndexFor(t)
      for (let i = 0; i < total; i++) {
        const isActive = i === active
        const isPast = i < active
        ctx.beginPath()
        ctx.arc(startX + i * 12, dotY, isActive ? 3.2 : 2.2, 0, Math.PI * 2)
        ctx.fillStyle = isActive
          ? C.mintBright
          : isPast
            ? 'rgba(168, 232, 156, 0.4)'
            : 'rgba(122, 148, 196, 0.35)'
        ctx.fill()
      }
      ctx.restore()
    }

    const paintScene = (t: number, elapsed: number) => {
      ctx.clearRect(0, 0, w, h)
      const g = ctx.createRadialGradient(
        w * 0.45,
        h * 0.42,
        20,
        w * 0.5,
        h * 0.45,
        w * 0.55,
      )
      g.addColorStop(0, 'rgba(168, 232, 156, 0.07)')
      g.addColorStop(0.4, 'rgba(26, 41, 71, 0.4)')
      g.addColorStop(1, 'rgba(15, 27, 57, 0)')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, w, h)

      drawGrid()
      drawShelfFrame()

      const arrived = drawQuery(t)
      drawFanOut(t)
      const scoreP = drawScores(t)
      const weakP = drawWeakFade(t)
      const winP = drawWinners(t, elapsed)

      drawHub(arrived ? 0.7 + Math.sin(elapsed * 1.1) * 0.15 : 0.25, arrived)
      drawSkus(t, scoreP, weakP, winP, elapsed)

      if (t >= 13.2) drawContextRing(t)

      drawLegend()
      drawBeatDots(t)
    }

    const draw = (now: number) => {
      const elapsed = (now - start) / 1000
      const t = elapsed % LOOP
      updateActiveBeat(t)
      paintScene(t, elapsed)
      raf = requestAnimationFrame(draw)
    }

    layout()
    if (reduced) {
      activeBeatRef.current = BEATS.length - 1
      setActiveBeat(BEATS.length - 1)
      paintScene(14.2, 14.2)
    } else {
      raf = requestAnimationFrame(draw)
    }

    const onResize = () => {
      layout()
      if (reduced) paintScene(14.2, 14.2)
    }
    window.addEventListener('resize', onResize)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
    }
  }, [reduced])

  return (
    <div className="shelf-mesh" aria-hidden>
      <canvas ref={canvasRef} className="shelf-mesh__canvas" />
      <div className="shelf-mesh__vignette" />
      <div className="shelf-mesh__frame">
        <span className="shelf-mesh__corner shelf-mesh__corner--tl" />
        <span className="shelf-mesh__corner shelf-mesh__corner--tr" />
        <span className="shelf-mesh__corner shelf-mesh__corner--bl" />
        <span className="shelf-mesh__corner shelf-mesh__corner--br" />
      </div>
      <div className="shelf-mesh__beats">
        <span
          key={BEATS[activeBeat].caption}
          className="shelf-mesh__beat shelf-mesh__beat--active"
        >
          {BEATS[activeBeat].caption}
        </span>
      </div>
    </div>
  )
}

/** Skincare bottle silhouette (cap + neck + body) */
function drawBottle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  fill: string,
  stroke: string,
) {
  const bw = s * 0.72
  const bh = s * 1.55
  const neckW = s * 0.28
  const neckH = s * 0.28
  const capH = s * 0.32
  const capW = s * 0.42
  const bodyTop = y - bh * 0.35
  const neckTop = bodyTop - neckH
  const capTop = neckTop - capH

  // body
  roundRect(ctx, x - bw / 2, bodyTop, bw, bh * 0.72, s * 0.12)
  ctx.fillStyle = fill
  ctx.fill()
  ctx.strokeStyle = stroke
  ctx.lineWidth = 1.2
  ctx.stroke()

  // shoulder highlight
  ctx.beginPath()
  ctx.moveTo(x - bw * 0.28, bodyTop + bh * 0.12)
  ctx.lineTo(x - bw * 0.28, bodyTop + bh * 0.45)
  ctx.strokeStyle = 'rgba(255,255,255,0.22)'
  ctx.lineWidth = 1
  ctx.stroke()

  // neck
  roundRect(ctx, x - neckW / 2, neckTop, neckW, neckH + 1, 1)
  ctx.fillStyle = fill
  ctx.fill()
  ctx.strokeStyle = stroke
  ctx.lineWidth = 1
  ctx.stroke()

  // cap
  roundRect(ctx, x - capW / 2, capTop, capW, capH, s * 0.08)
  ctx.fillStyle = stroke
  ctx.globalAlpha = 0.95
  ctx.fill()
  ctx.globalAlpha = 1
  ctx.strokeStyle = 'rgba(255,255,255,0.35)'
  ctx.lineWidth = 0.9
  ctx.stroke()
}

/** Makeup brush silhouette (handle + ferrule + bristles) */
function drawBrush(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  fill: string,
  stroke: string,
) {
  const handleW = s * 0.28
  const handleH = s * 1.15
  const ferruleH = s * 0.28
  const tipH = s * 0.55
  const tipW = s * 0.55
  const handleTop = y - handleH * 0.15
  const ferruleTop = handleTop - ferruleH
  const tipTop = ferruleTop - tipH * 0.85

  // handle
  roundRect(ctx, x - handleW / 2, handleTop, handleW, handleH * 0.75, s * 0.1)
  ctx.fillStyle = fill
  ctx.fill()
  ctx.strokeStyle = stroke
  ctx.lineWidth = 1.15
  ctx.stroke()

  // ferrule (metal band)
  roundRect(ctx, x - handleW * 0.72, ferruleTop, handleW * 1.44, ferruleH, 1.5)
  ctx.fillStyle = 'rgba(200, 210, 230, 0.85)'
  ctx.fill()
  ctx.strokeStyle = stroke
  ctx.lineWidth = 1
  ctx.stroke()

  // bristles — soft teardrop
  ctx.beginPath()
  ctx.moveTo(x - tipW / 2, ferruleTop + 1)
  ctx.quadraticCurveTo(x - tipW * 0.55, tipTop + tipH * 0.35, x, tipTop)
  ctx.quadraticCurveTo(x + tipW * 0.55, tipTop + tipH * 0.35, x + tipW / 2, ferruleTop + 1)
  ctx.closePath()
  ctx.fillStyle = fill
  ctx.fill()
  ctx.strokeStyle = stroke
  ctx.lineWidth = 1.1
  ctx.stroke()
}

function drawProductIcon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  kind: SkuKind,
  fill: string,
  stroke: string,
) {
  if (kind === 'brush') drawBrush(ctx, x, y, r, fill, stroke)
  else drawBottle(ctx, x, y, r, fill, stroke)
}

function drawDiamond(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
) {
  ctx.beginPath()
  ctx.moveTo(x, y - r)
  ctx.lineTo(x + r, y)
  ctx.lineTo(x, y + r)
  ctx.lineTo(x - r, y)
  ctx.closePath()
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}
