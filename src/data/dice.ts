import type { SpiceLevel } from '../types'

// Love Dice — three reels that roll and combine into one playful instruction:
//   [action]  +  [where]  +  [how]
//   "Kiss     their neck,   slowly."
//
// Every reel is tagged by spice level and filtered against the couple's unlocked
// ceiling, so the dice can never land on something bolder than they've opted into.
// Lower levels are sweet and completely safe; it only gets daring near the top.

export interface DiceFace {
  text: string
  level: SpiceLevel
}

// What to do.
export const ACTIONS: DiceFace[] = [
  { level: 1, text: 'Kiss' },
  { level: 1, text: 'Hold' },
  { level: 1, text: 'Nuzzle' },
  { level: 1, text: 'Give a slow back-rub to' },
  { level: 2, text: 'Tease' },
  { level: 2, text: 'Trace a fingertip along' },
  { level: 2, text: 'Plant slow kisses on' },
  { level: 2, text: 'Whisper something naughty against' },
  { level: 3, text: 'Massage' },
  { level: 3, text: 'Kiss deeply along' },
  { level: 3, text: 'Run your hands over' },
  { level: 3, text: 'Breathe softly on' },
  { level: 4, text: 'Lick' },
  { level: 4, text: 'Gently bite' },
  { level: 4, text: 'Tease with your tongue' },
  { level: 4, text: 'Grip' },
  { level: 5, text: 'Worship' },
  { level: 5, text: 'Have your way with' },
  { level: 5, text: 'Tease relentlessly' },
]

// Where.
export const SPOTS: DiceFace[] = [
  { level: 1, text: 'their hand' },
  { level: 1, text: 'their cheek' },
  { level: 1, text: 'the back of their neck' },
  { level: 1, text: 'their shoulder' },
  { level: 2, text: 'their neck' },
  { level: 2, text: 'their ear' },
  { level: 2, text: 'their collarbone' },
  { level: 2, text: 'their lower back' },
  { level: 3, text: 'their jaw' },
  { level: 3, text: 'their stomach' },
  { level: 3, text: 'the inside of their arm' },
  { level: 3, text: 'their chest' },
  { level: 4, text: 'their inner thigh' },
  { level: 4, text: 'their hips' },
  { level: 4, text: 'their earlobe' },
  { level: 4, text: 'wherever they’re most sensitive' },
  { level: 5, text: 'their most sensitive spot' },
  { level: 5, text: 'anywhere you want' },
  { level: 5, text: 'the spot they just named' },
]

// How, or for how long.
export const HOWS: DiceFace[] = [
  { level: 1, text: 'slowly' },
  { level: 1, text: 'with a smile' },
  { level: 1, text: 'three times' },
  { level: 1, text: 'for ten seconds' },
  { level: 2, text: 'teasingly' },
  { level: 2, text: 'for thirty seconds' },
  { level: 2, text: 'until they smile' },
  { level: 2, text: 'without any warning' },
  { level: 3, text: 'for a whole minute' },
  { level: 3, text: 'until they sigh' },
  { level: 3, text: 'with your eyes closed' },
  { level: 3, text: 'agonizingly slowly' },
  { level: 4, text: 'until they’re squirming' },
  { level: 4, text: 'until they beg you to move on' },
  { level: 4, text: 'blindfold optional' },
  { level: 4, text: 'while they try to stay quiet' },
  { level: 5, text: 'until they can’t take it' },
  { level: 5, text: 'until they moan your name' },
  { level: 5, text: 'and don’t stop till they say so' },
]
