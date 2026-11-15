import { useEffect, useState } from 'react'
import RailDiamond from './RailDiamond'

const items = [
  { id: 'top', label: 'Kyng' },
  { id: 'work', label: 'Case files' },
  { id: 'also', label: 'Also built' },
  { id: 'method', label: 'How I work' },
  { id: 'contact', label: 'Contact' },
]

export default function Rail() {
  const [active, setActive] = useState('top')
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-40% 0px -55% 0px' },
    )
    items.forEach((i) => {
      const el = document.getElementById(i.id)
      if (el) io.observe(el)
    })
    return () => io.disconnect()
  }, [])

  return (
    <>
      <RailDiamond active={active} />
      {/* wide screens: a vertical scale on the left edge, the active section is the lit tick */}
      <nav aria-label="Sections" className="fixed left-0 top-0 z-40 hidden h-screen w-16 flex-col items-center justify-center hair-l border-0 border-r border-line bg-black lg:flex">
        <ul className="flex flex-col gap-7">
          {items.map((i) => (
            <li key={i.id}>
              <a
                href={`#${i.id}`}
                aria-current={active === i.id ? 'true' : undefined}
                className="group flex flex-col items-center gap-2 text-xs text-steel transition-colors aria-[current=true]:text-bone hover:text-bone"
              >
                <span data-tick={i.id} className={`block w-px transition-all ${active === i.id ? 'h-8 bg-gold/60' : 'h-4 bg-steel group-hover:h-6'}`} />
                <span className="[writing-mode:vertical-rl] rotate-180">{i.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
      {/* small screens: compact top bar */}
      <nav aria-label="Sections" className="fixed inset-x-0 top-0 z-40 flex items-center justify-between border-b border-line bg-black/90 px-4 py-3 text-sm backdrop-blur lg:hidden">
        <a href="#top" className="font-display font-bold tracking-tight">Kyng</a>
        <ul className="flex gap-4 text-steel">
          {items.slice(1).map((i) => (
            <li key={i.id}>
              <a href={`#${i.id}`} aria-current={active === i.id ? 'true' : undefined} className="aria-[current=true]:text-bone">{i.label.split(' ')[0]}</a>
            </li>
          ))}
        </ul>
      </nav>
    </>
  )
}
