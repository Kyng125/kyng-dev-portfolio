import { others } from '../data/projects'

export function Also() {
  return (
    <section id="also" className="hair-t">
      <div className="mx-auto max-w-[1240px] px-6 py-24 lg:px-10">
        <h2 className="display max-w-[14ch] text-[clamp(2.6rem,6vw,4.75rem)] font-bold">Also built</h2>
        <p className="measure mt-6 text-silver">Smaller or earlier work across other fields, listed with how far each one actually got.</p>
        <ul className="mt-12">
          {others.map((o) => (
            <li key={o.name} className="hair-t grid gap-1 py-5 md:grid-cols-[12rem_10rem_1fr_11rem] md:gap-6">
              <p className="font-display text-xl font-semibold">{o.name}</p>
              <p className="text-steel">{o.field}</p>
              <p className="text-silver">
                {o.what}
                {o.repo && (
                  <>
                    {' '}
                    <a href={o.repo.url} target="_blank" rel="noreferrer" className="font-code text-sm text-steel underline decoration-line underline-offset-4 hover:text-bone">
                      {o.repo.name}
                    </a>
                    {o.repo.private && <span className="text-sm text-steel"> (private)</span>}
                  </>
                )}
              </p>
              <p className="text-bone/90 md:text-right">{o.state}</p>
            </li>
          ))}
          <li className="hair-t" aria-hidden="true" />
        </ul>
      </div>
    </section>
  )
}

const states = [
  { name: 'Verified', body: 'Confirmed by running it, testing it or authoritative evidence.', mark: <span className="h-3 w-3 rotate-45 bg-gold" /> },
  { name: 'Observed', body: 'Seen directly in an artifact, not independently confirmed.', mark: <span className="h-3 w-3 rounded-full bg-blue" /> },
  { name: 'Inferred', body: 'Reasonably concluded from what is available.', mark: <span className="h-3 w-3 rounded-full border border-silver" /> },
  { name: 'Assumed', body: 'Accepted for now because the information is missing, and recorded as such.', mark: <span className="h-3 w-3 border border-dashed border-silver" /> },
  { name: 'Unknown', body: 'Not enough evidence to say.', mark: <span className="h-3 w-3 border border-line" /> },
]

const principles = [
  { t: 'Evidence before claims', d: 'Tested, verified and working are words I use only when I can point at the output that earned them.' },
  { t: 'Assumptions wear a label', d: 'When a detail is missing I state my assumption and record it. Repetition never turns it into a requirement.' },
  { t: 'The owner decides what matters', d: 'Product purpose, money behaviour, security boundaries and irreversible data are decisions for the person who owns the product.' },
  { t: 'The smallest process that is reliable', d: 'A typo fix is not a project. Depth scales with risk, scale and how hard the change is to undo.' },
  { t: 'State lives in the repository', d: 'Decisions, assumptions and changes are written down where the next person, or the next session, will find them.' },
  { t: 'Resist sameness', d: 'Proven patterns are reused. Default looks are not. Each product gets the visual language its own audience needs.' },
]

export function Method() {
  return (
    <section id="method" className="hair-t">
      <div className="mx-auto max-w-[1240px] px-6 py-24 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
          <div className="lg:sticky lg:top-10 lg:h-fit">
            <h2 className="display text-[clamp(2.6rem,6vw,4.75rem)] font-bold">How I work</h2>
            <p className="measure mt-6 text-silver">
              Every project here ran under a personal engineering system I call WEB-OS. It is the reason each case file can say what was checked and what was not.
            </p>
            <h3 className="mt-10 font-display text-xl font-semibold">How I label what I know</h3>
            <ul className="mt-3">
              {states.map((s) => (
                <li key={s.name} className="hair-t flex items-start gap-3 py-3">
                  <span className="mt-1.5 flex w-3 justify-center">{s.mark}</span>
                  <p><span className="font-medium">{s.name}.</span> <span className="text-silver">{s.body}</span></p>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <ul>
              {principles.map((p) => (
                <li key={p.t} className="hair-t py-7">
                  <h3 className="font-display text-2xl font-semibold tracking-tight">{p.t}</h3>
                  <p className="measure mt-2 text-silver">{p.d}</p>
                </li>
              ))}
            </ul>
            <p className="hair-t pt-7 text-steel">
              A larger private system is also in development. It is not public yet, so there is nothing to link.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

const links = [
  { label: 'Email', value: 'kyng@example.com', href: 'mailto:kyng@example.com' },
  { label: 'GitHub', value: 'github.com/kyng-dev', href: 'https://github.com/kyng-dev' },
  { label: 'LinkedIn', value: 'linkedin.com/in/kyng-dev', href: 'https://linkedin.com/in/kyng-dev' },
  { label: 'X', value: 'x.com/kyng_dev', href: 'https://x.com/kyng_dev' },
  { label: 'Book a call', value: 'cal.com/kyng/intro', href: 'https://cal.com/kyng/intro' },
]

export function Contact() {
  return (
    <footer id="contact" className="hair-t">
      <div className="mx-auto max-w-[1240px] px-6 pb-16 pt-24 lg:px-10">
        <h2 className="display engraved max-w-[12ch] text-[clamp(3rem,8vw,6.5rem)] font-bold">Tell me what to build</h2>
        <p className="measure mt-6 text-silver">A short note is enough: what it should do, who uses it, and when you need it.</p>
        <ul className="mt-12">
          {links.map((l) => (
            <li key={l.label} className="hair-t">
              <a href={l.href} target={l.href.startsWith('mailto') ? undefined : '_blank'} rel="noreferrer" className="group flex items-baseline justify-between gap-6 py-5 transition-colors hover:bg-bone/[0.03] sm:px-2">
                <span className="font-display text-2xl font-semibold">{l.label}</span>
                <span className="truncate text-silver transition-colors group-hover:text-bone">{l.value}</span>
              </a>
            </li>
          ))}
          <li className="hair-t" aria-hidden="true" />
        </ul>
        <p className="mt-10 text-sm text-steel">Kyng. Built with React, Three.js and the same evidence rules described above.</p>
      </div>
    </footer>
  )
}
