import { Link } from 'react-router-dom'
import { useStore } from '../store'
import { SectionTitle, LevelBadge } from '../components/ui'

const GAMES = [
  {
    to: '/games/dare',
    label: 'Truth or Dare',
    emoji: '🎯',
    desc: 'The classic, reimagined for two. Pick truth to open up, or dare to play.',
  },
  {
    to: '/games/wyr',
    label: 'Would You Rather',
    emoji: '⚖️',
    desc: 'Two tempting options. Say your pick out loud and see if you match.',
  },
  {
    to: '/games/deck',
    label: 'Desire Deck',
    emoji: '🃏',
    desc: 'Draw a random card from the whole deck. Let fate set the mood.',
  },
  {
    to: '/desires',
    label: 'Yes / No / Maybe',
    emoji: '💭',
    desc: 'Vote privately on ideas. Only your matching yeses are ever revealed.',
  },
]

export default function Games() {
  const { state } = useStore()
  return (
    <div>
      <div className="flex items-start justify-between">
        <SectionTitle
          eyebrow="Play together"
          title="Games"
          sub="Take turns. You can always pass or use your safe word."
        />
        <LevelBadge level={state.unlockedLevel} />
      </div>

      <div className="space-y-3">
        {GAMES.map((g) => (
          <Link
            key={g.to}
            to={g.to}
            className="card-glass animate-float-in flex items-center gap-4 rounded-3xl p-4 transition hover:bg-white/10 active:scale-[0.99]"
          >
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/5 text-3xl">
              {g.emoji}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-white">{g.label}</p>
              <p className="text-sm text-plum-200/70">{g.desc}</p>
            </div>
            <span className="text-plum-300">→</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
