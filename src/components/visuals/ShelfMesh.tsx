import { useEffect, useRef, useState } from 'react'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'

type SkuRole = 'winner' | 'weak' | 'neutral'

type SkuNode = {
  x: number
  y: number
  r: number
  role: SkuRole
  score: number
  phase: number
}

const C = {
  mint: '#93B78F',
  mintBright: '#A8E89C',
  coral: '#E07A5F',
  amber: '#FFC857',
  white: '#FFFFFF',
}

/** Total loop length in seconds */
const LOOP = 7.2

const BEATS: { at: number; until: number; caption: string }[] = [
  { at: 0.0, until: 1.15, caption: 'Query enters' },
  { at: 1.15, until: 2.4, caption: 'Catalog fan-out' },
  { at: 2.4, until: 3.7, caption: 'Compatibility scores' },
  { at: 3.7, until: 5.0, caption: 'Weak matches fade' },
  { at: 5.0, until: 7.2, caption: 'Winners + routine' },
]

function captionFor(t: number) {
  for (const b of BEATS) {
    if (t >= b.at && t < b.until) return b.caption
  }
  return BEATS[BEATS.length - 1].caption
}

/**
 * Staged discovery story: query → fan-out → scores → weak fade → winners pulse.
 * ~7s loop with beat captions. Prefers-reduced-motion → final winning state.
 */
