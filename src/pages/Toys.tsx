import { useState } from 'react'
import { useStore } from '../store'
import { TOYS } from '../data/toys'
import { SPICE_META, type Toy } from '../types'
import { SectionTitle, LevelBadge, Button } from '../components/ui'

export default function Toys() {
  const { state } = useStore()
  const [open, setOpen] = useState<Toy | null>(null)
  const toys = TOYS.filter((t) => t.level <= state.unlockedLevel)
  const locked = TOYS.filter((t) => t.level > state.unlockedLevel)

  return (
    <div>
      <SectionTitle
        eyebrow="No pressure, just curiosity"
        title="Toy Explorer"
        sub="Friendly intros to toys and props — always body-safe, always your choice."
      />

      <div className="grid grid-cols-2 gap-3">
        {toys.map((t) => (
          <button
            key={t.id}
            onClick={() => setOpen(t)}
            className="card-glass animate-float-in flex flex-col rounded-3xl p-4 text-left transition hover:bg-white/10 active:scale-[0.98]"
          >
            <span className="text-4xl">{t.emoji}</span>
            <span className="mt-2 font-semibold text-white">{t.name}</span>
            <span className="mt-0.5 text-xs text-plum-200/70">{t.tagline}</span>
            <span className="mt-2">
              {t.beginnerFriendly && (
                <span className="rounded-full bg-green-400/15 px-2 py-0.5 text-[10px] font-semibold text-green-300">
                  beginner-friendly
                </span>
              )}
            </span>
          </button>
        ))}
      </div>

      {locked.length > 0 && (
        <div className="mt-6">
          <h3 className="mb-2 px-1 text-xs font-semibold uppercase tracking-widest text-plum-300/60">
            Unlocks as you level up
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {locked.map((t) => (
              <div
                key={t.id}
                className="flex flex-col items-start rounded-3xl border border-white/5 bg-white/[0.02] p-4 opacity-60"
              >
                <span className="text-4xl grayscale">🔒</span>
                <span className="mt-2 font-semibold text-plum-200">Level {t.level}</span>
                <span className="text-xs text-plum-300/60">
                  Reach {SPICE_META[t.level].name} to explore this
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detail sheet */}
      {open && (
        <div
          className="fixed inset-0 z-40 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setOpen(null)}
        >
          <div
            className="animate-float-in w-full max-w-md rounded-3xl border border-white/10 bg-plum-900 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-5xl">{open.emoji}</span>
                <h2 className="mt-2 text-2xl font-bold text-white">{open.name}</h2>
                <p className="text-sm text-plum-200/80">{open.tagline}</p>
              </div>
              <LevelBadge level={open.level} />
            </div>

            <div className="mt-5 space-y-4 text-sm">
              <div>
                <p className="font-semibold text-ember-300">Great for</p>
                <p className="text-plum-100">{open.goodFor}</p>
              </div>
              <div>
                <p className="font-semibold text-ember-300">How to start</p>
                <p className="text-plum-100">{open.howTo}</p>
              </div>
              <div>
                <p className="font-semibold text-ember-300">Tips</p>
                <ul className="mt-1 space-y-1">
                  {open.tips.map((tip, i) => (
                    <li key={i} className="flex gap-2 text-plum-100">
                      <span className="text-ember-400">•</span> {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <Button className="mt-6 w-full" onClick={() => setOpen(null)}>
              Got it
            </Button>
          </div>
        </div>
      )}

      <p className="mt-6 px-2 text-center text-xs text-plum-300/50">
        Educational guidance only. Use body-safe materials and a compatible
        lubricant, and stop anytime either of you wants to.
      </p>
    </div>
  )
}
