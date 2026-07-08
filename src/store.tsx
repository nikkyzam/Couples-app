import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from 'react'
import type {
  AppState,
  CyclePlan,
  DatePlan,
  JournalEntry,
  LoveNote,
  PartnerId,
  SpiceLevel,
  Vote,
} from './types'

const STORAGE_KEY = 'kindle.state.v1'

export const initialState: AppState = {
  profile: {
    accounts: {
      A: { name: '', emoji: '💜', pin: '' },
      B: { name: '', emoji: '❤️', pin: '' },
    },
    comfort: 2,
    safeWord: 'pineapple',
    onboarded: false,
  },
  activeUser: 'A',
  playCount: 0,
  unlockedLevel: 1,
  desiresA: {},
  desiresB: {},
  favorites: [],
  ownedToys: [],
  wishlist: [],
  notes: [],
  plans: [],
  cycle: null,
  giftList: [],
  journal: [],
}

// Read persisted state synchronously so the very first render already knows
// whether the couple has onboarded — this avoids a redirect race on deep links.
function loadInitialState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AppState>
      return { ...initialState, ...parsed }
    }
  } catch {
    // ignore corrupt/unavailable storage
  }
  return initialState
}

export type Action =
  | { type: 'COMPLETE_ONBOARDING'; payload: Partial<AppState['profile']> }
  | { type: 'SET_ACTIVE_USER'; user: PartnerId }
  | { type: 'SET_COMFORT'; level: SpiceLevel }
  | { type: 'SET_SAFEWORD'; word: string }
  | { type: 'SET_ANNIVERSARY'; date: string | null }
  | { type: 'RECORD_PLAY' }
  | { type: 'TOGGLE_FAVORITE'; id: string }
  | { type: 'TOGGLE_OWNED_TOY'; id: string }
  | { type: 'TOGGLE_WISHLIST_TOY'; id: string }
  | { type: 'VOTE_DESIRE'; user: PartnerId; itemId: string; vote: Vote }
  | { type: 'SEND_NOTE'; note: LoveNote }
  | { type: 'MARK_NOTE_READ'; id: string }
  | { type: 'DELETE_NOTE'; id: string }
  | { type: 'ADD_PLAN'; plan: DatePlan }
  | { type: 'DELETE_PLAN'; id: string }
  | { type: 'TOGGLE_PLAN_DONE'; id: string }
  | { type: 'SET_CYCLE'; cycle: CyclePlan | null }
  | { type: 'TOGGLE_GIFT'; id: string }
  | { type: 'ADD_JOURNAL_ENTRY'; entry: JournalEntry }
  | { type: 'DELETE_JOURNAL_ENTRY'; id: string }
  | { type: 'REPLACE'; state: AppState }
  | { type: 'RESET' }

