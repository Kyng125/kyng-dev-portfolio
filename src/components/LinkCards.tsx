import { useEffect, useState } from 'react'
import type { CaseFile } from '../data/projects'
import ScreenMock from './ScreenMock'

const tone = { blue: 'bg-blue', silver: 'bg-silver', gold: 'bg-gold', white: 'bg-bone' } as const

export function GithubCard({ p }: { p: CaseFile }) {
  const g = p.github
  return (
    <a
      href={g.url}
      target="_blank"
      rel="noreferrer"
      className="group block hair p-5 transition-colors hover:border-steel"
    >
      <div className="flex items-center gap-2 text-silver">
        <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38v-1.33c-2.23.48-2.7-1.07-2.7-1.07-.36-.92-.89-1.17-.89-1.17-.73-.5.05-.49.05-.49.8.06 1.23.83 1.23.83.71 1.22 1.87.87 2.33.66.07-.52.28-.87.5-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 014 0c1.53-1.03 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.28.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48v2.2c0 .21.15.46.55.38A8 8 0 0016 8c0-4.42-3.58-8-8-8z" />
        </svg>
        <span className="font-code text-sm">{g.repo}</span>
        {g.private && <span className="ml-auto rounded-full border border-line px-2 py-0.5 text-xs text-steel">Private repository</span>}
      </div>
      <p className="mt-3 text-[0.95rem] text-bone/90">{g.blurb}</p>
      <div className="mt-4 flex h-1.5 w-full overflow-hidden rounded-full" role="img" aria-label={`Languages: ${g.langs.map((l) => `${l.name} ${l.pct}%`).join(', ')}`}>
        {g.langs.map((l) => (
          <span key={l.name} className={tone[l.tone]} style={{ width: `${l.pct}%` }} />
        ))}
      </div>
      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-steel">
        {g.langs.map((l) => (
          <li key={l.name} className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${tone[l.tone]}`} />
            {l.name} {l.pct}%
          </li>
        ))}
      </ul>
      <p className="mt-4 hair-t pt-3 font-code text-[0.8rem] text-steel">
        <span className="text-gold">{g.commit.hash}</span> {g.commit.message}
      </p>
    </a>
  )
}

export function NotionCard({ p }: { p: CaseFile }) {
  const n = p.notion
  return (
    <a
      href={n.url}
      target="_blank"
      rel="noreferrer"
      className="block hair bg-bone/[0.03] p-5 transition-colors hover:border-steel"
    >
      <div className="flex items-center gap-2 text-silver">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <rect x="4" y="3" width="16" height="18" rx="2" />
          <path d="M8 8h8M8 12h8M8 16h5" />
        </svg>
        <span className="text-sm">Notion page</span>
      </div>
      <h4 className="mt-3 font-display text-xl tracking-tight">{n.title}</h4>
      <ul className="mt-3 space-y-1.5 text-[0.95rem] text-silver">
        {n.notes.map((x) => (
          <li key={x} className="flex gap-2">
            <span className="mt-[0.7em] h-px w-3 shrink-0 bg-steel" />
            {x}
          </li>
        ))}
      </ul>
    </a>
  )
}

export function LiveFrame({ p }: { p: CaseFile }) {
  const [rendered, setRendered] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setRendered(true), 250)
    return () => clearTimeout(t)
  }, [])
  return (
    <figure className="hair">
      <div className="flex items-center gap-3 hair-b px-3 py-2">
        <span className="flex gap-1.5" aria-hidden="true">
          <i className="h-2.5 w-2.5 rounded-full bg-line" />
          <i className="h-2.5 w-2.5 rounded-full bg-line" />
          <i className="h-2.5 w-2.5 rounded-full bg-line" />
        </span>
        <a href={p.live.url} target="_blank" rel="noreferrer" className="min-w-0 flex-1 truncate rounded-full bg-bone/[0.05] px-3 py-1 font-code text-xs text-silver hover:text-bone">
          {p.live.host}
        </a>
        <button
          type="button"
          aria-pressed={!rendered}
          onClick={() => setRendered((r) => !r)}
          className="shrink-0 rounded-full border border-line px-3 py-1 text-xs text-silver transition-colors hover:border-steel hover:text-bone"
        >
          {rendered ? 'Show wireframe' : 'Show render'}
        </button>
      </div>
      <div className="screen relative bg-black p-3">
        <div className="wire"><ScreenMock id={p.id} /></div>
        <div
          className="rend resolve absolute inset-3"
          style={{ clipPath: rendered ? 'inset(0 0 0 0)' : 'inset(0 100% 0 0)' }}
        >
          <ScreenMock id={p.id} />
        </div>
      </div>
      <figcaption className="hair-t px-3 py-2 text-sm text-steel">{p.live.caption}. Placeholder address.</figcaption>
    </figure>
  )
}
