import { useEffect, useRef } from 'react'

export default function ReadingRuler() {
  const band = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let frame = 0
    const move = (event: PointerEvent) => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => band.current?.style.setProperty('--ruler-y', `${event.clientY}px`))
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', move)
    }
  }, [])

  return <div ref={band} className="reading-ruler" aria-hidden="true" />
}