export function ShelfMesh() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduced = usePrefersReducedMotion()
  const [caption, setCaption] = useState(
    reduced ? 'Winners + routine' : BEATS[0].caption,
  )
  const captionRef = useRef(caption)

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

    const shelfRows = 3
    const shelfCols = 5
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

      hub = { x: w * 0.28, y: h * 0.48, r: Math.max(8, Math.min(11, w * 0.018)) }
      queryStart = { x: w * 0.06, y: h * 0.48 }

      const shelfLeft = w * 0.42
      const shelfRight = w * 0.9
      const shelfTop = h * 0.22
      const shelfBottom = h * 0.76
      const cellW = (shelfRight - shelfLeft) / (shelfCols - 1)
      const cellH = (shelfBottom - shelfTop) / (shelfRows - 1)

      const winnerCells = new Set([1, 7, 11])
      const weakCells = new Set([3, 5, 9, 13])

      skus = []
      winners = []
      for (let row = 0; row < shelfRows; row++) {
        for (let col = 0; col < shelfCols; col++) {
          const i = row * shelfCols + col
          const role: SkuRole = winnerCells.has(i)
            ? 'winner'
            : weakCells.has(i)
              ? 'weak'
              : 'neutral'
          const score =
            role === 'winner'
              ? 0.88 + (i % 3) * 0.04
              : role === 'weak'
                ? 0.18 + (i % 3) * 0.06
                : 0.42 + (i % 4) * 0.05
          skus.push({
            x: shelfLeft + col * cellW,
            y: shelfTop + row * cellH,
            r: role === 'winner' ? 5.5 : 4.2,
            role,
            score,
            phase: i * 0.4,
          })
          if (role === 'winner') winners.push(skus.length - 1)
        }
      }
    }

    const easeInOut = (t: number) =>
      t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
    const clamp01 = (t: number) => Math.max(0, Math.min(1, t))
    const seg = (t: number, a: number, b: number) =>
      clamp01((t - a) / Math.max(0.001, b - a))

    const updateCaption = (t: number) => {
      const next = captionFor(t)
      if (next !== captionRef.current) {
        captionRef.current = next
        setCaption(next)
      }
    }

    const drawShelfFrame = () => {
      const left = w * 0.38
      const right = w * 0.94
      const top = h * 0.14
      const bottom = h * 0.84

      ctx.save()
      ctx.strokeStyle = 'rgba(122, 148, 196, 0.35)'
      ctx.lineWidth = 1.25
      roundRect(ctx, left, top, right - left, bottom - top, 6)
      ctx.stroke()

      for (let i = 1; i < shelfRows; i++) {
        const y = top + ((bottom - top) * i) / shelfRows
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
        { label: 'HUB', fill: 'rgba(168, 232, 156, 0.95)', stroke: C.mintBright },
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
      ctx.fillStyle = 'rgba(255,255,255,0.65)'
      ctx.textAlign = 'center'
      ctx.fillText('HUB', hub.x, hub.y + r + 14)
      ctx.textAlign = 'left'
    }

    const drawQuery = (t: number) => {
      const p = easeInOut(seg(t, 0.05, 1.0))
      const qx = queryStart.x + (hub.x - queryStart.x) * Math.min(1, p)
      const qy = queryStart.y + (hub.y - queryStart.y) * Math.min(1, p)
      const arrived = p >= 0.98

      if (!arrived) {
        ctx.beginPath()
        ctx.moveTo(queryStart.x, queryStart.y)
        ctx.lineTo(qx, qy)
        ctx.strokeStyle = `rgba(255, 200, 87, ${0.25 + p * 0.35})`
        ctx.lineWidth = 2
        ctx.stroke()

        ctx.beginPath()
        ctx.arc(qx, qy, 5, 0, Math.PI * 2)
        ctx.fillStyle = C.amber
        ctx.fill()
        ctx.beginPath()
        ctx.arc(qx, qy, 10, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(255, 200, 87, 0.2)'
        ctx.fill()

        if (p < 0.7) {
          ctx.font = '600 9px "IBM Plex Mono", monospace'
          ctx.fillStyle = C.amber
          ctx.fillText('query', qx + 10, qy - 8)
        }
      } else if (t < 1.4) {
        // brief amber flash absorbed into hub
        const fade = 1 - seg(t, 1.0, 1.4)
        ctx.beginPath()
        ctx.arc(hub.x, hub.y, hub.r * (1.4 + fade), 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(255, 200, 87, ${0.5 * fade})`
        ctx.lineWidth = 2
        ctx.stroke()
      }
      return arrived
    }

    const drawFanOut = (t: number) => {
      const p = easeInOut(seg(t, 1.15, 2.35))
      if (p <= 0) return

      for (let i = 0; i < skus.length; i++) {
        const sku = skus[i]
        const stagger = (i / skus.length) * 0.35
        const lp = clamp01((p - stagger) / Math.max(0.2, 1 - stagger * 0.5))
        if (lp <= 0) continue

        const ex = hub.x + (sku.x - hub.x) * lp
        const ey = hub.y + (sku.y - hub.y) * lp

        ctx.beginPath()
        ctx.moveTo(hub.x, hub.y)
        ctx.lineTo(ex, ey)
        ctx.strokeStyle = `rgba(255, 200, 87, ${0.15 + lp * 0.35})`
        ctx.lineWidth = 1.25
        ctx.stroke()

        if (lp < 1) {
          drawDiamond(ctx, ex, ey, 3.2)
          ctx.fillStyle = 'rgba(255, 200, 87, 0.95)'
          ctx.fill()
        }
      }
    }

    const drawScores = (t: number) => {
      const p = easeInOut(seg(t, 2.4, 3.55))
      if (p <= 0) return p

      for (let i = 0; i < skus.length; i++) {
        const sku = skus[i]
        const stagger = (i % 5) * 0.08
        const sp = clamp01((p - stagger) / 0.7)
        if (sp <= 0) continue

        const isStrong = sku.role === 'winner'
        ctx.beginPath()
        ctx.moveTo(hub.x, hub.y)
        ctx.lineTo(sku.x, sku.y)
        ctx.strokeStyle = isStrong
          ? `rgba(168, 232, 156, ${0.12 + sp * 0.35})`
          : `rgba(255, 200, 87, ${0.08 + sp * 0.2})`
        ctx.lineWidth = isStrong ? 1.5 : 1
        ctx.stroke()

        const ringR = sku.r + 6
        ctx.beginPath()
        ctx.arc(
          sku.x,
          sku.y,
          ringR,
          -Math.PI / 2,
          -Math.PI / 2 + Math.PI * 2 * sku.score * sp,
        )
        ctx.strokeStyle =
          sku.role === 'winner'
            ? C.mintBright
            : sku.role === 'weak'
              ? C.coral
              : C.amber
        ctx.lineWidth = 2
        ctx.stroke()

        if (sp > 0.6 && (sku.role === 'winner' || i % 4 === 0)) {
          ctx.font = '600 8px "IBM Plex Mono", monospace'
          ctx.fillStyle =
            sku.role === 'winner' ? C.mintBright : 'rgba(255,200,87,0.85)'
          ctx.textAlign = 'center'
          ctx.fillText(`${Math.round(sku.score * 100)}`, sku.x, sku.y - ringR - 4)
          ctx.textAlign = 'left'
        }
      }
      return p
    }

    const drawWeakFade = (t: number) => easeInOut(seg(t, 3.7, 4.9))

    const drawWinners = (t: number, pulseT: number) => {
      const p = t >= 5.0 ? easeInOut(seg(t, 5.0, 6.2)) : 0
      if (p <= 0) return p

      if (winners.length >= 2) {
        const pairs: [number, number, string][] = [
          [winners[0], winners[1], 'similar'],
          [winners[1], winners[2] ?? winners[0], 'routine'],
        ]
        for (const [a, b, label] of pairs) {
          if (a === b || a == null || b == null) continue
          const na = skus[a]
          const nb = skus[b]
          const pulse = 0.55 + Math.sin(pulseT * 3.2) * 0.35
          ctx.beginPath()
          ctx.moveTo(na.x, na.y)
          ctx.lineTo(nb.x, nb.y)
          ctx.strokeStyle = `rgba(168, 232, 156, ${p * pulse * 0.75})`
          ctx.lineWidth = 2
          ctx.setLineDash([4, 4])
          ctx.stroke()
          ctx.setLineDash([])

          if (p > 0.5) {
            const mx = (na.x + nb.x) / 2
            const my = (na.y + nb.y) / 2
            ctx.font = '600 8px "IBM Plex Mono", monospace'
            const lw = ctx.measureText(label).width
            roundRect(ctx, mx - lw / 2 - 5, my - 8, lw + 10, 14, 3)
            ctx.fillStyle = 'rgba(10, 17, 36, 0.88)'
            ctx.fill()
            ctx.strokeStyle = `rgba(168, 232, 156, ${0.5 * p})`
            ctx.lineWidth = 1
            ctx.stroke()
            ctx.fillStyle = C.mintBright
            ctx.textAlign = 'center'
            ctx.fillText(label, mx, my + 3)
            ctx.textAlign = 'left'
          }
        }
      }

      for (const wi of winners) {
        const sku = skus[wi]
        const pulse = 0.6 + Math.sin(pulseT * 2.8 + sku.phase) * 0.4
        ctx.beginPath()
        ctx.moveTo(hub.x, hub.y)
        ctx.lineTo(sku.x, sku.y)
        ctx.strokeStyle = `rgba(168, 232, 156, ${p * pulse * 0.7})`
        ctx.lineWidth = 2
        ctx.stroke()
      }

      return p
    }

    const drawContextRing = (t: number) => {
      const p = easeInOut(seg(t, 5.8, 6.8))
      if (p <= 0) return
      ctx.beginPath()
      ctx.arc(hub.x, hub.y, hub.r * 4.2, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(122, 148, 196, ${0.15 + p * 0.35})`
      ctx.lineWidth = 1.5
      ctx.setLineDash([3, 5])
      ctx.stroke()
      ctx.setLineDash([])
      if (p > 0.4) {
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
        let r = sku.r

        if (t < 1.15) {
          fill = 'rgba(122, 148, 196, 0.35)'
          stroke = 'rgba(122, 148, 196, 0.5)'
        } else if (t < 2.4) {
          const wake = clamp01((seg(t, 1.15, 2.35) * skus.length - i) / 3)
          const alpha = 0.3 + wake * 0.45
          fill = `rgba(147, 183, 143, ${alpha})`
          stroke = C.mint
        } else if (scoreP > 0 && weakP < 0.1) {
          if (sku.role === 'winner') {
            fill = `rgba(168, 232, 156, ${0.55 + scoreP * 0.4})`
            stroke = C.mintBright
            r = sku.r * (1 + scoreP * 0.15)
          } else if (sku.role === 'weak') {
            fill = `rgba(255, 200, 87, ${0.4 + scoreP * 0.25})`
            stroke = C.amber
          } else {
            fill = `rgba(147, 183, 143, ${0.4 + scoreP * 0.2})`
            stroke = C.mint
          }
        } else {
          if (sku.role === 'weak') {
            const dim = 1 - weakP * 0.75
            fill = `rgba(224, 122, 95, ${0.25 + dim * 0.35})`
            stroke = `rgba(224, 122, 95, ${0.35 + dim * 0.4})`
            if (weakP > 0.2) {
              ctx.beginPath()
              ctx.moveTo(hub.x, hub.y)
              ctx.lineTo(sku.x, sku.y)
              ctx.strokeStyle = `rgba(224, 122, 95, ${0.08 + (1 - weakP) * 0.15})`
              ctx.lineWidth = 1
              ctx.stroke()
            }
          } else if (sku.role === 'winner') {
            const pulse =
              1 + Math.sin(pulseT * 3 + sku.phase) * 0.12 * Math.max(winP, 0.3)
            r = sku.r * pulse * (1 + winP * 0.2)
            fill = `rgba(168, 232, 156, ${0.7 + winP * 0.25})`
            stroke = C.mintBright
            ctx.beginPath()
            ctx.arc(sku.x, sku.y, r * 2.2, 0, Math.PI * 2)
            ctx.fillStyle = `rgba(168, 232, 156, ${0.08 + winP * 0.14})`
            ctx.fill()
          } else {
            fill = `rgba(122, 148, 196, ${0.2 + (1 - weakP) * 0.2})`
            stroke = 'rgba(122, 148, 196, 0.45)'
          }
        }

        ctx.beginPath()
        ctx.arc(sku.x, sku.y, r, 0, Math.PI * 2)
        ctx.fillStyle = fill
        ctx.fill()
        ctx.strokeStyle = stroke
        ctx.lineWidth = sku.role === 'winner' && winP > 0.3 ? 1.75 : 1.15
        ctx.stroke()
      }
    }

    const drawBeatDots = (t: number) => {
      ctx.save()
      const dotY = h - 14
      const total = BEATS.length
      const startX = w / 2 - ((total - 1) * 12) / 2
      for (let i = 0; i < total; i++) {
        const active = t >= BEATS[i].at && t < BEATS[i].until
        ctx.beginPath()
        ctx.arc(startX + i * 12, dotY, active ? 3.2 : 2.2, 0, Math.PI * 2)
        ctx.fillStyle = active ? C.mintBright : 'rgba(122, 148, 196, 0.45)'
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
      const scoreP = t >= 2.4 && t < 3.75 ? drawScores(t) : t >= 3.75 ? 1 : 0
      if (t >= 2.4 && t < 3.75) {
        /* scores drawn above */
      } else if (t >= 3.75 && t < 5.0) {
        // hold faint score spokes briefly into weak-fade
        drawScores(3.5)
      }

      const weakP = drawWeakFade(t)
      const winP = drawWinners(t, elapsed)

      if (t >= 1.15 && t < 2.45) drawFanOut(t)

      drawHub(arrived ? 0.7 + Math.sin(elapsed * 2) * 0.15 : 0.25, arrived)
      drawSkus(t, scoreP, weakP, winP, elapsed)

      if (t >= 5.8) drawContextRing(t)

      drawLegend()
      drawBeatDots(t)
    }

    const draw = (now: number) => {
      const elapsed = (now - start) / 1000
      const t = elapsed % LOOP
      updateCaption(t)
      paintScene(t, elapsed)
      raf = requestAnimationFrame(draw)
    }

    layout()
    if (reduced) {
      captionRef.current = 'Winners + routine'
      setCaption('Winners + routine')
      paintScene(6.5, 6.5)
    } else {
      raf = requestAnimationFrame(draw)
    }

    const onResize = () => {
      layout()
      if (reduced) paintScene(6.5, 6.5)
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
      <div className="shelf-mesh__caption" key={caption}>{caption}</div>
    </div>
  )
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
