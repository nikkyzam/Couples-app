import { useState } from 'react'
import { useStore } from '../store'
import { DESIRES } from '../data/desires'
import { SPICE_META, type Vote } from '../types'
import { SectionTitle, Card } from '../components/ui'

const VOTES: { v: Exclude<Vote, null>; label: string; emoji: string; color: string }[] = [
  { v: 'yes', label: 'Yes', emoji: '💚', color: '#4ade80' },
  { v: 'maybe', label: 'Maybe', emoji: '💛', color: '#facc15' },
  { v: 'no', label: 'No', emoji: '🚫', color: '#f87171' },
]

export default function Desires() {
  const { state, dispatch } = useStore()
  const [showMatches, setShowMatches] = useState(false)
  const me = state.activeUser
  const myVotes = me === 'A' ? state.desiresA : state.desiresB
  const items = DESIRES.filter((d) => d.level <= state.unlockedLevel)

  // A match = both said yes. A "maybe worth exploring" = neither said no and at
  // least one said yes. We never reveal an individual "no".
  const matches = DESIRES.filter((d) => {
    const a = state.desiresA[d.id]
    const b = state.desiresB[d.id]
    return a === 'yes' && b === 'yes'
  })
  const explore = DESIRES.filter((d) => {
    const a = state.desiresA[d.id]
    const b = state.desiresB[d.id]
    if (a === 'no' || b === 'no') return false
    const votes = [a, b].filter(Boolean)
    return votes.length > 0 && !(a === 'yes' && b === 'yes')
  })

  return (
    <div>
      <SectionTitle
        eyebrow="Discover together"
        title="Yes / No / Maybe"
        sub="Vote privately. Your partner never sees your no's — only the ideas you both said yes to are revealed."
      />

      <div className="mb-5 flex items-center gap-2 rounded-2xl bg-white/5 p-1 text-sm">
        <button
          onClick={() => setShowMatches(false)}
          className={`flex-1 rounded-xl py-2 font-semibold transition ${
            !showMatches ? 'bg-white/10 text-white' : 'text-plum-300'
          }`}
        >
          {state.profile.accounts[me].emoji} {state.profile.accounts[me].name || 'Your'} list
        </button>
        <button
          onClick={() => setShowMatches(true)}
          className={`flex-1 rounded-xl py-2 font-semibold transition ${
            showMatches ? 'bg-white/10 text-white' : 'text-plum-300'
          }`}
        >
          💞 Our matches
        </button>
      </div>

      {!showMatches ? (
        <div className="space-y-3">
          {items.map((item) => {
            const mine = myVotes[item.id] ?? null
            return (
              <Card key={item.id} className="!p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-white">{item.label}</span>
                  <span className="text-lg">{SPICE_META[item.level].emoji}</span>
                </div>
                <div className="mt-3 flex gap-2">
                  {VOTES.map((opt) => {
                    const active = mine === opt.v
                    return (
                      <button
                        key={opt.v}
                        onClick={() =>
                          dispatch({
                            type: 'VOTE_DESIRE',
                            user: me,
                            itemId: item.id,
                            vote: active ? null : opt.v,
                          })
                        }
                        className="flex-1 rounded-xl border py-2 text-sm font-semibold transition"
                        style={{
                          borderColor: active ? opt.color : 'rgba(255,255,255,0.1)',
                          backgroundColor: active ? `${opt.color}22` : 'transparent',
                          color: active ? opt.color : '#cbb9dd',
                        }}
                      >
                        {opt.emoji} {opt.label}
                      </button>
                    )
                  })}
                </div>
              </Card>
            )
          })}
          <p className="px-1 pt-2 text-center text-xs text-plum-300/60">
            Tip: hand the phone to your partner and use the switch button up top so
            you each vote on your own.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          <div>
            <h3 className="mb-2 flex items-center gap-2 font-semibold text-white">
              💚 You both said yes
            </h3>
            {matches.length === 0 ? (
              <Card className="text-sm text-plum-200/70">
                No mutual yeses yet. Once you've both voted, your shared green
                lights show up here.
              </Card>
            ) : (
              <div className="space-y-2">
                {matches.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center gap-2 rounded-2xl border border-green-400/30 bg-green-400/10 p-3"
                  >
                    <span>💚</span>
                    <span className="text-white">{m.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="mb-2 flex items-center gap-2 font-semibold text-white">
              💛 Worth talking about
            </h3>
            {explore.length === 0 ? (
              <Card className="text-sm text-plum-200/70">
                Nothing here yet — this is where "maybe" overlaps land.
              </Card>
            ) : (
              <div className="space-y-2">
                {explore.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center gap-2 rounded-2xl border border-yellow-400/20 bg-yellow-400/5 p-3"
                  >
                    <span>💛</span>
                    <span className="text-plum-50">{m.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
