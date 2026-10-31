import { useEffect, useRef } from 'react'

/** A soft band that follows the pointer and dims the rest of the page, helping the eye stay on one line. */
export function ReadingRuler() {
  const bandRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let frame = 0
    const move = (event: PointerEvent) => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        bandRef.current?.style.setProperty('--ruler-y', `${event.clientY}px`)
      })
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', move)
    }
  }, [])

  return (
    <div
      ref={bandRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-40"
      style={{
        ['--ruler-y' as string]: '50vh',
        background:
          'linear-gradient(to bottom, rgb(4 20 26 / 0.38) calc(var(--ruler-y) - 2.4rem), transparent calc(var(--ruler-y) - 2.4rem), transparent calc(var(--ruler-y) + 2.4rem), rgb(4 20 26 / 0.38) calc(var(--ruler-y) + 2.4rem))',
      }}
    />
  )
}
