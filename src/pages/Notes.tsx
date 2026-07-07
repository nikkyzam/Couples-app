import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../store'
import { SectionTitle, EmptyState } from '../components/ui'
import type { PartnerId } from '../types'

function timeAgo(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

export default function Notes() {
  const { state, dispatch } = useStore()
  const me = state.activeUser
  const other: PartnerId = me === 'A' ? 'B' : 'A'
  const names = state.profile.accounts

  const inbox = state.notes
    .filter((n) => n.to === me)
    .sort((a, b) => b.createdAt - a.createdAt)
  const sent = state.notes
    .filter((n) => n.from === me)
    .sort((a, b) => b.createdAt - a.createdAt)

  // Mark inbox as read when viewing.
  useEffect(() => {
    inbox.filter((n) => !n.read).forEach((n) => dispatch({ type: 'MARK_NOTE_READ', id: n.id }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me])

  return (
    <div>
      <div className="flex items-start justify-between">
        <SectionTitle
          eyebrow="Just between you two"
          title="Love Notes"
          sub={`Leave sweet, flirty, or bold little messages for ${names[other].name || 'your partner'}.`}
        />
      </div>

      <Link
        to="/notes/new"
        className="mb-6 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-ember-500 to-plum-500 py-3 font-semibold text-white shadow-lg active:scale-[0.98]"
      >
        ✍️ Write a new note
      </Link>

      {inbox.length === 0 && sent.length === 0 ? (
        <EmptyState
          emoji="💌"
          title="No notes yet"
          sub="Be the first to leave a little something. A compliment, a tease, a plan for tonight…"
        />
      ) : (
        <div className="space-y-6">
          {inbox.length > 0 && (
            <div>
              <h3 className="mb-2 px-1 text-xs font-semibold uppercase tracking-widest text-plum-300/70">
                For you
              </h3>
              <div className="space-y-3">
                {inbox.map((n) => (
                  <div key={n.id} className="card-glass rounded-3xl p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-ember-300">
                        {n.mood} from {names[n.from].name || 'your partner'}
                      </span>
                      <span className="text-xs text-plum-300/60">{timeAgo(n.createdAt)}</span>
                    </div>
                    <p className="mt-2 text-white">{n.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {sent.length > 0 && (
            <div>
              <h3 className="mb-2 px-1 text-xs font-semibold uppercase tracking-widest text-plum-300/70">
                Sent
              </h3>
              <div className="space-y-3">
                {sent.map((n) => (
                  <div
                    key={n.id}
                    className="rounded-3xl border border-white/5 bg-white/[0.03] p-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-plum-300/70">
                        {n.mood} to {names[n.to].name || 'your partner'}
                      </span>
                      <span className="text-xs text-plum-300/50">
                        {n.read ? 'read' : 'delivered'} · {timeAgo(n.createdAt)}
                      </span>
                    </div>
                    <p className="mt-2 text-plum-100">{n.text}</p>
                    <button
                      onClick={() => dispatch({ type: 'DELETE_NOTE', id: n.id })}
                      className="mt-2 text-xs text-plum-300/50"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
