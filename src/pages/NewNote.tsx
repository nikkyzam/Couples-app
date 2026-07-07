import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { Button } from '../components/ui'
import type { LoveNote, PartnerId } from '../types'

const MOODS = ['💌', '😘', '🔥', '🥰', '😏', '🌙', '💦', '🫦']

const IDEAS = [
  'Thinking about you right now…',
  'You looked incredible today.',
  "I've got a surprise planned for tonight.",
  'Meet me in the bedroom at 9? 😏',
  'One thing I love about your body is…',
]

export default function NewNote() {
  const { state, dispatch } = useStore()
  const navigate = useNavigate()
  const me = state.activeUser
  const other: PartnerId = me === 'A' ? 'B' : 'A'
  const names = state.profile.accounts

  const [text, setText] = useState('')
  const [mood, setMood] = useState('💌')

  function send() {
    if (!text.trim()) return
    const note: LoveNote = {
      id: crypto.randomUUID(),
      from: me,
      to: other,
      text: text.trim(),
      mood,
      createdAt: Date.now(),
      read: false,
    }
    dispatch({ type: 'SEND_NOTE', note })
    navigate('/notes')
  }

  return (
    <div className="flex min-h-[70vh] flex-col">
      <button onClick={() => navigate('/notes')} className="mb-2 text-sm text-plum-300">
        ← Notes
      </button>
      <h1 className="text-2xl font-bold text-white">
        A note for {names[other].emoji} {names[other].name || 'your partner'}
      </h1>

      <div className="mt-5">
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
          {MOODS.map((m) => (
            <button
              key={m}
              onClick={() => setMood(m)}
              className={`grid h-11 w-11 shrink-0 place-items-center rounded-full text-xl transition ${
                mood === m ? 'bg-ember-500/40 ring-2 ring-ember-400' : 'bg-white/5'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Say something sweet, flirty, or bold…"
        rows={5}
        maxLength={500}
        className="mt-4 w-full resize-none rounded-3xl border border-white/10 bg-white/5 p-4 text-white placeholder:text-plum-300/50 focus:border-ember-400 focus:outline-none"
      />

      <div className="mt-3 flex flex-wrap gap-2">
        {IDEAS.map((idea) => (
          <button
            key={idea}
            onClick={() => setText(idea)}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-plum-100"
          >
            {idea}
          </button>
        ))}
      </div>

      <div className="mt-auto pt-6">
        <Button className="w-full" onClick={send} disabled={!text.trim()}>
          Send to {names[other].name || 'partner'} 💌
        </Button>
        <p className="mt-2 text-center text-xs text-plum-300/50">
          It'll be waiting in their inbox when they switch to their profile.
        </p>
      </div>
    </div>
  )
}
