import type { CyclePlan } from '../types'

// Pure period-cycle math. Everything the Planner shows about the cycle is derived
// here from the three saved numbers. These are estimates for awareness and
// planning only — explicitly NOT a method of contraception.

const DAY = 86_400_000

export function parseDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function toISODate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function todayISO(): string {
  return toISODate(new Date())
}

function midnight(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function addDays(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
}

export type CyclePhase = 'period' | 'follicular' | 'fertile' | 'luteal'

export interface CycleInfo {
  cycleDay: number // 1-based day within the current cycle
  phase: CyclePhase
  onPeriodNow: boolean
  nextPeriodDate: string
  daysUntilNextPeriod: number
  fertileStart: string
  fertileEnd: string
  inFertileWindow: boolean
}

export function cycleInfo(cycle: CyclePlan, now = new Date()): CycleInfo {
  const len = Math.max(15, Math.min(60, Math.round(cycle.cycleLength) || 28))
  const period = Math.max(1, Math.min(len - 1, Math.round(cycle.periodLength) || 5))
  const today = midnight(now)
  const start = midnight(parseDate(cycle.lastStart))

  const daysSince = Math.round((today.getTime() - start.getTime()) / DAY)
  // Position within the current cycle, 0-based, always in [0, len).
  const pos = ((daysSince % len) + len) % len

  const cycleStart = addDays(today, -pos)
  const nextPeriod = addDays(cycleStart, len)
  const daysUntilNextPeriod = Math.round((nextPeriod.getTime() - today.getTime()) / DAY)

  // Ovulation ≈ 14 days before the next period; fertile window ≈ 5 days before to
  // 1 day after ovulation. Clamped so it can't run off the ends of the cycle.
  const ovulation = Math.max(0, len - 14)
  const fStart = Math.max(0, ovulation - 5)
  const fEnd = Math.min(len - 1, ovulation + 1)

  const onPeriodNow = pos < period
  const inFertileWindow = !onPeriodNow && pos >= fStart && pos <= fEnd

  let phase: CyclePhase
  if (onPeriodNow) phase = 'period'
  else if (inFertileWindow) phase = 'fertile'
  else if (pos < fStart) phase = 'follicular'
  else phase = 'luteal'

  return {
    cycleDay: pos + 1,
    phase,
    onPeriodNow,
    nextPeriodDate: toISODate(nextPeriod),
    daysUntilNextPeriod,
    fertileStart: toISODate(addDays(cycleStart, fStart)),
    fertileEnd: toISODate(addDays(cycleStart, fEnd)),
    inFertileWindow,
  }
}

export const PHASE_META: Record<CyclePhase, { label: string; emoji: string; blurb: string }> = {
  period: { label: 'Period', emoji: '🩸', blurb: 'Be extra tender — comfort over everything.' },
  follicular: { label: 'Rising', emoji: '🌱', blurb: 'Energy climbing. A lovely time to plan a date.' },
  fertile: { label: 'Fertile window', emoji: '🔥', blurb: 'Highest fertility (estimate). Plan accordingly.' },
  luteal: { label: 'Winding down', emoji: '🌙', blurb: 'Cozy, slower energy as the next period nears.' },
}

// "Mon Jul 14" style short label for a YYYY-MM-DD string.
export function prettyDate(iso: string): string {
  return parseDate(iso).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}
