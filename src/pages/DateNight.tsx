import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { TOYS } from '../data/toys'
import { DARES } from '../data/prompts'
import { availablePrompts, pickRandom } from '../lib/play'
import type { Toy } from '../types'
import { Button } from '../components/ui'
import SafeWordBar from '../components/SafeWordBar'
import { useSpeech } from '../lib/useSpeech'

// A guided, candle-lit evening for two. It reads as a romantic ritual — and it
// gently, naturally leads a warmed-up couple to bring a toy into their night.
// The toy is never the headline; it simply becomes the obvious next step once
// they're already in the moment.
type Stage = 'scene' | 'warmup' | 'spark' | 'play' | 'explore' | 'afterglow'

// Note the order: the couple warms up *first*, and only then is a toy invited in.
const ORDER: Stage[] = ['scene', 'warmup', 'spark', 'play', 'explore', 'afterglow']

// How the chosen session length is spread across the timed steps (afterglow is
// always open-ended). These are gentle suggestions, never a countdown you must
// obey — the couple can always linger.
const WEIGHTS: Record<Stage, number> = {
  scene: 0.1,
  warmup: 0.28,
  spark: 0.07,
  play: 0.22,
  explore: 0.33,
  afterglow: 0,
}

const LENGTHS = [
  { min: 15, label: 'A quick spark', sub: '~15 min' },
  { min: 30, label: 'Take our time', sub: '~30 min', rec: true },
  { min: 45, label: 'A long, slow evening', sub: '~45 min' },
  { min: 60, label: 'All night', sub: '~60 min' },
  { min: 90, label: 'Lose track of time', sub: '~90 min' },
  { min: 120, label: 'The whole evening', sub: '~2 hours' },
  { min: 0, label: 'Freeflow', sub: 'no timer' },
]

