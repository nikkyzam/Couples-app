import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { WHISPER_LINES, WHISPER_OPENERS, type WhisperLine } from '../data/dirtyTalk'
import { pickRandom } from '../lib/play'
import { SPICE_META, type LoveNote, type PartnerId, type SpiceLevel } from '../types'
import { Button, LevelBadge } from '../components/ui'
import SafeWordBar from '../components/SafeWordBar'
import { useSpeech } from '../lib/useSpeech'

// A tiny, offline "confidence" tracker. Kept in localStorage (not the synced
// store) so it stays personal to the shy partner — a private little win counter,
// never shown to anyone else, never pushed to the cloud.
const CONF_KEY = 'kindle.whisper.v1'
function loadConfidence(): number {
  try {
    return Number(localStorage.getItem(CONF_KEY)) || 0
  } catch {
    return 0
  }
}
function saveConfidence(n: number) {
  try {
    localStorage.setItem(CONF_KEY, String(n))
  } catch {
    /* ignore */
  }
}

// Playful tiers so every attempt feels like progress.
const TIERS = [
  { at: 0, label: 'Warming up', emoji: '🌱' },
  { at: 3, label: 'Finding your voice', emoji: '🔥' },
  { at: 8, label: 'Getting bold', emoji: '😏' },
  { at: 16, label: 'Silver tongue', emoji: '💋' },
  { at: 30, label: 'Absolutely shameless', emoji: '👑' },
]
function tierFor(n: number) {
  return [...TIERS].reverse().find((t) => n >= t.at) ?? TIERS[0]
}

// Gentle cheers shown after each line is said — always praise the *try*.
const CHEERS = [
  'You said it. That’s the hard part done 💛',
  'See? That wasn’t so scary.',
  'Bolder than you thought, hm?',
  'Your partner definitely felt that one.',
  'Look at you go 😏',
  'Every whisper gets a little easier.',
]

