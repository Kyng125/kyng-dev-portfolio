import { useEffect } from 'react'

// Marks every top hairline inside <main> so it draws itself across as it scrolls into view.
export function useDrawRules() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('drawn'); io.unobserve(e.target) } }),
      { rootMargin: '0px 0px -6% 0px' },
    )
    const mark = () => document.querySelectorAll<HTMLElement>('main .hair-t:not([data-draw])').forEach((el) => {
      // anything already on screen at load stays put; the rest draws in later
      el.setAttribute('data-draw', '')
      io.observe(el)
    })
    mark()
    const mo = new MutationObserver(mark)
    mo.observe(document.querySelector('main') as Element, { childList: true, subtree: true })
    return () => { io.disconnect(); mo.disconnect() }
  }, [])
}
