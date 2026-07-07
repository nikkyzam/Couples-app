import { useMemo } from 'react'

// Softly drifting embers & rose petals for a candlelit, intimate mood. Purely
// decorative and non-interactive; respects prefers-reduced-motion via CSS.
const GLYPHS = ['✦', '♥', '❥', '✧', '🌹', '❣']

export default function Ambiance({ count = 14 }: { count?: number }) {
  const embers = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const left = Math.random() * 100
        const duration = 14 + Math.random() * 16
        const delay = -Math.random() * duration
        const size = 0.6 + Math.random() * 1.2
        const drift = `${(Math.random() * 2 - 1) * 60}px`
        const glyph = GLYPHS[i % GLYPHS.length]
        const hue = Math.random() > 0.5 ? '#ff6885' : '#d9a7ff'
        return { left, duration, delay, size, drift, glyph, hue, id: i }
      }),
    [count],
  )

  return (
    <div className="ambiance" aria-hidden>
      {embers.map((e) => (
        <span
          key={e.id}
          className="ember"
          style={{
            left: `${e.left}%`,
            fontSize: `${e.size}rem`,
            color: e.hue,
            animationDuration: `${e.duration}s`,
            animationDelay: `${e.delay}s`,
            // @ts-expect-error custom prop for keyframe drift
            '--drift': e.drift,
          }}
        >
          {e.glyph}
        </span>
      ))}
    </div>
  )
}