export default function DateNight() {
  const { state, dispatch } = useStore()
  const navigate = useNavigate()
  const available = useMemo(
    () => TOYS.filter((t) => t.level <= state.unlockedLevel),
    [state.unlockedLevel],
  )
  const [stage, setStage] = useState<Stage>('scene')
  const [totalMin, setTotalMin] = useState<number | null>(null) // null until chosen; 0 = freeflow
  const [toy, setToy] = useState<Toy | null>(
    available.find((t) => t.beginnerFriendly) ?? available[0] ?? null,
  )
  const warmups = useMemo(() => {
    const pool = availablePrompts(DARES, state.unlockedLevel).filter(
      (p) => p.category === 'touch' || p.category === 'flirt',
    )
    const picks: string[] = []
    let last: string | undefined
    for (let i = 0; i < 3; i++) {
      const p = pickRandom(pool, last)
      if (p) {
        picks.push(p.text)
        last = p.id
      }
    }
    return picks
  }, [state.unlockedLevel])

  const idx = ORDER.indexOf(stage)
  const next = () => setStage(ORDER[Math.min(idx + 1, ORDER.length - 1)])
  const back = () => setStage(ORDER[Math.max(idx - 1, 0)])

  // ── Guided voice ──────────────────────────────────────────────────────────
  const { supported, speaking, speak, stop, prefs, setPrefs } = useSpeech()

  // A warm, conversational script for the narrator — a little softer and more
  // spoken than the on-screen text.
  const script = useMemo(() => {
    switch (stage) {
      case 'scene':
        return `Welcome to your evening together. Let's set the mood. Dim the lights or light a candle, put on a playlist you both love, and when you're ready, say your safe word out loud to each other. There's no rush tonight.`
      case 'warmup':
        return `Now, take your time to warm up. ${warmups.join('. ')}. Go slowly, and enjoy every single moment.`
      case 'spark':
        return `You're both warmed up now. If it feels exciting, you might bring something in to play with together — or simply stay just as you are. Choose whatever draws you in.`
      case 'play':
        return toy
          ? `Lovely choice. ${toy.howTo} Remember: ${toy.tips[0].toLowerCase()}. There's no need to hurry — let it feel good.`
          : ''
      case 'explore':
        return `Take your time exploring together. Let whoever is receiving guide the pace and the pressure. Keep talking, and when something feels good, stay right there.`
      case 'afterglow':
        return `That was beautiful. Stay close now. Catch your breath, hold each other, and tell one another one thing you loved. You did this together.`
    }
  }, [stage, warmups, toy])

  // Narrate whenever the step changes and the voice is on.
  useEffect(() => {
    if (prefs.enabled && script) speak(script)
    else stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, prefs.enabled])

  // Suggested seconds for the current step, from the chosen session length.
  const stageSeconds =
    totalMin && totalMin > 0 ? Math.round(totalMin * 60 * WEIGHTS[stage]) : 0

  // A soft spoken nudge when a step's suggested time is up — pure encouragement.
  const onTimeUp = useCallback(() => {
    if (prefs.enabled) {
      speak("There's no rush at all. Whenever you both feel ready, move on together.")
    }
  }, [prefs.enabled, speak])

  // The evening is available once the couple is at Flirty (L2) or above — so
  // it's always something they both chose to step into.
  if (available.length === 0) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
        <div className="text-6xl">🕯️</div>
        <h1 className="font-display mt-4 text-3xl font-bold text-white">Date Night</h1>
        <p className="mt-3 max-w-xs text-plum-200/80">
          This guided evening opens up once you raise your comfort to{' '}
          <span className="font-semibold text-ember-300">Flirty (Level 2)</span> together.
        </p>
        <Link to="/settings" className="mt-6">
          <Button>Adjust comfort together</Button>
        </Link>
      </div>
    )
  }

  // First, choose how long tonight should last.
  if (totalMin === null) {
    return (
      <div className="flex min-h-[74vh] flex-col">
        <button onClick={() => navigate('/')} className="mb-4 text-sm text-plum-300">
          ← Home
        </button>
        <div className="animate-float-in text-center">
          <div className="animate-breathe text-5xl">⏳</div>
          <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-ember-300">
            An evening for two
          </p>
          <h1 className="font-display text-3xl font-bold text-white text-glow">
            How long tonight?
          </h1>
          <p className="mx-auto mt-2 max-w-xs text-sm text-plum-200/85">
            Pick a pace. We'll gently suggest a time for each step — but you can always
            linger. This is only a guide.
          </p>
        </div>

        <div className="mt-8 space-y-3">
          {LENGTHS.map((l) => (
            <button
              key={l.min}
              onClick={() => setTotalMin(l.min)}
              className="card-glass flex w-full items-center justify-between rounded-3xl p-4 text-left transition hover:bg-white/10 active:scale-[0.99]"
            >
              <span>
                <span className="flex items-center gap-2 font-semibold text-white">
                  {l.label}
                  {l.rec && (
                    <span className="rounded-full bg-ember-500/20 px-2 py-0.5 text-[10px] font-semibold text-ember-300">
                      popular
                    </span>
                  )}
                </span>
                <span className="text-sm text-plum-200/70">{l.sub}</span>
              </span>
              <span className="text-plum-300">→</span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[74vh] flex-col">
      <div className="mb-3 flex items-center justify-between">
        <button onClick={() => navigate('/')} className="text-sm text-plum-300">
          ← Home
        </button>
        <div className="flex gap-1.5">
          {ORDER.map((s, i) => (
            <span
              key={s}
              className={`h-1.5 rounded-full transition-all ${
                i <= idx ? 'w-6 bg-gradient-to-r from-ember-400 to-plum-400' : 'w-3 bg-white/15'
              }`}
            />
          ))}
        </div>
      </div>

      {stageSeconds > 0 && stage !== 'afterglow' && (
        <StageTimer key={stage} seconds={stageSeconds} onElapsed={onTimeUp} />
      )}

      <div className="flex flex-1 flex-col">
        {stage === 'scene' && (
          <Step
            emoji="🕯️"
            eyebrow="Set the scene"
            title="Light the mood"
            lead="The best evenings start slow and warm. Take a minute to make the room feel like yours alone."
          >
            <Checklist
              items={[
                'Dim the lights or light a candle',
                'Put on a playlist you both love',
                'Silence phones (except this one 😏)',
                `Say your safe word out loud together: “${state.profile.safeWord}”`,
              ]}
            />
          </Step>
        )}

        {stage === 'warmup' && (
          <Step
            emoji="🔥"
            eyebrow="Warm up"
            title="Build the anticipation"
            lead="Take your time here — trade these slowly, one at a time. The longer you linger, the better everything after feels."
          >
            <div className="space-y-3">
              {warmups.map((w, i) => (
                <div key={i} className="card-glass flex items-start gap-3 rounded-2xl p-4">
                  <span className="font-display text-2xl text-ember-300">{i + 1}</span>
                  <span className="text-plum-50">{w}</span>
                </div>
              ))}
            </div>
          </Step>
        )}

        {stage === 'spark' && (
          <Step
            emoji="✨"
            eyebrow="A little something extra"
            title="Add a spark"
            lead="Now that you're both warmed up, you might bring something in to play with together. Pick whatever feels exciting — or skip it and stay just as you are."
          >
            <div className="grid grid-cols-2 gap-3">
              {available.map((t) => {
                const sel = toy?.id === t.id
                return (
                  <button
                    key={t.id}
                    onClick={() => setToy(t)}
                    className={`rounded-3xl border p-4 text-left transition ${
                      sel ? 'border-ember-400 bg-ember-500/15 glow-ring' : 'border-white/10 bg-white/5'
                    }`}
                  >
                    <div className="text-3xl">{t.emoji}</div>
                    <div className="mt-1 font-semibold text-white">{t.name}</div>
                    {t.beginnerFriendly && (
                      <div className="mt-1 text-[10px] font-semibold text-green-300">
                        easy to start with
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </Step>
        )}

        {stage === 'play' && toy && (
          <Step
            emoji={toy.emoji}
            eyebrow="Ease it in"
            title={`Bring in the ${toy.name.toLowerCase()}`}
            lead={toy.tagline}
          >
            <div className="space-y-4">
              <div className="card-glass rounded-2xl p-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-ember-300">
                  How to begin
                </p>
                <p className="mt-1 text-plum-50">{toy.howTo}</p>
              </div>
              <div className="card-glass rounded-2xl p-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-ember-300">
                  Keep in mind
                </p>
                <ul className="mt-2 space-y-1.5">
                  {toy.tips.map((tip, i) => (
                    <li key={i} className="flex gap-2 text-plum-50">
                      <span className="text-ember-400">•</span> {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Step>
        )}

        {stage === 'explore' && (
          <Step
            emoji="💞"
            eyebrow="Together"
            title="Take your time"
            lead="There's no finish line to race to. Let the one receiving guide the pace, the pressure, and the moment."
          >
            <Checklist
              items={[
                'Let the receiver hold it first, or guide your hand',
                'Keep talking — “more of that?”, “softer?”, “right there?”',
                'When something works, keep doing exactly that',
                'Plenty of lube; slower than you think',
              ]}
            />
            <p className="mt-4 text-center text-sm text-plum-200/70">
              Stay here as long as you like. Move on only when you both feel ready.
            </p>
          </Step>
        )}

        {stage === 'afterglow' && (
          <Step
            emoji="🫶"
            eyebrow="Afterglow"
            title="Stay close"
            lead="The warmth right after is what makes the next night even better. Ease off gently and just be together."
          >
            <Checklist
              items={[
                'Cuddle and catch your breath',
                'Tell each other one thing you loved',
                'No rush, no phones — just you two',
              ]}
            />
            <Button
              className="mt-6 w-full"
              onClick={() => {
                dispatch({ type: 'RECORD_PLAY' })
                navigate('/')
              }}
            >
              Finish the night 💜
            </Button>
          </Step>
        )}
      </div>

      <div className="mt-4 space-y-3">
        {supported && (
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm">
            <button
              onClick={() => setPrefs({ enabled: !prefs.enabled })}
              className="flex items-center gap-2 font-medium text-plum-100"
            >
              <span className={`text-lg ${speaking ? 'animate-breathe' : ''}`}>
                {prefs.enabled ? '🔊' : '🔇'}
              </span>
              Guided voice {prefs.enabled ? 'on' : 'off'}
            </button>
            {prefs.enabled && (
              <button
                onClick={() => (speaking ? stop() : script && speak(script))}
                className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white"
              >
                {speaking ? '❚❚ Pause' : '↻ Replay'}
              </button>
            )}
          </div>
        )}
        {stage !== 'afterglow' && (
          <div className="flex gap-3">
            {idx > 0 && (
              <Button variant="soft" onClick={back}>
                Back
              </Button>
            )}
            <Button className="flex-1" onClick={next} disabled={stage === 'spark' && !toy}>
              {stage === 'scene'
                ? "We're ready →"
                : stage === 'warmup'
                  ? "We're warmed up →"
                  : stage === 'spark'
                    ? 'Continue →'
                    : stage === 'play'
                      ? "Let's explore →"
                      : 'Continue →'}
            </Button>
          </div>
        )}
        <SafeWordBar />
      </div>
    </div>
  )
}

function Step({
  emoji,
  eyebrow,
  title,
  lead,
  children,
}: {
  emoji: string
  eyebrow: string
  title: string
  lead: string
  children: React.ReactNode
}) {
  return (
    <div className="animate-float-in">
      <div className="mb-4 text-center">
        <div className="animate-breathe text-5xl">{emoji}</div>
        <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-ember-300">
          {eyebrow}
        </p>
        <h1 className="font-display text-3xl font-bold text-white text-glow">{title}</h1>
        <p className="mx-auto mt-2 max-w-sm text-sm text-plum-200/85">{lead}</p>
      </div>
      {children}
    </div>
  )
}

function Checklist({ items }: { items: string[] }) {
  return (
    <div className="space-y-2.5">
      {items.map((it, i) => (
        <div key={i} className="card-glass flex items-center gap-3 rounded-2xl px-4 py-3 text-plum-50">
          <span className="text-ember-300">♥</span>
          {it}
        </div>
      ))}
    </div>
  )
}

// A gentle, pausable suggested-time bar for a step. When the time is up it turns
// warm green and softly cues — it never blocks or forces anyone forward.
function StageTimer({
  seconds,
  onElapsed,
}: {
  seconds: number
  onElapsed?: () => void
}) {
  const [elapsed, setElapsed] = useState(0)
  const [paused, setPaused] = useState(false)
  const fired = useRef(false)

  useEffect(() => {
    if (paused) return
    const id = setInterval(() => setElapsed((e) => e + 1), 1000)
    return () => clearInterval(id)
  }, [paused])

  useEffect(() => {
    if (!fired.current && elapsed >= seconds) {
      fired.current = true
      onElapsed?.()
    }
  }, [elapsed, seconds, onElapsed])

  const remaining = Math.max(0, seconds - elapsed)
  const done = elapsed >= seconds
  const pct = Math.min(100, (elapsed / seconds) * 100)
  const mm = Math.floor(remaining / 60)
  const ss = remaining % 60

  return (
    <div className="mb-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
      <div className="flex items-center justify-between text-xs">
        <span className={done ? 'font-semibold text-green-300' : 'text-plum-200/80'}>
          {done
            ? '💜 Take all the time you need'
            : `About ${mm}:${String(ss).padStart(2, '0')} for this step`}
        </span>
        <button
          onClick={() => setPaused((p) => !p)}
          className="rounded-full bg-white/10 px-2.5 py-0.5 font-semibold text-white"
        >
          {paused ? '▶ Resume' : '❚❚ Pause'}
        </button>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full transition-all ${done ? 'bg-green-400' : 'bg-gradient-to-r from-ember-400 to-plum-400'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