// Unlock the next level after every 5 completed prompts, but never above the
// comfort ceiling the couple explicitly opted into.
export function computeUnlock(playCount: number, comfort: SpiceLevel): SpiceLevel {
  const earned = (Math.floor(playCount / 5) + 1) as number
  return Math.min(earned, comfort) as SpiceLevel
}

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'REPLACE':
      return action.state
    case 'COMPLETE_ONBOARDING': {
      const profile = { ...state.profile, ...action.payload, onboarded: true }
      return {
        ...state,
        profile,
        unlockedLevel: computeUnlock(state.playCount, profile.comfort),
      }
    }
    case 'SET_ACTIVE_USER':
      return { ...state, activeUser: action.user }
    case 'SET_COMFORT': {
      const profile = { ...state.profile, comfort: action.level }
      return {
        ...state,
        profile,
        unlockedLevel: computeUnlock(state.playCount, action.level),
      }
    }
    case 'SET_SAFEWORD':
      return { ...state, profile: { ...state.profile, safeWord: action.word } }
    case 'SET_ANNIVERSARY':
      return {
        ...state,
        profile: { ...state.profile, anniversary: action.date ?? undefined },
      }
    case 'RECORD_PLAY': {
      const playCount = state.playCount + 1
      return {
        ...state,
        playCount,
        unlockedLevel: computeUnlock(playCount, state.profile.comfort),
      }
    }
    case 'TOGGLE_FAVORITE': {
      const has = state.favorites.includes(action.id)
      return {
        ...state,
        favorites: has
          ? state.favorites.filter((f) => f !== action.id)
          : [...state.favorites, action.id],
      }
    }
    case 'TOGGLE_OWNED_TOY': {
      const has = state.ownedToys.includes(action.id)
      return {
        ...state,
        ownedToys: has
          ? state.ownedToys.filter((t) => t !== action.id)
          : [...state.ownedToys, action.id],
        // Owning a toy removes it from the wishlist.
        wishlist: has ? state.wishlist : state.wishlist.filter((t) => t !== action.id),
      }
    }
    case 'TOGGLE_WISHLIST_TOY': {
      const has = state.wishlist.includes(action.id)
      return {
        ...state,
        wishlist: has
          ? state.wishlist.filter((t) => t !== action.id)
          : [...state.wishlist, action.id],
      }
    }
    case 'VOTE_DESIRE': {
      const key = action.user === 'A' ? 'desiresA' : 'desiresB'
      return {
        ...state,
        [key]: { ...state[key], [action.itemId]: action.vote },
      }
    }
    case 'SEND_NOTE':
      return { ...state, notes: [action.note, ...state.notes] }
    case 'MARK_NOTE_READ':
      return {
        ...state,
        notes: state.notes.map((n) =>
          n.id === action.id ? { ...n, read: true } : n,
        ),
      }
    case 'DELETE_NOTE':
      return { ...state, notes: state.notes.filter((n) => n.id !== action.id) }
    case 'ADD_PLAN':
      return { ...state, plans: [...state.plans, action.plan] }
    case 'DELETE_PLAN':
      return { ...state, plans: state.plans.filter((p) => p.id !== action.id) }
    case 'TOGGLE_PLAN_DONE':
      return {
        ...state,
        plans: state.plans.map((p) =>
          p.id === action.id ? { ...p, done: !p.done } : p,
        ),
      }
    case 'SET_CYCLE':
      return { ...state, cycle: action.cycle }
    case 'TOGGLE_GIFT': {
      const has = state.giftList.includes(action.id)
      return {
        ...state,
        giftList: has
          ? state.giftList.filter((g) => g !== action.id)
          : [...state.giftList, action.id],
      }
    }
    case 'ADD_JOURNAL_ENTRY':
      return { ...state, journal: [action.entry, ...state.journal] }
    case 'DELETE_JOURNAL_ENTRY':
      return { ...state, journal: state.journal.filter((j) => j.id !== action.id) }
    case 'RESET':
      return initialState
    default:
      return state
  }
}

export interface Ctx {
  state: AppState
  dispatch: React.Dispatch<Action>
  // Present in cloud mode: whether data is synced to Supabase, the shared
  // invite code, a sign-out action, and a "leave this space" action that returns
  // you to the create/join screen so you can join a different space with a code.
  cloud?: boolean
  signOut?: () => void
  inviteCode?: string
  leaveSpace?: () => Promise<void>
  // Background push (cloud mode): register/remove this device's push subscription.
  enablePush?: () => Promise<void>
  disablePush?: () => Promise<void>
  // Present in cloud mode: uploads a photo blob to Storage and resolves its
  // public URL, for optional Journal photo attachments.
  uploadPhoto?: (blob: Blob) => Promise<string>
}

export const StoreContext = createContext<Ctx | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadInitialState)

  // Skip persisting the very first render (nothing changed yet).
  const firstRun = useRef(true)
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false
      return
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // storage may be unavailable in private mode
    }
  }, [state])

  const value = useMemo(() => ({ state, dispatch, cloud: false }), [state])
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
