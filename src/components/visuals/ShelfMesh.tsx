import { useEffect, useRef } from 'react'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'

type Node = {
  x: number
  y: number
  r: number
  kind: 'sku' | 'hub' | 'signal'
  phase: number
  pulse: number
}

/**
 * Groq-energy intelligent infrastructure: mesh grid + beauty-shelf silhouette.
 * Canvas — live nodes, signal hops, no stock screenshot.
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

      // Central hub
      nodes.push({
        x: w * 0.52,
        y: h * 0.48,
        r: 7,
        kind: 'hub',
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
          nodes.push({
            x: shelfLeft + col * cellW + jitterX,
            y: shelfTop + row * cellH + jitterY,
            r: 3.2 + ((row + col) % 3) * 0.6,
            kind: 'sku',
            phase: (row * shelfCols + col) * 0.35,
            pulse: 0.6 + ((row + col) % 4) * 0.15,
          })
        }
      }

      // Orbiting signal nodes
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2
        nodes.push({
          x: w * 0.52 + Math.cos(a) * w * 0.28,
          y: h * 0.48 + Math.sin(a) * h * 0.22,
          r: 2.5,
          kind: 'signal',
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
      ctx.strokeStyle = 'rgba(147, 183, 143, 0.22)'
      ctx.lineWidth = 1.25

      // Outer frame with perspective
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

      // Shelf planks
      for (let i = 0; i < 4; i++) {
        const y = top + ((bottom - top) * (i + 1)) / 5
        ctx.beginPath()
        ctx.moveTo(left + 6, y)
        ctx.lineTo(right - 6, y)
        ctx.strokeStyle = 'rgba(147, 183, 143, 0.14)'
        ctx.stroke()
        // bottle silhouettes on plank
        for (let b = 0; b < 5; b++) {
          const bx = left + 28 + b * ((right - left - 56) / 4)
          const bh = 14 + ((i + b) % 3) * 6
          ctx.fillStyle = 'rgba(147, 183, 143, 0.08)'
          roundRect(ctx, bx - 5, y - bh - 2, 10, bh, 2)
          ctx.fill()
          ctx.fillStyle = 'rgba(147, 183, 143, 0.18)'
          roundRect(ctx, bx - 3, y - bh - 6, 6, 5, 1)
          ctx.fill()
        }
      }
      ctx.restore()
    }

    const drawGrid = () => {
      ctx.save()
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)'
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
      ctx.restore()
    }

    const draw = () => {
      t += reduced ? 0 : 0.016
      ctx.clearRect(0, 0, w, h)

      // Ambient radial wash
      const g = ctx.createRadialGradient(w * 0.55, h * 0.4, 20, w * 0.55, h * 0.45, w * 0.55)
      g.addColorStop(0, 'rgba(147, 183, 143, 0.12)')
      g.addColorStop(0.45, 'rgba(26, 41, 71, 0.35)')
      g.addColorStop(1, 'rgba(15, 27, 57, 0)')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, w, h)

      drawGrid()
      drawShelfSilhouette()

      // Links with traveling packets
      for (let i = 0; i < links.length; i++) {
        const [a, b] = links[i]
        const na = nodes[a]
        const nb = nodes[b]
        if (!na || !nb) continue
        const active = (Math.sin(t * 1.4 + i * 0.37) + 1) * 0.5
        ctx.beginPath()
        ctx.moveTo(na.x, na.y)
        ctx.lineTo(nb.x, nb.y)
        ctx.strokeStyle =
          na.kind === 'hub' || nb.kind === 'hub'
            ? `rgba(147, 183, 143, ${0.08 + active * 0.28})`
            : `rgba(255, 255, 255, ${0.03 + active * 0.06})`
        ctx.lineWidth = na.kind === 'hub' || nb.kind === 'hub' ? 1.4 : 1
        ctx.stroke()

        if (!reduced && (i + Math.floor(t * 2)) % 7 === 0) {
          const p = (t * 0.55 + i * 0.13) % 1
          const px = na.x + (nb.x - na.x) * p
          const py = na.y + (nb.y - na.y) * p
          ctx.beginPath()
          ctx.arc(px, py, 2.2, 0, Math.PI * 2)
          ctx.fillStyle = 'rgba(147, 183, 143, 0.85)'
          ctx.fill()
        }
      }

      // Nodes
      for (const n of nodes) {
        const breathe = 1 + Math.sin(t * n.pulse + n.phase) * 0.18
        const r = n.r * breathe

        if (n.kind === 'hub') {
          ctx.beginPath()
          ctx.arc(n.x, n.y, r * 3.2, 0, Math.PI * 2)
          ctx.fillStyle = 'rgba(147, 183, 143, 0.08)'
          ctx.fill()
          ctx.beginPath()
          ctx.arc(n.x, n.y, r * 1.8, 0, Math.PI * 2)
          ctx.strokeStyle = 'rgba(147, 183, 143, 0.45)'
          ctx.lineWidth = 1.5
          ctx.stroke()
        }

        ctx.beginPath()
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2)
        if (n.kind === 'hub') {
          ctx.fillStyle = '#93B78F'
        } else if (n.kind === 'signal') {
          const sx = n.x + Math.cos(t * 0.7 + n.phase) * 18
          const sy = n.y + Math.sin(t * 0.55 + n.phase) * 12
          ctx.beginPath()
          ctx.arc(sx, sy, r, 0, Math.PI * 2)
          ctx.fillStyle = 'rgba(255, 200, 87, 0.7)'
          ctx.fill()
          continue
        } else {
          ctx.fillStyle = `rgba(147, 183, 143, ${0.35 + Math.sin(t + n.phase) * 0.2})`
        }
        ctx.fill()
      }

      // Corner labels — infrastructure feel
      ctx.fillStyle = 'rgba(147, 183, 143, 0.55)'
      ctx.font = '500 10px "IBM Plex Mono", monospace'
      ctx.fillText('SHELF GRAPH · LIVE', 16, 22)
      ctx.fillStyle = 'rgba(255,255,255,0.28)'
      ctx.fillText(`${nodes.filter((n) => n.kind === 'sku').length} SKUs  ·  intent mesh`, 16, h - 14)

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
