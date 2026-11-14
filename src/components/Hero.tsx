import { motion, useReducedMotion } from 'framer-motion'
import HeroObject from './HeroObject'
import StatusStrip from './StatusStrip'

export default function Hero() {
  const reduce = useReducedMotion()
  const letters = 'Kyng'.split('')
  return (
    <header id="top" className="relative flex min-h-[100svh] flex-col overflow-hidden">
      <div className="absolute inset-y-0 -right-[8%] w-[116%] opacity-35 lg:-right-[6%] lg:w-[60%] lg:opacity-100" aria-hidden={false}>
        <HeroObject />
      </div>
      <div className="relative z-10 mx-auto flex w-full max-w-[1240px] flex-1 flex-col justify-center px-6 pb-10 pt-28 lg:px-10 lg:pt-10">
        <h1 className="display engraved flex overflow-hidden pb-[0.08em] text-[clamp(6.5rem,24vw,19rem)] font-extrabold" aria-label="Kyng">
          {letters.map((c, i) => (
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
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="mt-4 font-display text-[clamp(1.25rem,2.6vw,2rem)] font-medium tracking-tight text-silver"
        >
          Full-Stack Engineer · Multi-Field Product Builder
        </motion.p>
        <motion.p
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.8 }}
          className="measure mt-6 text-bone/80"
        >
          I build products from the sensor to the screen: firmware, APIs, databases, offline sync, security and the interface people use. Every system below comes with what was tested and what was not.
        </motion.p>
        <motion.div
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3, duration: 0.8 }}
          className="mt-8 flex flex-wrap gap-3"
        >
          <a href="#work" className="bg-bone px-6 py-3 font-medium text-black transition-colors hover:bg-white">Read the case files</a>
          <a href="#contact" className="border border-steel px-6 py-3 text-bone transition-colors hover:border-bone">Get in touch</a>
        </motion.div>
      </div>
      <StatusStrip />
    </header>
  )
}
