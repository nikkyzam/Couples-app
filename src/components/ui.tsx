import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { SPICE_META, type SpiceLevel } from '../types'

export function Button({
  children,
  variant = 'primary',
  className = '',
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost' | 'soft' | 'danger'
}) {
  const styles: Record<string, string> = {
    primary:
      'bg-gradient-to-br from-ember-500 to-plum-500 text-white shadow-lg shadow-ember-900/30 hover:brightness-110 active:scale-[0.98]',
    soft: 'bg-white/10 text-white hover:bg-white/15 active:scale-[0.98]',
    ghost: 'bg-transparent text-plum-100 hover:bg-white/5',
    danger: 'bg-red-500/20 text-red-200 hover:bg-red-500/30',
  }
  return (
    <button
      className={`rounded-2xl px-5 py-3 font-semibold transition-all disabled:opacity-40 disabled:pointer-events-none ${styles[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}

export function Card({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`card-glass rounded-3xl p-5 ${className}`}>{children}</div>
  )
}

export function LevelBadge({ level }: { level: SpiceLevel }) {
  const m = SPICE_META[level]
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold"
      style={{ backgroundColor: `${m.accent}22`, color: m.accent }}
    >
      {m.emoji} L{level} · {m.name}
    </span>
  )
}

export function SectionTitle({
  eyebrow,
  title,
  sub,
}: {
  eyebrow?: string
  title: string
  sub?: string
}) {
  return (
    <div className="mb-5">
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-widest text-ember-300">
          {eyebrow}
        </p>
      )}
      <h1 className="font-display text-3xl font-bold text-white">{title}</h1>
      {sub && <p className="mt-1 text-sm text-plum-200/80">{sub}</p>}
    </div>
  )
}

export function EmptyState({
  emoji,
  title,
  sub,
}: {
  emoji: string
  title: string
  sub: string
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-3 text-5xl">{emoji}</div>
      <p className="font-semibold text-white">{title}</p>
      <p className="mt-1 max-w-xs text-sm text-plum-200/70">{sub}</p>
    </div>
  )
}