export default function Whisper() {
  const { state, dispatch } = useStore()
  const navigate = useNavigate()
  const { supported, speak, prefs } = useSpeech()

  const me = state.activeUser
  const other: PartnerId = me === 'A' ? 'B' : 'A'
  const names = state.profile.accounts

  // Boldness dial — starts as gentle as possible, never exceeds the couple's ceiling.
  const [heat, setHeat] = useState<SpiceLevel>(1)
  const [mode, setMode] = useState<'lines' | 'openers'>('lines')

  const [line, setLine] = useState<WhisperLine | null>(null)
  const [showSofter, setShowSofter] = useState(false)

  const [opener, setOpener] = useState<(typeof WHISPER_OPENERS)[number] | null>(null)
  const [fillIn, setFillIn] = useState('')

  const [confidence, setConfidence] = useState(loadConfidence)
  const [cheer, setCheer] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  const ceiling = state.unlockedLevel
  const meta = SPICE_META[heat]

  const linePool = useMemo(
    () => WHISPER_LINES.filter((l) => l.level === heat),
    [heat],
  )
  const openerPool = useMemo(
    () => WHISPER_OPENERS.filter((o) => o.level <= heat),
    [heat],
  )

  const tier = tierFor(confidence)
  const nextTier = TIERS.find((t) => t.at > confidence)

  function drawLine() {
    const next = pickRandom(linePool, line?.id)
    if (!next) return
    setLine(next)
    setShowSofter(false)
    setCheer(null)
    setSent(false)
    if (prefs.enabled) speak(next.text)
  }

  function drawOpener() {
    const next = pickRandom(openerPool, opener?.id)
    if (!next) return
    setOpener(next)
    setFillIn('')
    setCheer(null)
    setSent(false)
  }

  // The current thing to say — either the picked line (softer if they flinched)
  // or the opener stem completed with their own words.
  const spoken = mode === 'lines'
    ? line
      ? showSofter && line.softer
        ? line.softer
        : line.text
      : ''
    : opener
      ? `${opener.stem} ${fillIn}`.trim()
      : ''

  function saidIt() {
    if (!spoken) return
    const n = confidence + 1
    setConfidence(n)
    saveConfidence(n)
    setCheer(CHEERS[Math.floor(Math.random() * CHEERS.length)])
    // Feed the shared progression, just like the other games.
    dispatch({ type: 'RECORD_PLAY' })
  }

  // Escape hatch for the truly shy: send the exact line as a private note, so it
  // still gets said — just in writing, no voice required.
  function sendInstead() {
    if (!spoken) return
    const note: LoveNote = {
      id: crypto.randomUUID(),
      from: me,
      to: other,
      text: spoken,
      mood: '🫦',
      createdAt: Date.now(),
      read: false,
    }
    dispatch({ type: 'SEND_NOTE', note })
    dispatch({ type: 'RECORD_PLAY' })
    setSent(true)
    const n = confidence + 1
    setConfidence(n)
    saveConfidence(n)
  }

  const hasSofter = mode === 'lines' && !!line?.softer && !showSofter

  return (
    <div className="flex min-h-[70vh] flex-col">
      <button onClick={() => navigate('/games')} className="mb-2 text-sm text-plum-300">
        ← Games
      </button>

      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-white">Whisper 🫦</h1>
        <LevelBadge level={ceiling} />
      </div>
      <p className="mt-1 text-sm text-plum-200/80">
        Dirty talk, one tiny brave step at a time. Hear it first, whisper it, or
        just send it — no pressure, ever.
      </p>

      {/* Confidence meter — makes trying feel like a game you're winning */}
      <div className="card-glass mt-4 rounded-3xl p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-white">
            {tier.emoji} {tier.label}
          </span>
          <span className="text-xs text-plum-200/70">{confidence} said</span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-ember-400 to-plum-400 transition-all"
            style={{
              width: nextTier
                ? `${Math.min(100, ((confidence - tier.at) / (nextTier.at - tier.at)) * 100)}%`
                : '100%',
            }}
          />
        </div>
        <p className="mt-2 text-xs text-plum-200/60">
          {nextTier
            ? `${nextTier.at - confidence} more to reach “${nextTier.label}”.`
            : 'You’ve maxed out the confidence meter. Unstoppable. 👑'}
        </p>
      </div>

      {/* Boldness dial + mode toggle */}
      <div className="mt-4 space-y-3">
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-widest text-ember-300">
              How bold?
            </span>
            <span className="text-xs text-plum-200/70">
              {meta.emoji} {meta.name}
            </span>
          </div>
          <div className="flex gap-1.5">
            {([1, 2, 3, 4, 5] as SpiceLevel[]).map((lvl) => {
              const locked = lvl > ceiling
              const activeLvl = lvl === heat
              return (
                <button
                  key={lvl}
                  disabled={locked}
                  onClick={() => {
                    setHeat(lvl)
                    setLine(null)
                    setOpener(null)
                    setCheer(null)
                    setSent(false)
                  }}
                  className={`flex-1 rounded-2xl py-2 text-sm font-semibold transition ${
                    activeLvl
                      ? 'bg-gradient-to-br from-ember-500 to-plum-500 text-white'
                      : locked
                        ? 'cursor-not-allowed bg-white/5 text-plum-300/30'
                        : 'bg-white/5 text-plum-100 hover:bg-white/10'
                  }`}
                  title={locked ? 'Raise your comfort ceiling in Settings to unlock' : ''}
                >
                  {locked ? '🔒' : lvl}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              setMode('lines')
              setCheer(null)
              setSent(false)
            }}
            className={`flex-1 rounded-2xl py-2 text-sm font-medium transition ${
              mode === 'lines' ? 'bg-white/15 text-white' : 'bg-white/5 text-plum-200/70'
            }`}
          >
            🎴 Give me a line
          </button>
          <button
            onClick={() => {
              setMode('openers')
              setCheer(null)
              setSent(false)
            }}
            className={`flex-1 rounded-2xl py-2 text-sm font-medium transition ${
              mode === 'openers' ? 'bg-white/15 text-white' : 'bg-white/5 text-plum-200/70'
            }`}
          >
            ✍️ Fill in the blank
          </button>
        </div>
      </div>

      {/* Stage */}
      <div className="flex flex-1 flex-col justify-center py-5">
        {mode === 'lines' ? (
          !line ? (
            <div className="text-center">
              <div className="mb-3 text-6xl">🫦</div>
              <p className="mb-4 text-plum-200/80">
                A gentle line to say to{' '}
                {names[other].name || 'your partner'} — you choose how.
              </p>
              <Button className="!py-5 text-lg" onClick={drawLine}>
                Show me a line ✨
              </Button>
            </div>
          ) : (
            <div className="animate-flip">
              <div className="card-glass rounded-3xl p-7 text-center">
                <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-ember-300">
                  Say it to them
                </p>
                <p className="text-2xl font-medium leading-relaxed text-white">
                  “{spoken}”
                </p>
                {showSofter && (
                  <p className="mt-3 text-xs text-plum-300/70">softer version 🫶</p>
                )}
              </div>
            </div>
          )
        ) : !opener ? (
          <div className="text-center">
            <div className="mb-3 text-6xl">✍️</div>
            <p className="mb-4 text-plum-200/80">
              Finishing a sentence is easier than starting one. Pick a beginning
              and make it yours.
            </p>
            <Button className="!py-5 text-lg" onClick={drawOpener}>
              Give me a starter ✨
            </Button>
          </div>
        ) : (
          <div className="animate-flip">
            <div className="card-glass rounded-3xl p-6">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-ember-300">
                Finish the thought
              </p>
              <p className="text-xl font-medium leading-relaxed text-white">
                {opener.stem}
              </p>
              <input
                autoFocus
                value={fillIn}
                onChange={(e) => setFillIn(e.target.value)}
                placeholder="…your words here"
                className="mt-3 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-plum-300/40 focus:border-ember-400/50 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Cheer / sent confirmation */}
        {sent ? (
          <p className="mt-4 text-center text-sm font-medium text-ember-300 animate-float-in">
            Sent to {names[other].name || 'your partner'}’s inbox 💌 — brave move.
          </p>
        ) : (
          cheer && (
            <p className="mt-4 text-center text-sm font-medium text-ember-300 animate-float-in">
              {cheer}
            </p>
          )
        )}

        {/* Actions */}
        {spoken && (
          <div className="mt-5 space-y-3">
            <div className="flex items-center justify-center gap-3">
              {supported && (
                <button
                  onClick={() => speak(spoken, { force: true })}
                  className="grid h-12 w-12 place-items-center rounded-full bg-white/5 text-xl"
                  title="Hear it first, then just repeat it"
                >
                  🔊
                </button>
              )}
              <Button className="flex-1" onClick={saidIt}>
                I said it ✓
              </Button>
              {hasSofter && (
                <Button variant="soft" onClick={() => setShowSofter(true)} title="Dial it down">
                  🙈 Softer
                </Button>
              )}
            </div>
            <button
              onClick={sendInstead}
              className="w-full rounded-2xl bg-white/5 py-3 text-sm font-medium text-plum-100 transition hover:bg-white/10"
            >
              💌 Too shy to say it? Send it as a note instead
            </button>
            <button
              onClick={mode === 'lines' ? drawLine : drawOpener}
              className="w-full text-sm text-plum-300"
            >
              ↻ {mode === 'lines' ? 'Another line' : 'Another starter'}
            </button>
          </div>
        )}
      </div>

      <SafeWordBar />
    </div>
  )
}
