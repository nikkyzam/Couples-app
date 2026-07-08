// Spice levels drive the whole progression. A reserved couple starts at 1 and
// unlocks higher levels only as they play together and explicitly opt in.
export type SpiceLevel = 1 | 2 | 3 | 4 | 5

export const SPICE_META: Record<
  SpiceLevel,
  { name: string; emoji: string; blurb: string; accent: string }
> = {
  1: {
    name: 'Cozy',
    emoji: '🫶',
    blurb: 'Sweet, low-pressure connection. Nothing but smiles.',
    accent: '#b085cd',
  },
  2: {
    name: 'Flirty',
    emoji: '😊',
    blurb: 'Playful teasing and warm compliments.',
    accent: '#965cb8',
  },
  3: {
    name: 'Warm',
    emoji: '🔥',
    blurb: 'Turning up the heat with sensual touch.',
    accent: '#f83a63',
  },
  4: {
    name: 'Spicy',
    emoji: '🌶️',
    blurb: 'Bolder desires, toys, and new ideas.',
    accent: '#e51950',
  },
  5: {
    name: 'Adventurous',
    emoji: '💥',
    blurb: 'Wild, uninhibited, anything-goes (within your yeses).',
    accent: '#c10d41',
  },
}

export type Category = 'connection' | 'flirt' | 'touch' | 'toys' | 'adventure'

// Truth-or-Dare / Would-You-Rather / card prompts all share this shape.
export interface Prompt {
  id: string
  level: SpiceLevel
  category: Category
  text: string
  // For "would you rather" — the second option.
  altText?: string
}

export interface Toy {
  id: string
  name: string
  emoji: string
  tagline: string
  level: SpiceLevel
  goodFor: string
  howTo: string
  tips: string[]
  beginnerFriendly: boolean
}

// A single item in the Yes / No / Maybe discovery list.
export interface DesireItem {
  id: string
  label: string
  level: SpiceLevel
  category: Category
  toyId?: string // links a desire to a toy, so mutual yeses can suggest a purchase
}

export type Vote = 'yes' | 'maybe' | 'no' | null

export type PartnerId = 'A' | 'B'

export interface Account {
  name: string
  emoji: string // avatar
  pin: string // optional 4-digit lock; '' means no lock
}

export interface Profile {
  accounts: Record<PartnerId, Account>
  comfort: SpiceLevel // the ceiling the couple has opted into
  safeWord: string
  onboarded: boolean
}

// A private note one partner writes to the other.
export interface LoveNote {
  id: string
  from: PartnerId
  to: PartnerId
  text: string
  mood: string // an emoji tag
  createdAt: number
  read: boolean
}

// A gift idea in the "Treat Yourselves" shop. Catalog data only (not stored) —
// what a couple saves is just the gift's id in their shared gift list.
export type GiftCategory = 'toy' | 'lingerie' | 'sensory' | 'experience' | 'romance'

export interface Gift {
  id: string
  name: string
  emoji: string
  category: GiftCategory
  blurb: string
  price: 1 | 2 | 3 // rough tier: $ / $$ / $$$
  // What to search for at a retailer when they tap "Shop". Kept as a search
  // (not a hardcoded product URL) so links never rot and no single store is baked in.
  search: string
}

// A shared, planned intimate date on the couple's calendar ("the sex schedule").
export interface DatePlan {
  id: string
  date: string // 'YYYY-MM-DD'
  time?: string // 'HH:MM' (24h), optional
  title: string // the idea / label
  note?: string
  done: boolean
  createdBy?: PartnerId
}

// Optional period tracking for whichever partner menstruates. Everything shown is
// derived from these three numbers (see lib/cycle.ts). Predictions are estimates
// for awareness and planning — never a form of contraception.
export interface CyclePlan {
  lastStart: string // 'YYYY-MM-DD' — first day of the most recent period
  cycleLength: number // average days between periods (typ. 21–35, default 28)
  periodLength: number // days the period lasts (typ. 3–7, default 5)
  owner?: PartnerId // whose cycle this is — a label only
}

export interface AppState {
  profile: Profile
  activeUser: PartnerId // who is currently holding the phone
  // How many prompts the couple has completed — drives level unlocking.
  playCount: number
  unlockedLevel: SpiceLevel
  // Yes/No/Maybe results keyed by DesireItem id, per partner.
  desiresA: Record<string, Vote>
  desiresB: Record<string, Vote>
  favorites: string[] // favorited prompt ids
  ownedToys: string[] // Toy ids the couple actually has ("our toy box")
  wishlist: string[] // Toy ids the couple wants to buy
  notes: LoveNote[]
  plans: DatePlan[] // shared sex / date schedule
  cycle: CyclePlan | null // optional period tracking (null until set up)
  giftList: string[] // Gift ids the couple wants to treat themselves to
}
