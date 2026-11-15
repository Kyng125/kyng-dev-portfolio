import { useEffect, useRef, useState } from 'react'
import { statusStrip, type Evidence } from '../data/projects'

function Mark({ s }: { s: Evidence }) {
  if (s === 'live') return <span className="live-dot h-2.5 w-2.5 rounded-full bg-blue" aria-hidden="true" />
  if (s === 'verified') return <span className="h-2.5 w-2.5 rotate-45 bg-gold" aria-hidden="true" />
  return <span className="h-2.5 w-2.5 rounded-full border border-silver" aria-hidden="true" />
}
// Counts the first number in a note up from zero once the strip is on screen, then stamps a gold diamond.
function Note({ text }: { text: string }) {
  const m = text.match(/^(.*?)(\d+)(.*)$/)
  const target = m ? parseInt(m[2], 10) : 0
  const ref = useRef<HTMLParagraphElement>(null)
  const [n, setN] = useState(target)
  const [stamped, setStamped] = useState(false)
  useEffect(() => {
    if (!m || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    setN(0)
    const el = ref.current
    if (!el) return
    let raf = 0
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      io.disconnect()
      const t0 = performance.now()
      const run = (t: number) => {
        const k = Math.min((t - t0) / 1100, 1)
        setN(Math.round(target * (1 - Math.pow(1 - k, 3))))
        if (k < 1) raf = requestAnimationFrame(run)
        else setStamped(true)
      }
      raf = requestAnimationFrame(run)
    })
    io.observe(el)
    return () => { io.disconnect(); cancelAnimationFrame(raf) }
  }, [text]) // eslint-disable-line react-hooks/exhaustive-deps
  if (!m) return <p className="text-xs text-silver/80 sm:text-sm">{text}</p>
  return (
    <p ref={ref} className="text-xs text-silver/80 sm:text-sm">
      {m[1]}<span className="tabular-nums text-bone">{n}</span>{m[3]}
      <span aria-hidden="true" className={`ml-1.5 inline-block h-1.5 w-1.5 rotate-45 bg-gold align-middle transition-all duration-500 ${stamped ? 'scale-100 opacity-100' : 'scale-[2.2] opacity-0'}`} />
    </p>
  )
}
const word: Record<Evidence, string> = { live: 'Live', verified: 'Tested', written: 'Written' }

export default function StatusStrip() {
  return (
    <section aria-label="Current status of lead projects" className="relative z-10 hair-t bg-black/80 backdrop-blur-sm">
      <ul className="mx-auto grid max-w-[1240px] grid-cols-2 gap-x-4 px-6 sm:grid-cols-2 lg:grid-cols-4 lg:px-10">
        {statusStrip.map((s, i) => (
          <li key={s.label} className={`flex items-start gap-3 py-3 sm:py-4 sm:pr-6 ${i > 0 ? 'lg:hair-l lg:pl-6' : ''}`}>
            <span className="mt-2 flex"><Mark s={s.state} /></span>
            <div>
              <p className="font-display text-lg font-semibold leading-tight">
                {s.label} <span className="text-sm font-normal text-steel">{word[s.state]}</span>
              </p>
              <Note text={s.note} />
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
