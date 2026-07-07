import { useState } from 'react'
import { useStore } from '../store'

// A persistent, calming reminder that either partner can stop at any time.
export default function SafeWordBar() {
  const { state } = useStore()
  const [paused, setPaused] = useState(false)

  if (paused) {
    return (
      <div className="rounded-3xl border border-plum-400/30 bg-plum-500/15 p-5 text-center">
        <p className="text-2xl">🫶</p>
        <p className="mt-1 font-semibold text-white">Paused. Take all the time you need.</p>
        <p className="mt-1 text-sm text-plum-200/80">
          Check in with each other. Continue only when you both want to.
        </p>
        <button
          onClick={() => setPaused(false)}
          className="mt-3 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white"
        >
          We're good — resume
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setPaused(true)}
      className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-3 text-sm text-plum-200/80 active:scale-[0.99]"
    >
      <span>🛟</span>
      Safe word: <span className="font-semibold text-white">{state.profile.safeWord}</span>
      <span className="text-plum-300">· tap to pause</span>
    </button>
  )
}
