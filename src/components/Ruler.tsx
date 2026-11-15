import { useEffect, useRef, useState } from 'react'

// A measuring edge along the top and right of the viewport. The ticks nearest the cursor lengthen and brighten
// like a caliper, and the right edge scrolls with the page so it reads as a ruler laid against the content.
export default function Ruler() {
  const ref = useRef<HTMLCanvasElement>(null)
  const [wide, setWide] = useState(() => typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches)

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const on = () => setWide(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])

  useEffect(() => {
    const canvas = ref.current
    if (!canvas || !wide) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let W = 0, H = 0, dpr = 1
    const cur = { x: -999, y: -999, sx: -999, sy: -999 }
    let raf = 0
    let running = false

    const size = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      W = window.innerWidth
      H = window.innerHeight
      canvas.width = W * dpr
      canvas.height = H * dpr
      canvas.style.width = W + 'px'
      canvas.style.height = H + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const draw = () => {
      ctx.clearRect(0, 0, W, H)
      const scroll = window.scrollY
      const step = 8
      // right edge: vertical ruler tied to page position
      const startY = -((scroll % (step * 8)) + step * 8)
      for (let y = startY; y < H + step; y += step) {
        const idx = Math.round((y + scroll) / step)
        const major = idx % 8 === 0
        const g = reduced ? 0 : Math.exp(-Math.pow(y - cur.sy, 2) / (2 * 70 * 70))
        const len = (major ? 11 : 5) + g * 12
        const a = (major ? 0.22 : 0.11) + g * 0.6
        const near = !reduced && Math.abs(y - cur.sy) < step / 2
        ctx.strokeStyle = near ? 'rgba(74,123,255,0.95)' : `rgba(185,191,201,${a})`
        ctx.lineWidth = near ? 1.5 : 1
        ctx.beginPath()
        ctx.moveTo(W - 0.5, y + 0.5)
        ctx.lineTo(W - 0.5 - len - (near ? 8 : 0), y + 0.5)
        ctx.stroke()
      }
      // top edge: horizontal ruler in viewport coordinates
      for (let x = 64; x < W; x += step) {
        const major = Math.round(x / step) % 8 === 0
        const g = reduced ? 0 : Math.exp(-Math.pow(x - cur.sx, 2) / (2 * 70 * 70))
        const len = (major ? 11 : 5) + g * 12
        const a = (major ? 0.22 : 0.11) + g * 0.6
        const near = !reduced && Math.abs(x - cur.sx) < step / 2
        ctx.strokeStyle = near ? 'rgba(74,123,255,0.95)' : `rgba(185,191,201,${a})`
        ctx.lineWidth = near ? 1.5 : 1
        ctx.beginPath()
        ctx.moveTo(x + 0.5, 0.5)
        ctx.lineTo(x + 0.5, 0.5 + len + (near ? 8 : 0))
        ctx.stroke()
      }
    }

    const tick = () => {
      cur.sx += (cur.x - cur.sx) * 0.22
      cur.sy += (cur.y - cur.sy) * 0.22
      draw()
      if (Math.abs(cur.x - cur.sx) > 0.4 || Math.abs(cur.y - cur.sy) > 0.4) raf = requestAnimationFrame(tick)
      else running = false
    }
    const kick = () => {
      if (running) return
      running = true
      raf = requestAnimationFrame(tick)
    }
    const onMove = (e: PointerEvent) => {
      if (cur.sx < -900) { cur.sx = e.clientX; cur.sy = e.clientY }
      cur.x = e.clientX
      cur.y = e.clientY
      kick()
    }
    const onScroll = () => kick()
    const onResize = () => { size(); draw() }

    size()
    draw()
    if (!reduced) window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('scroll', reduced ? draw : onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('scroll', reduced ? draw : onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [wide])

  if (!wide) return null
  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none fixed left-0 top-0 z-30" />
}
