import { motion, useReducedMotion } from 'framer-motion'
import { useCallback, useState } from 'react'
import HeroName3D from './HeroName3D'
import StatusStrip from './StatusStrip'

const LEAD = 'I build products from conception to actualization:'
const REST =
  'the firmware, the APIs, the databases, the offline sync, the security and the interface people use. Every system below shows what was tested and what was not.'

// Sketch to solid: every word starts as an outline and is filled by a thin blue edge.
// The opening phrase resolves slowly, so "conception" and "actualization" are visibly different states.
function Words() {
  const lead = LEAD.split(' ')
  const rest = REST.split(' ')
  const base = 1.25 // seconds after load
  return (
    <>
      {lead.map((w, i) => (
        <span key={`l${i}`} className="reveal-word" style={{ ['--delay' as string]: `${base + i * 0.2}s`, ['--dur' as string]: '0.95s' }}>
          {w}{' '}
        </span>
      ))}
      {rest.map((w, i) => (
        <span key={`r${i}`} className="reveal-word" style={{ ['--delay' as string]: `${base + lead.length * 0.2 + i * 0.045}s`, ['--dur' as string]: '0.5s' }}>
          {w}{' '}
        </span>
      ))}
    </>
  )
}

export default function Hero() {
  const reduce = useReducedMotion()
  const [webgl, setWebgl] = useState(true)
  const onFail = useCallback(() => setWebgl(false), [])
  const letters = 'Kyng'.split('')
  return (
    <header id="top" className="relative flex min-h-[100svh] flex-col overflow-hidden">
      <div className="absolute inset-0">{webgl && <HeroName3D onFail={onFail} />}</div>
      <div className="relative z-10 mx-auto flex w-full max-w-[1240px] flex-1 flex-col justify-end px-6 pb-10 pt-[22rem] lg:px-10 lg:pt-10">
        <h1
          className={webgl ? 'sr-only' : 'display engraved flex overflow-hidden pb-[0.08em] text-[clamp(6.5rem,24vw,19rem)] font-extrabold'}
          aria-label="Kyng"
        >
          {webgl
            ? 'Kyng'
            : letters.map((c, i) => (
                <motion.span
                  key={i}
                  aria-hidden="true"
                  initial={reduce ? false : { y: '105%' }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.9, delay: 0.15 + i * 0.09, ease: [0.2, 0.8, 0.2, 1] }}
                  className="inline-block"
                >
                  {c}
                </motion.span>
              ))}
        </h1>
        <motion.p
          data-yield
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="mt-2 w-fit font-display text-[clamp(1.25rem,2.6vw,2rem)] font-medium tracking-tight text-silver transition-colors data-[covered=true]:text-white"
        >
          Full-Stack Engineer · Multi-Field Product Builder
        </motion.p>
        <p data-yield className="measure mt-6 w-fit text-bone/90 transition-[filter] duration-300 data-[covered=true]:[filter:drop-shadow(0_0_10px_#000)_drop-shadow(0_0_2px_#000)]">
          <Words />
        </p>
        <motion.div
          data-yield
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3, duration: 0.8 }}
          className="mt-8 flex w-fit flex-wrap gap-3"
        >
          <a href="#work" className="bg-bone px-6 py-3 font-medium text-black transition-colors hover:bg-white">Read the case files</a>
          <a href="#contact" className="border border-steel px-6 py-3 text-bone transition-colors hover:border-bone">Get in touch</a>
        </motion.div>
      </div>
      <StatusStrip />
    </header>
  )
}
