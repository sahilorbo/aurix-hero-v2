import { useEffect, useRef } from 'react'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'

type Node = {
  x: number
  y: number
  r: number
  kind: 'sku' | 'hub' | 'signal'
  /** sku subtype for color/shape: stocked | low | alert */
  state: 'ok' | 'low' | 'alert'
  phase: number
  pulse: number
}

/** Aurix brief palette — canvas-safe hex/rgba */
const C = {
  bluePage: '#0F1B39',
  blueDeep: '#0A1124',
  blueSoft: '#1A2947',
  mint: '#93B78F',
  mintHover: '#7D9F73',
  mintBright: '#A8E89C', // oklch(0.84 0.15 150)
  coral: '#E07A5F', // oklch(0.70 0.15 25)
  coralSoft: '#EFA890',
  amber: '#FFC857',
  white: '#FFFFFF',
}

/**
 * Groq-energy intelligent infrastructure: mesh grid + beauty-shelf silhouette.
 * Canvas — live nodes, signal hops, color-coded by type/state.
 */
export function ShelfMesh() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    let t = 0
    let nodes: Node[] = []
    let links: [number, number][] = []
    let w = 0
    let h = 0
    let dpr = 1

    const shelfRows = 4
    const shelfCols = 6

    const layout = () => {
      const rect = canvas.getBoundingClientRect()
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = rect.width
      h = rect.height
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      nodes = []
      links = []

      // Central hub — largest, mint-bright core
      nodes.push({
        x: w * 0.52,
        y: h * 0.48,
        r: 8,
        kind: 'hub',
        state: 'ok',
        phase: 0,
        pulse: 1.2,
      })

      // Shelf silhouette grid of SKU nodes
      const shelfLeft = w * 0.18
      const shelfRight = w * 0.88
      const shelfTop = h * 0.18
      const shelfBottom = h * 0.78
      const cellW = (shelfRight - shelfLeft) / (shelfCols - 1)
      const cellH = (shelfBottom - shelfTop) / (shelfRows - 1)

      for (let row = 0; row < shelfRows; row++) {
        for (let col = 0; col < shelfCols; col++) {
          const jitterX = ((row * 7 + col * 13) % 5) - 2
          const jitterY = ((row * 11 + col * 3) % 5) - 2
          const i = row * shelfCols + col
          // Mix of stocked / low / alert for color coding
          const state: Node['state'] =
            i % 11 === 0 ? 'alert' : i % 5 === 0 ? 'low' : 'ok'
          nodes.push({
            x: shelfLeft + col * cellW + jitterX,
            y: shelfTop + row * cellH + jitterY,
            r: state === 'alert' ? 4.4 : state === 'low' ? 3.8 : 3.2 + ((row + col) % 3) * 0.5,
            kind: 'sku',
            state,
            phase: i * 0.35,
            pulse: 0.6 + ((row + col) % 4) * 0.15,
          })
        }
      }

      // Orbiting signal nodes — amber
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2
        nodes.push({
          x: w * 0.52 + Math.cos(a) * w * 0.28,
          y: h * 0.48 + Math.sin(a) * h * 0.22,
          r: 3,
          kind: 'signal',
          state: 'ok',
          phase: i * 1.1,
          pulse: 0.9,
        })
      }

      // Links: hub → every sku + adjacent skus
      for (let i = 1; i < nodes.length; i++) {
        if (nodes[i].kind === 'sku' && (i + t) % 3 === 0) {
          links.push([0, i])
        }
      }
      for (let row = 0; row < shelfRows; row++) {
        for (let col = 0; col < shelfCols; col++) {
          const idx = 1 + row * shelfCols + col
          if (col < shelfCols - 1) links.push([idx, idx + 1])
          if (row < shelfRows - 1) links.push([idx, idx + shelfCols])
        }
      }
    }

    const drawShelfSilhouette = () => {
      const left = w * 0.12
      const right = w * 0.92
      const top = h * 0.12
      const bottom = h * 0.86
      const depth = Math.min(28, w * 0.04)

      ctx.save()
      // Cool blue frame — separable from mint mesh
      ctx.strokeStyle = 'rgba(122, 148, 196, 0.42)'
      ctx.lineWidth = 1.5

      ctx.beginPath()
      ctx.moveTo(left, top)
      ctx.lineTo(right, top)
      ctx.lineTo(right + depth * 0.4, top + depth)
      ctx.lineTo(left + depth * 0.4, top + depth)
      ctx.closePath()
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(left, top)
      ctx.lineTo(left, bottom)
      ctx.lineTo(left + depth * 0.4, bottom - depth * 0.3)
      ctx.lineTo(left + depth * 0.4, top + depth)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(right, top)
      ctx.lineTo(right, bottom)
      ctx.lineTo(right + depth * 0.4, bottom - depth * 0.3)
      ctx.lineTo(right + depth * 0.4, top + depth)
      ctx.stroke()

      // Shelf planks — muted blue-white, not mint
      for (let i = 0; i < 4; i++) {
        const y = top + ((bottom - top) * (i + 1)) / 5
        ctx.beginPath()
        ctx.moveTo(left + 6, y)
        ctx.lineTo(right - 6, y)
        ctx.strokeStyle = 'rgba(26, 41, 71, 0.95)'
        ctx.lineWidth = 2
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(left + 6, y)
        ctx.lineTo(right - 6, y)
        ctx.strokeStyle = 'rgba(180, 200, 230, 0.22)'
        ctx.lineWidth = 1
        ctx.stroke()

        // bottle silhouettes — cool slate, distinct from SKU nodes
        for (let b = 0; b < 5; b++) {
          const bx = left + 28 + b * ((right - left - 56) / 4)
          const bh = 14 + ((i + b) % 3) * 6
          ctx.fillStyle = 'rgba(26, 41, 71, 0.65)'
          roundRect(ctx, bx - 5, y - bh - 2, 10, bh, 2)
          ctx.fill()
          ctx.strokeStyle = 'rgba(180, 200, 230, 0.28)'
          ctx.lineWidth = 1
          ctx.stroke()
          ctx.fillStyle = 'rgba(180, 200, 230, 0.22)'
          roundRect(ctx, bx - 3, y - bh - 6, 6, 5, 1)
          ctx.fill()
        }
      }
      ctx.restore()
    }

    const drawGrid = () => {
      ctx.save()
      // Deep navy grid — quieter than shelf + mesh
      ctx.strokeStyle = 'rgba(26, 41, 71, 0.85)'
      ctx.lineWidth = 1
      const step = 36
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
      // hairline white overlay for slight lift
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)'
      for (let x = 0; x < w; x += step) {
        ctx.beginPath()
        ctx.moveTo(x + 0.5, 0)
        ctx.lineTo(x + 0.5, h)
        ctx.stroke()
      }
      ctx.restore()
    }

    const skuFill = (state: Node['state'], alpha: number) => {
      if (state === 'alert') return `rgba(224, 122, 95, ${alpha})`
      if (state === 'low') return `rgba(255, 200, 87, ${alpha})`
      return `rgba(147, 183, 143, ${alpha})`
    }

    const skuStroke = (state: Node['state']) => {
      if (state === 'alert') return C.coralSoft
      if (state === 'low') return C.amber
      return C.mintBright
    }

    const drawDiamond = (x: number, y: number, r: number) => {
      ctx.beginPath()
      ctx.moveTo(x, y - r)
      ctx.lineTo(x + r, y)
      ctx.lineTo(x, y + r)
      ctx.lineTo(x - r, y)
      ctx.closePath()
    }

    const draw = () => {
      t += reduced ? 0 : 0.016
      ctx.clearRect(0, 0, w, h)

      // Ambient radial wash — blue + mint
      const g = ctx.createRadialGradient(w * 0.55, h * 0.4, 20, w * 0.55, h * 0.45, w * 0.55)
      g.addColorStop(0, 'rgba(168, 232, 156, 0.1)')
      g.addColorStop(0.35, 'rgba(26, 41, 71, 0.45)')
      g.addColorStop(1, 'rgba(15, 27, 57, 0)')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, w, h)

      drawGrid()
      drawShelfSilhouette()

      // Links with traveling packets — idle vs active vs hub hops
      for (let i = 0; i < links.length; i++) {
        const [a, b] = links[i]
        const na = nodes[a]
        const nb = nodes[b]
        if (!na || !nb) continue
        const active = (Math.sin(t * 1.4 + i * 0.37) + 1) * 0.5
        const isHub = na.kind === 'hub' || nb.kind === 'hub'
        const touchesAlert =
          na.state === 'alert' || nb.state === 'alert' || na.state === 'low' || nb.state === 'low'

        ctx.beginPath()
        ctx.moveTo(na.x, na.y)
        ctx.lineTo(nb.x, nb.y)

        if (isHub) {
          // Hub spokes: mint when hot, coral-tinted when linked to alert SKU
          if (touchesAlert && active > 0.55) {
            ctx.strokeStyle = `rgba(224, 122, 95, ${0.18 + active * 0.45})`
          } else {
            ctx.strokeStyle = `rgba(168, 232, 156, ${0.12 + active * 0.42})`
          }
          ctx.lineWidth = 1.6
        } else if (active > 0.72) {
          // Active mesh hop — bright mint
          ctx.strokeStyle = `rgba(147, 183, 143, ${0.18 + active * 0.28})`
          ctx.lineWidth = 1.25
        } else {
          // Idle mesh — cool blue-white, clearly different from mint hops
          ctx.strokeStyle = `rgba(122, 148, 196, ${0.08 + active * 0.1})`
          ctx.lineWidth = 1
        }
        ctx.stroke()

        // Traveling packet hops
        if (!reduced && (i + Math.floor(t * 2)) % 7 === 0) {
          const p = (t * 0.55 + i * 0.13) % 1
          const px = na.x + (nb.x - na.x) * p
          const py = na.y + (nb.y - na.y) * p
          ctx.beginPath()
          ctx.arc(px, py, isHub ? 2.6 : 2.1, 0, Math.PI * 2)
          if (isHub && touchesAlert) {
            ctx.fillStyle = 'rgba(224, 122, 95, 0.95)'
          } else if (isHub) {
            ctx.fillStyle = 'rgba(168, 232, 156, 0.95)'
          } else {
            ctx.fillStyle = 'rgba(255, 200, 87, 0.9)'
          }
          ctx.fill()
          // soft glow
          ctx.beginPath()
          ctx.arc(px, py, isHub ? 5 : 4, 0, Math.PI * 2)
          ctx.fillStyle = isHub
            ? touchesAlert
              ? 'rgba(224, 122, 95, 0.18)'
              : 'rgba(168, 232, 156, 0.18)'
            : 'rgba(255, 200, 87, 0.15)'
          ctx.fill()
        }
      }

      // Nodes
      for (const n of nodes) {
        const breathe = 1 + Math.sin(t * n.pulse + n.phase) * 0.18
        const r = n.r * breathe

        if (n.kind === 'hub') {
          // Outer glow rings — mint + soft coral accent
          ctx.beginPath()
          ctx.arc(n.x, n.y, r * 3.4, 0, Math.PI * 2)
          ctx.fillStyle = 'rgba(168, 232, 156, 0.1)'
          ctx.fill()
          ctx.beginPath()
          ctx.arc(n.x, n.y, r * 2.2, 0, Math.PI * 2)
          ctx.strokeStyle = 'rgba(168, 232, 156, 0.55)'
          ctx.lineWidth = 1.75
          ctx.stroke()
          ctx.beginPath()
          ctx.arc(n.x, n.y, r * 1.55, 0, Math.PI * 2)
          ctx.strokeStyle = 'rgba(255, 200, 87, 0.35)'
          ctx.lineWidth = 1
          ctx.stroke()
          // Core
          ctx.beginPath()
          ctx.arc(n.x, n.y, r, 0, Math.PI * 2)
          ctx.fillStyle = C.mintBright
          ctx.fill()
          ctx.strokeStyle = C.white
          ctx.lineWidth = 1.25
          ctx.stroke()
          continue
        }

        if (n.kind === 'signal') {
          const sx = n.x + Math.cos(t * 0.7 + n.phase) * 18
          const sy = n.y + Math.sin(t * 0.55 + n.phase) * 12
          // Amber diamond — distinct shape from circular SKUs
          ctx.save()
          drawDiamond(sx, sy, r * 1.35)
          ctx.fillStyle = 'rgba(255, 200, 87, 0.88)'
          ctx.fill()
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)'
          ctx.lineWidth = 1
          ctx.stroke()
          // trail glow
          ctx.beginPath()
          ctx.arc(sx, sy, r * 2.4, 0, Math.PI * 2)
          ctx.fillStyle = 'rgba(255, 200, 87, 0.12)'
          ctx.fill()
          ctx.restore()
          continue
        }

        // SKU nodes — circles with state color + bright stroke
        const alpha = 0.55 + Math.sin(t + n.phase) * 0.25
        ctx.beginPath()
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2)
        ctx.fillStyle = skuFill(n.state, Math.min(0.95, alpha))
        ctx.fill()
        ctx.strokeStyle = skuStroke(n.state)
        ctx.lineWidth = n.state === 'ok' ? 1.15 : 1.5
        ctx.stroke()

        // Alert pulse ring
        if (n.state === 'alert') {
          const ring = r * (1.6 + Math.sin(t * 2.2 + n.phase) * 0.25)
          ctx.beginPath()
          ctx.arc(n.x, n.y, ring, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(224, 122, 95, ${0.25 + Math.sin(t * 2 + n.phase) * 0.15})`
          ctx.lineWidth = 1.25
          ctx.stroke()
        }
      }

      // HUD chips — strong color coding legend
      drawHud(ctx, w, h, nodes)

      if (!reduced) raf = requestAnimationFrame(draw)
    }

    layout()
    draw()

    const onResize = () => {
      layout()
      if (reduced) draw()
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
    </div>
  )
}

function drawHud(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  nodes: Node[],
) {
  const skuCount = nodes.filter((n) => n.kind === 'sku').length
  const alerts = nodes.filter((n) => n.kind === 'sku' && n.state === 'alert').length
  const lows = nodes.filter((n) => n.kind === 'sku' && n.state === 'low').length

  ctx.save()
  ctx.font = '600 10px "IBM Plex Mono", monospace'

  // Title chip
  const title = 'SHELF GRAPH · LIVE'
  const tw = ctx.measureText(title).width
  roundRect(ctx, 12, 10, tw + 18, 22, 4)
  ctx.fillStyle = 'rgba(15, 27, 57, 0.82)'
  ctx.fill()
  ctx.strokeStyle = 'rgba(168, 232, 156, 0.55)'
  ctx.lineWidth = 1
  ctx.stroke()
  ctx.fillStyle = C.mintBright
  ctx.fillText(title, 21, 25)

  // Legend chips top-right
  const chips: { label: string; fill: string; stroke: string }[] = [
    { label: 'HUB', fill: 'rgba(168, 232, 156, 0.95)', stroke: C.mintBright },
    { label: 'SKU', fill: 'rgba(147, 183, 143, 0.9)', stroke: C.mint },
    { label: 'SIGNAL', fill: 'rgba(255, 200, 87, 0.95)', stroke: C.amber },
    { label: 'LOSS', fill: 'rgba(224, 122, 95, 0.95)', stroke: C.coral },
  ]
  let cx = w - 14
  for (let i = chips.length - 1; i >= 0; i--) {
    const chip = chips[i]
    const cw = ctx.measureText(chip.label).width + 28
    cx -= cw + 6
    roundRect(ctx, cx, 10, cw, 22, 4)
    ctx.fillStyle = 'rgba(10, 17, 36, 0.88)'
    ctx.fill()
    ctx.strokeStyle = chip.stroke
    ctx.lineWidth = 1
    ctx.stroke()
    // color dot
    ctx.beginPath()
    ctx.arc(cx + 11, 21, 4, 0, Math.PI * 2)
    ctx.fillStyle = chip.fill
    ctx.fill()
    ctx.fillStyle = 'rgba(255,255,255,0.88)'
    ctx.fillText(chip.label, cx + 20, 25)
  }

  // Bottom status bar
  const status = `${skuCount} SKUs  ·  ${lows} LOW  ·  ${alerts} ALERT  ·  intent mesh`
  const sw = ctx.measureText(status).width
  roundRect(ctx, 12, h - 30, sw + 20, 20, 4)
  ctx.fillStyle = 'rgba(10, 17, 36, 0.85)'
  ctx.fill()
  ctx.strokeStyle = 'rgba(122, 148, 196, 0.4)'
  ctx.lineWidth = 1
  ctx.stroke()

  // Multi-color status text segments
  let tx = 22
  ctx.fillStyle = 'rgba(255,255,255,0.7)'
  ctx.fillText(`${skuCount} SKUs`, tx, h - 16)
  tx += ctx.measureText(`${skuCount} SKUs`).width + 8
  ctx.fillStyle = 'rgba(122, 148, 196, 0.7)'
  ctx.fillText('·', tx, h - 16)
  tx += 12
  ctx.fillStyle = C.amber
  ctx.fillText(`${lows} LOW`, tx, h - 16)
  tx += ctx.measureText(`${lows} LOW`).width + 8
  ctx.fillStyle = 'rgba(122, 148, 196, 0.7)'
  ctx.fillText('·', tx, h - 16)
  tx += 12
  ctx.fillStyle = C.coral
  ctx.fillText(`${alerts} ALERT`, tx, h - 16)
  tx += ctx.measureText(`${alerts} ALERT`).width + 8
  ctx.fillStyle = 'rgba(122, 148, 196, 0.7)'
  ctx.fillText('·', tx, h - 16)
  tx += 12
  ctx.fillStyle = C.mint
  ctx.fillText('intent mesh', tx, h - 16)

  ctx.restore()
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
