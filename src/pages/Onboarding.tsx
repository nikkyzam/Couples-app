import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { SPICE_META, type SpiceLevel } from '../types'
import { Button } from '../components/ui'

const EMOJIS = ['💜', '❤️', '🧡', '💛', '💚', '💙', '🩷', '🔥', '🌙', '⭐']

export default function Onboarding() {
  const { state, dispatch } = useStore()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)

  const [nameA, setNameA] = useState(state.profile.accounts.A.name)
  const [nameB, setNameB] = useState(state.profile.accounts.B.name)
  const [emojiA, setEmojiA] = useState(state.profile.accounts.A.emoji)
  const [emojiB, setEmojiB] = useState(state.profile.accounts.B.emoji)
  const [comfort, setComfort] = useState<SpiceLevel>(state.profile.comfort)
  const [safeWord, setSafeWord] = useState(state.profile.safeWord)

  function finish() {
    dispatch({
      type: 'COMPLETE_ONBOARDING',
      payload: {
        accounts: {
          A: { name: nameA.trim() || 'Partner 1', emoji: emojiA, pin: '' },
          B: { name: nameB.trim() || 'Partner 2', emoji: emojiB, pin: '' },
        },
        comfort,
        safeWord: safeWord.trim() || 'pineapple',
      },
    })
    navigate('/')
  }

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col px-6 py-10">
      {step === 0 && (
        <div className="animate-float-in flex flex-1 flex-col justify-center text-center">
          <div className="mb-4 animate-breathe text-6xl">🔥</div>
          <h1 className="font-display text-6xl font-bold text-white text-glow">Kindle</h1>
          <p className="mt-3 text-lg text-plum-200/90">
            An intimate, private space for the two of you — where curiosity turns
            into confidence, and closeness into fire.
          </p>
          <ul className="mx-auto mt-8 space-y-3 text-left text-sm text-plum-100/90">
            <li className="flex gap-3">
              <span>🫶</span> Start soft. Nothing is ever pushed on you.
            </li>
            <li className="flex gap-3">
              <span>🎲</span> Games and prompts that grow with you.
            </li>
            <li className="flex gap-3">
              <span>🔒</span> Everything stays private on your device.
            </li>
          </ul>
          <Button className="mt-10" onClick={() => setStep(1)}>
            Get started
          </Button>
        </div>
      )}

      {step === 1 && (
        <div className="animate-float-in flex flex-1 flex-col">
          <h2 className="text-2xl font-bold text-white">Who are you two?</h2>
          <p className="mt-1 text-sm text-plum-200/80">
            Each of you gets your own profile on this shared space.
          </p>

          <div className="mt-8 space-y-6">
            {[
              { label: 'Partner 1', name: nameA, setName: setNameA, emoji: emojiA, setEmoji: setEmojiA },
              { label: 'Partner 2', name: nameB, setName: setNameB, emoji: emojiB, setEmoji: setEmojiB },
            ].map((p, i) => (
              <div key={i} className="card-glass rounded-3xl p-4">
                <input
                  value={p.name}
                  onChange={(e) => p.setName(e.target.value)}
                  placeholder={p.label}
                  className="w-full bg-transparent text-lg font-semibold text-white placeholder:text-plum-300/50 focus:outline-none"
                />
                <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
                  {EMOJIS.map((e) => (
                    <button
                      key={e}
                      onClick={() => p.setEmoji(e)}
                      className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-xl transition ${
                        p.emoji === e ? 'bg-ember-500/40 ring-2 ring-ember-400' : 'bg-white/5'
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-auto flex gap-3 pt-8">
            <Button variant="soft" onClick={() => setStep(0)}>
              Back
            </Button>
            <Button className="flex-1" onClick={() => setStep(2)}>
              Continue
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="animate-float-in flex flex-1 flex-col">
          <h2 className="text-2xl font-bold text-white">Set your comfort level</h2>
          <p className="mt-1 text-sm text-plum-200/80">
            This is your ceiling. The app will never show anything above it — and
            you can raise or lower it together anytime.
          </p>

          <div className="mt-6 space-y-3">
            {(Object.keys(SPICE_META) as unknown as SpiceLevel[])
              .map(Number)
              .map((lvl) => {
                const m = SPICE_META[lvl as SpiceLevel]
                const selected = comfort === lvl
                return (
                  <button
                    key={lvl}
                    onClick={() => setComfort(lvl as SpiceLevel)}
                    className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition ${
                      selected
                        ? 'border-ember-400 bg-ember-500/15'
                        : 'border-white/10 bg-white/5'
                    }`}
                  >
                    <span className="text-2xl">{m.emoji}</span>
                    <span className="flex-1">
                      <span className="block font-semibold text-white">
                        L{lvl} · {m.name}
                      </span>
                      <span className="block text-xs text-plum-200/70">
                        {m.blurb}
                      </span>
                    </span>
                    {selected && <span className="text-ember-400">✓</span>}
                  </button>
                )
              })}
          </div>

          <div className="mt-auto flex gap-3 pt-8">
            <Button variant="soft" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button className="flex-1" onClick={() => setStep(3)}>
              Continue
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="animate-float-in flex flex-1 flex-col">
          <h2 className="text-2xl font-bold text-white">Your safe word</h2>
          <p className="mt-1 text-sm text-plum-200/80">
            Either of you can say this anytime to pause everything, no questions
            asked. It's the foundation that makes exploring feel safe.
          </p>
          <input
            value={safeWord}
            onChange={(e) => setSafeWord(e.target.value)}
            placeholder="e.g. pineapple"
            className="mt-6 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-lg text-white placeholder:text-plum-300/50 focus:border-ember-400 focus:outline-none"
          />
          <p className="mt-3 text-xs text-plum-300/60">
            Pick something you'd never normally say in the moment.
          </p>

          <div className="mt-auto flex gap-3 pt-8">
            <Button variant="soft" onClick={() => setStep(2)}>
              Back
            </Button>
            <Button className="flex-1" onClick={finish}>
              Enter Kindle 🔥
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
