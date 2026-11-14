import { lazy, Suspense, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { projects, type CaseFile } from '../data/projects'
import { GithubCard, LiveFrame, NotionCard } from './LinkCards'

const ArchDiagram3D = lazy(() => import('./ArchDiagram3D'))

function ProofMark({ proof }: { proof: CaseFile['verified'][number]['proof'] }) {
  if (proof === 'verified')
    return <span className="mt-2 h-2.5 w-2.5 shrink-0 rotate-45 bg-gold" role="img" aria-label="Verified" />
  if (proof === 'written')
    return <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full border border-silver" role="img" aria-label="Written, not tested" />
  return <span className="mt-2 h-2.5 w-2.5 shrink-0 border border-dashed border-steel" role="img" aria-label="Not verified" />
}

function File({ p }: { p: CaseFile }) {
  return (
    <article aria-labelledby={`file-${p.id}`}>
      <p className="text-sm text-steel">{p.field}</p>
      <h3 id={`file-${p.id}`} className="display engraved mt-1 text-[clamp(3rem,7vw,5.5rem)] font-bold">{p.name}</h3>
      <p className="measure mt-5 text-lg text-bone/90">{p.summary}</p>

      <h4 className="mt-12 font-display text-2xl tracking-tight">The problem</h4>
      <p className="measure mt-3 text-silver">{p.problem}</p>

      <h4 className="mt-12 font-display text-2xl tracking-tight">How it fits together</h4>
      <ol className="mt-5 grid gap-0 sm:grid-cols-4">
        {p.stages.map((s, i) => (
          <li key={s.name} className={`relative py-4 sm:px-4 sm:first:pl-0 ${i > 0 ? 'hair-t sm:border-l sm:border-t-0 sm:border-line' : 'hair-t sm:border-t-0'} sm:hair-t`}>
            <span className="absolute -top-[3px] left-0 h-[5px] w-[5px] bg-blue sm:left-4 sm:first:left-0" aria-hidden="true" style={{ left: i === 0 ? 0 : undefined }} />
            <p className="font-display text-lg font-semibold">{s.name}</p>
            <p className="mt-1 text-sm text-silver">{s.detail}</p>
          </li>
        ))}
      </ol>
      <p className="mt-4 font-code text-xs text-steel">{p.stack.join('  /  ')}</p>

      {p.id === 'pocket' && (
        <div className="mt-8">
          <Suspense fallback={<div className="h-[380px] hair" />}>
            <ArchDiagram3D />
          </Suspense>
          <p className="mt-3 text-sm text-steel">
            Five devices, one lab node. Gold marks two edits that collided. The faint sphere is a phone that is offline and queuing changes until it reconnects.
          </p>
        </div>
      )}

      <h4 className="mt-12 font-display text-2xl tracking-tight">Decisions that shaped it</h4>
      <dl className="mt-4">
        {p.decisions.map((d) => (
          <div key={d.title} className="hair-t py-4 sm:grid sm:grid-cols-[14rem_1fr] sm:gap-6">
            <dt className="font-medium">{d.title}</dt>
            <dd className="mt-1 text-silver sm:mt-0">{d.why}</dd>
          </div>
        ))}
      </dl>

      <h4 className="mt-12 font-display text-2xl tracking-tight">What is verified</h4>
      <ul className="mt-4 hair-t">
        {p.verified.map((v) => (
          <li key={v.text} className="flex gap-3 hair-b py-3">
            <ProofMark proof={v.proof} />
            <span className="text-bone/90">{v.text}</span>
          </li>
        ))}
      </ul>

      <h4 className="mt-12 font-display text-2xl tracking-tight">See it</h4>
      <div className="mt-5 space-y-5">
        <LiveFrame p={p} />
        <div className="grid gap-5 md:grid-cols-2">
          <GithubCard p={p} />
          <NotionCard p={p} />
        </div>
      </div>
    </article>
  )
}

export default function CaseFiles() {
  const [id, setId] = useState<CaseFile['id']>(projects[0].id)
  const reduce = useReducedMotion()
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const current = projects.find((p) => p.id === id)!

  const onKey = (e: React.KeyboardEvent, i: number) => {
    const n = projects.length
    let j = -1
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') j = (i + 1) % n
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') j = (i - 1 + n) % n
    if (j >= 0) {
      e.preventDefault()
      setId(projects[j].id)
      refs.current[j]?.focus()
    }
  }

  return (
    <section id="work" className="hair-t scroll-mt-0">
      <div className="mx-auto max-w-[1240px] px-6 py-24 lg:px-10">
        <h2 className="display max-w-[14ch] text-[clamp(2.6rem,6vw,4.75rem)] font-bold">Four systems, each with its evidence</h2>
        <p className="measure mt-6 text-silver">
          Pick a case file. Each one covers the problem, the architecture, the decisions behind it and exactly what has been checked.
        </p>

        <div className="mt-14 grid gap-10 lg:grid-cols-[17rem_1fr] lg:gap-16">
          <div role="tablist" aria-label="Case files" aria-orientation="vertical" className="flex gap-2 overflow-x-auto lg:sticky lg:top-10 lg:h-fit lg:flex-col lg:gap-0 lg:overflow-visible">
            {projects.map((p, i) => {
              const on = p.id === id
              return (
                <button
                  key={p.id}
                  ref={(el) => { refs.current[i] = el }}
                  role="tab"
                  id={`tab-${p.id}`}
                  aria-selected={on}
                  aria-controls="case-panel"
                  tabIndex={on ? 0 : -1}
                  onClick={() => setId(p.id)}
                  onKeyDown={(e) => onKey(e, i)}
                  className={`shrink-0 text-left transition-colors lg:hair-t lg:py-5 lg:pl-5 lg:pr-3 ${on ? 'text-bone lg:border-l-2 lg:border-l-blue' : 'text-steel hover:text-silver lg:border-l-2 lg:border-l-transparent'} border border-line px-4 py-2 lg:border-x-0 lg:border-b-0`}
                >
                  <span className="block font-display text-xl font-semibold leading-tight">{p.name}</span>
                  <span className="mt-0.5 hidden text-sm lg:block">{p.field}</span>
                </button>
              )
            })}
          </div>

          <div id="case-panel" role="tabpanel" aria-labelledby={`tab-${id}`} className="min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={reduce ? undefined : { opacity: 0 }}
                transition={{ duration: 0.22 }}
              >
                <File p={current} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
