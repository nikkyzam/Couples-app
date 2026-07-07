import type { SpiceLevel } from '../types'

// "Whisper" — a gentle dirty-talk coach built for the hesitant partner.
//
// The whole point is to take someone who freezes up and ease them in one small,
// winnable step at a time. So the ladder starts at plain warm words (Level 1)
// and only turns genuinely bold near the top — and it never rises above the
// comfort ceiling the couple chose. Every line can be *whispered*, *heard first*,
// or *sent as a note* instead of said out loud, so nobody is ever put on the spot.

export interface WhisperLine {
  id: string
  level: SpiceLevel
  text: string
  // A softer way to say the same thing — offered to anyone who taps "too shy".
  // Lets a nervous partner dial a line down without leaving the moment.
  softer?: string
}

// Fill-in-the-blank openers. Scaffolding beats a blank page: a hesitant person
// finds it far easier to *finish* a sentence than to invent one. They pick a
// starter, drop in something true about their partner, and suddenly they're
// talking. These stay gentle on purpose — confidence first.
export const WHISPER_OPENERS: { id: string; level: SpiceLevel; stem: string }[] = [
  { id: 'o1', level: 1, stem: 'One thing I can’t stop thinking about is…' },
  { id: 'o2', level: 1, stem: 'Right now I really want to…' },
  { id: 'o3', level: 2, stem: 'You looked so good today when you…' },
  { id: 'o4', level: 2, stem: 'It drives me a little crazy when you…' },
  { id: 'o5', level: 3, stem: 'I love the way it feels when you…' },
  { id: 'o6', level: 3, stem: 'Tonight I want you to…' },
  { id: 'o7', level: 4, stem: 'I’ve been imagining you…' },
  { id: 'o8', level: 4, stem: 'I want you to touch me right where I…' },
  { id: 'o9', level: 5, stem: 'Don’t stop until I…' },
]

// The lines themselves. Written to be said to a partner. Lower levels build the
// muscle with warmth and play; higher levels get bolder — but stay evocative and
// tasteful rather than crude, which is exactly what a shy person can actually get
// their mouth around.
export const WHISPER_LINES: WhisperLine[] = [
  // ── Level 1 · Cozy — just get comfortable saying warm things out loud ──
  { id: 'w1', level: 1, text: 'I love being close to you like this.' },
  { id: 'w2', level: 1, text: 'You make me feel so wanted.' },
  { id: 'w3', level: 1, text: 'Come here — I just want you nearer.' },
  { id: 'w4', level: 1, text: 'Being next to you is my favorite place to be.' },
  { id: 'w5', level: 1, text: 'I could stay tangled up with you all night.' },
  { id: 'w6', level: 1, text: 'You feel so good to hold.' },

  // ── Level 2 · Flirty — a little tease, still easy to say with a smile ──
  { id: 'w7', level: 2, text: 'You looked so good today I couldn’t keep my eyes off you.',
    softer: 'You looked really good today.' },
  { id: 'w8', level: 2, text: 'Keep looking at me like that and I won’t behave.',
    softer: 'I love the way you’re looking at me.' },
  { id: 'w9', level: 2, text: 'I’ve been thinking about you all day — and not innocently.',
    softer: 'I’ve been thinking about you all day.' },
  { id: 'w10', level: 2, text: 'Come closer. I want to whisper something to you.' },
  { id: 'w11', level: 2, text: 'You have no idea what that smile does to me.' },
  { id: 'w12', level: 2, text: 'I dare you to kiss me the way you really want to.' },

  // ── Level 3 · Warm — sensual, naming what you want touched ──
  { id: 'w13', level: 3, text: 'I love the way your hands feel on my skin.' },
  { id: 'w14', level: 3, text: 'Kiss me slower… just like that.' },
  { id: 'w15', level: 3, text: 'Don’t stop — right there feels incredible.' },
  { id: 'w16', level: 3, text: 'I want to feel your weight against me.',
    softer: 'I want you closer than this.' },
  { id: 'w17', level: 3, text: 'Tell me where you want my hands.' },
  { id: 'w18', level: 3, text: 'You’re making it very hard to be patient right now.' },

  // ── Level 4 · Spicy — bolder, more direct desire ──
  { id: 'w19', level: 4, text: 'I’ve been imagining this all day and you’re even better.',
    softer: 'I’ve been looking forward to this all day.' },
  { id: 'w20', level: 4, text: 'Tell me exactly what you want and I’ll give it to you.' },
  { id: 'w21', level: 4, text: 'I love how you sound when you can’t hold back.',
    softer: 'I love the sounds you make.' },
  { id: 'w22', level: 4, text: 'You’re going to have to beg me a little for that.' },
  { id: 'w23', level: 4, text: 'I want you so much it’s almost embarrassing.' },
  { id: 'w24', level: 4, text: 'Show me what you like — put my hand right where you want it.' },

  // ── Level 5 · Adventurous — the boldest, still yours to pass on ──
  { id: 'w25', level: 5, text: 'You’re mine tonight, and I’m not letting you go easy.',
    softer: 'You’re all mine tonight.' },
  { id: 'w26', level: 5, text: 'Don’t stop until I tell you to.' },
  { id: 'w27', level: 5, text: 'I want to hear you say exactly what you need from me.' },
  { id: 'w28', level: 5, text: 'Do that again — and this time don’t hold anything back.' },
  { id: 'w29', level: 5, text: 'Tell me your filthiest thought. I want all of it.',
    softer: 'Tell me something you’ve never said out loud.' },
  { id: 'w30', level: 5, text: 'I’m going to take my time with you until you’re begging.' },
]
