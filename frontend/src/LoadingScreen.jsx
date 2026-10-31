import { useEffect, useState } from 'react'

const STEPS = ['Reading your paper…', 'Putting it into plain words…', 'Finding what you need to do…']

export default function LoadingScreen({ input }) {
  const [step, setStep] = useState(input.kind === 'image' ? 0 : 1)

  useEffect(() => {
    const timer = setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 2500)
    return () => clearInterval(timer)
  }, [])

  return (
    <section className="stack center" aria-busy="true" aria-labelledby="loading-title">
      {input.kind === 'image' && <img className="loading-thumb" src={input.previewUrl} alt="" />}
      <div className="spinner" aria-hidden="true" />
      <h1 id="loading-title" className="loading-title" aria-live="polite">{STEPS[step]}</h1>
      <p className="lead">This usually takes a few seconds.</p>
    </section>
  )
}
