import { parseDate, toISODate, todayISO } from './cycle'

// Pure "together since" math: how long you've been together, and when the next
// anniversary lands.

export interface TogetherInfo {
  years: number
  months: number
  days: number
  totalDays: number
  nextAnniversary: string // 'YYYY-MM-DD'
  daysUntilNext: number
}

export function togetherInfo(anniversary: string, now = new Date()): TogetherInfo {
  const start = parseDate(anniversary)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const totalDays = Math.max(
    0,
    Math.round((today.getTime() - start.getTime()) / 86_400_000),
  )

  // Calendar-accurate years/months/days elapsed since the start date.
  let years = today.getFullYear() - start.getFullYear()
  let months = today.getMonth() - start.getMonth()
  let days = today.getDate() - start.getDate()
  if (days < 0) {
    months -= 1
    const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0)
    days += prevMonth.getDate()
  }
  if (months < 0) {
    years -= 1
    months += 12
  }

  // Next anniversary: same month/day, in the current year or next.
  let next = new Date(today.getFullYear(), start.getMonth(), start.getDate())
  if (next.getTime() < today.getTime()) {
    next = new Date(today.getFullYear() + 1, start.getMonth(), start.getDate())
  }
  const daysUntilNext = Math.round((next.getTime() - today.getTime()) / 86_400_000)

  return {
    years,
    months,
    days,
    totalDays,
    nextAnniversary: toISODate(next),
    daysUntilNext,
  }
}

export { todayISO }
