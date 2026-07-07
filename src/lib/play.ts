import type { Prompt, SpiceLevel } from '../types'

// Only surface content at or below what the couple has unlocked.
export function availablePrompts(pool: Prompt[], unlocked: SpiceLevel): Prompt[] {
  return pool.filter((p) => p.level <= unlocked)
}

export function pickRandom<T>(items: T[], avoidId?: string): T | undefined {
  if (items.length === 0) return undefined
  if (items.length === 1) return items[0]
  let choice = items[Math.floor(Math.random() * items.length)]
  // Best-effort: avoid repeating the same card twice in a row.
  let guard = 0
  while (
    avoidId &&
    (choice as { id?: string }).id === avoidId &&
    guard < 10
  ) {
    choice = items[Math.floor(Math.random() * items.length)]
    guard++
  }
  return choice
}
