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
  notes: LoveNote[]
}
