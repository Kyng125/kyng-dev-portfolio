import { statusStrip, type Evidence } from '../data/projects'

function Mark({ s }: { s: Evidence }) {
  if (s === 'live') return <span className="live-dot h-2.5 w-2.5 rounded-full bg-blue" aria-hidden="true" />
  if (s === 'verified') return <span className="h-2.5 w-2.5 rotate-45 bg-gold" aria-hidden="true" />
  return <span className="h-2.5 w-2.5 rounded-full border border-silver" aria-hidden="true" />
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
              <p className="text-xs text-silver/80 sm:text-sm">{s.note}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
