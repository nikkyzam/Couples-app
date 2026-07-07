import { Link } from 'react-router-dom'
import { useStore } from '../store'
import { SPICE_META } from '../types'
import { Card, LevelBadge } from '../components/ui'

const QUICK = [
  { to: '/games/dare', label: 'Truth or Dare', emoji: '🎯', sub: 'Take turns, no pressure' },
  { to: '/games/wyr', label: 'Would You Rather', emoji: '⚖️', sub: 'Discover what you both like' },
  { to: '/games/deck', label: 'Desire Deck', emoji: '🃏', sub: 'Draw a surprise card' },
  { to: '/desires', label: 'Yes / No / Maybe', emoji: '💭', sub: 'Find your overlap privately' },
]

export default function Home() {
  const { state } = useStore()
  const { profile, unlockedLevel, playCount, activeUser } = state
  const meIsA = activeUser === 'A'
  const meName = profile.accounts[activeUser].name || 'you'

  const toNext = 5 - (playCount % 5)
  const atCeiling = unlockedLevel >= profile.comfort
  const meta = SPICE_META[unlockedLevel]

  const latestNote = state.notes
    .filter((n) => n.to === activeUser)
    .sort((a, b) => b.createdAt - a.createdAt)[0]

  return (
    <div className="space-y-6">
      <div className="animate-float-in pt-2">
        <p className="text-sm text-plum-200/70">Welcome back,</p>
        <h1 className="text-3xl font-bold text-white">{meName} {profile.accounts[activeUser].emoji}</h1>
      </div>

      {/* Level card */}
      <Card className="animate-float-in relative overflow-hidden">
        <div
          className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full blur-2xl"
          style={{ background: meta.accent, opacity: 0.35 }}
        />
        <div className="flex items-center justify-between">
          <LevelBadge level={unlockedLevel} />
          <span className="text-4xl">{meta.emoji}</span>
        </div>
        <p className="mt-3 text-lg font-semibold text-white">{meta.name} mode</p>
        <p className="text-sm text-plum-200/80">{meta.blurb}</p>

        <div className="mt-4">
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-ember-400 to-plum-400 transition-all"
              style={{ width: `${((playCount % 5) / 5) * 100}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-plum-200/70">
            {atCeiling
              ? `You're at your chosen comfort ceiling (L${profile.comfort}). Raise it together in Settings whenever you're ready.`
              : `Play ${toNext} more together to unlock Level ${unlockedLevel + 1}.`}
          </p>
        </div>
      </Card>

      {/* Latest note */}
      {latestNote && (
        <Link to="/notes" className="block">
          <Card className="animate-float-in flex items-center gap-3 !py-4">
            <span className="text-2xl">{latestNote.mood || '💌'}</span>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-ember-300">
                A note from {profile.accounts[meIsA ? 'B' : 'A'].name || 'your partner'}
              </p>
              <p className="truncate text-sm text-white">{latestNote.text}</p>
            </div>
            {!latestNote.read && (
              <span className="h-2 w-2 rounded-full bg-ember-500" />
            )}
          </Card>
        </Link>
      )}

      {/* Quick play */}
      <div>
        <h2 className="mb-3 px-1 text-sm font-semibold uppercase tracking-widest text-plum-300/70">
          Tonight's play
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {QUICK.map((q) => (
            <Link
              key={q.to}
              to={q.to}
              className="card-glass animate-float-in flex flex-col gap-1 rounded-3xl p-4 transition hover:bg-white/10 active:scale-[0.98]"
            >
              <span className="text-3xl">{q.emoji}</span>
              <span className="mt-1 font-semibold text-white">{q.label}</span>
              <span className="text-xs text-plum-200/70">{q.sub}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Send a note CTA */}
      <Link to="/notes/new" className="block">
        <Card className="animate-float-in flex items-center justify-between !py-4 hover:bg-white/10">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💌</span>
            <span className="font-semibold text-white">
              Leave a note for your partner
            </span>
          </div>
          <span className="text-plum-300">→</span>
        </Card>
      </Link>
    </div>
  )
}
