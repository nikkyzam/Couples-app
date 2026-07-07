import { useCallback, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './supabase'
import {
  StoreContext,
  reducer,
  computeUnlock,
  initialState,
  type Action,
} from '../store'
import type { AppState, PartnerId, SpiceLevel, Vote, LoveNote } from '../types'
import AuthScreen from './AuthScreen'
import LinkScreen from './LinkScreen'

const FAV_KEY = 'kindle.favorites'
const OWNED_KEY = 'kindle.ownedToys'

interface CoupleRow {
  id: string
  invite_code: string
  comfort: number
  safe_word: string
  unlocked_level: number
  play_count: number
}
interface MemberRow {
  couple_id: string
  user_id: string
  display_name: string
  emoji: string
  slot: PartnerId
}
interface NoteRow {
  id: string
  from_user: string
  text: string
  mood: string
  read: boolean
  created_at: string
}
interface VoteRow {
  user_id: string
  item_id: string
  vote: Vote
}

function loadFavorites(): string[] {
  try {
    return JSON.parse(localStorage.getItem(FAV_KEY) || '[]')
  } catch {
    return []
  }
}

function loadOwnedToys(): string[] {
  try {
    return JSON.parse(localStorage.getItem(OWNED_KEY) || '[]')
  } catch {
    return []
  }
}

// Assemble the local AppState mirror from the synced Supabase rows.
function buildState(
  couple: CoupleRow,
  members: MemberRow[],
  notes: NoteRow[],
  votes: VoteRow[],
  myUid: string,
): AppState {
  const bySlot: Partial<Record<PartnerId, MemberRow>> = {}
  const uidToSlot: Record<string, PartnerId> = {}
  for (const m of members) {
    bySlot[m.slot] = m
    uidToSlot[m.user_id] = m.slot
  }
  const mySlot: PartnerId = uidToSlot[myUid] ?? 'A'

  const desiresA: Record<string, Vote> = {}
  const desiresB: Record<string, Vote> = {}
  for (const v of votes) {
    const slot = uidToSlot[v.user_id]
    if (slot === 'A') desiresA[v.item_id] = v.vote
    else if (slot === 'B') desiresB[v.item_id] = v.vote
  }

  const mappedNotes: LoveNote[] = notes.map((n) => {
    const from = uidToSlot[n.from_user] ?? 'A'
    const to: PartnerId = from === 'A' ? 'B' : 'A'
    return {
      id: n.id,
      from,
      to,
      text: n.text,
      mood: n.mood,
      createdAt: new Date(n.created_at).getTime(),
      read: n.read,
    }
  })

  return {
    profile: {
      accounts: {
        A: { name: bySlot.A?.display_name ?? '', emoji: bySlot.A?.emoji ?? '💜', pin: '' },
        B: { name: bySlot.B?.display_name ?? 'Your partner', emoji: bySlot.B?.emoji ?? '❤️', pin: '' },
      },
      comfort: couple.comfort as SpiceLevel,
      safeWord: couple.safe_word,
      onboarded: true,
    },
    activeUser: mySlot,
    playCount: couple.play_count,
    unlockedLevel: couple.unlocked_level as SpiceLevel,
    desiresA,
    desiresB,
    favorites: loadFavorites(),
    ownedToys: loadOwnedToys(),
    notes: mappedNotes,
  }
}

type Phase = 'loading' | 'auth' | 'link' | 'ready'

export function CloudProvider({ children }: { children: ReactNode }) {
  const sb = supabase!
  const [session, setSession] = useState<Session | null>(null)
  const [phase, setPhase] = useState<Phase>('loading')
  const [state, localDispatch] = useReducer(reducer, initialState)
  const [inviteCode, setInviteCode] = useState<string | undefined>(undefined)
  const coupleId = useRef<string | null>(null)
  const stateRef = useRef(state)
  stateRef.current = state

  // Track auth session.
  useEffect(() => {
    sb.auth.getSession().then(({ data }) => {
      setSession(data.session)
      if (!data.session) setPhase('auth')
    })
    const { data: sub } = sb.auth.onAuthStateChange((_e, s) => {
      setSession(s)
      if (!s) {
        coupleId.current = null
        setPhase('auth')
      }
    })
    return () => sub.subscription.unsubscribe()
  }, [sb])

  // Load the couple bundle for the signed-in user.
  const loadBundle = useCallback(async () => {
    const uid = (await sb.auth.getUser()).data.user?.id
    if (!uid) return
    const { data: myMemberships } = await sb.from('members').select('couple_id').eq('user_id', uid)
    const cid = myMemberships?.[0]?.couple_id as string | undefined
    if (!cid) {
      coupleId.current = null
      setPhase('link')
      return
    }
    coupleId.current = cid
    const [{ data: couple }, { data: members }, { data: notes }, { data: votes }] =
      await Promise.all([
        sb.from('couples').select('*').eq('id', cid).single(),
        sb.from('members').select('*').eq('couple_id', cid),
        sb.from('notes').select('*').eq('couple_id', cid).order('created_at', { ascending: false }),
        sb.from('desire_votes').select('user_id,item_id,vote').eq('couple_id', cid),
      ])
    if (!couple) {
      setPhase('link')
      return
    }
    setInviteCode((couple as CoupleRow).invite_code)
    localDispatch({
      type: 'REPLACE',
      state: buildState(couple as CoupleRow, (members ?? []) as MemberRow[], (notes ?? []) as NoteRow[], (votes ?? []) as VoteRow[], uid),
    })
    setPhase('ready')
  }, [sb])

  useEffect(() => {
    if (session) loadBundle()
  }, [session, loadBundle])

  // Realtime: any change to our couple's rows → refetch the bundle.
  useEffect(() => {
    if (phase !== 'ready' || !coupleId.current) return
    const cid = coupleId.current
    const channel = sb
      .channel(`couple-${cid}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notes', filter: `couple_id=eq.${cid}` }, loadBundle)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'desire_votes', filter: `couple_id=eq.${cid}` }, loadBundle)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'couples', filter: `id=eq.${cid}` }, loadBundle)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'members', filter: `couple_id=eq.${cid}` }, loadBundle)
      .subscribe()
    return () => {
      sb.removeChannel(channel)
    }
  }, [phase, sb, loadBundle])

  // Persist a dispatched action to Supabase (mirror is already updated optimistically).
  const persist = useCallback(
    async (action: Action) => {
      const cid = coupleId.current
      const uid = session?.user.id
      if (!cid || !uid) return
      const prev = stateRef.current
      switch (action.type) {
        case 'RECORD_PLAY': {
          const play_count = prev.playCount + 1
          const unlocked_level = computeUnlock(play_count, prev.profile.comfort)
          await sb.from('couples').update({ play_count, unlocked_level }).eq('id', cid)
          break
        }
        case 'SET_COMFORT': {
          const unlocked_level = computeUnlock(prev.playCount, action.level)
          await sb.from('couples').update({ comfort: action.level, unlocked_level }).eq('id', cid)
          break
        }
        case 'SET_SAFEWORD':
          await sb.from('couples').update({ safe_word: action.word }).eq('id', cid)
          break
        case 'VOTE_DESIRE':
          if (action.vote === null) {
            await sb.from('desire_votes').delete().eq('couple_id', cid).eq('user_id', uid).eq('item_id', action.itemId)
          } else {
            await sb.from('desire_votes').upsert({ couple_id: cid, user_id: uid, item_id: action.itemId, vote: action.vote })
          }
          break
        case 'SEND_NOTE':
          await sb.from('notes').insert({
            id: action.note.id,
            couple_id: cid,
            from_user: uid,
            text: action.note.text,
            mood: action.note.mood,
            read: false,
          })
          break
        case 'MARK_NOTE_READ':
          await sb.from('notes').update({ read: true }).eq('id', action.id)
          break
        case 'DELETE_NOTE':
          await sb.from('notes').delete().eq('id', action.id)
          break
        case 'TOGGLE_FAVORITE':
          // Favorites are device-local by design.
          localStorage.setItem(FAV_KEY, JSON.stringify(stateRef.current.favorites))
          break
        case 'TOGGLE_OWNED_TOY':
          localStorage.setItem(OWNED_KEY, JSON.stringify(stateRef.current.ownedToys))
          break
        case 'COMPLETE_ONBOARDING': {
          // Used by Settings to rename — only ever update your own profile.
          const mine = action.payload.accounts?.[prev.activeUser]
          if (mine) {
            await sb.from('members').update({ display_name: mine.name, emoji: mine.emoji }).eq('couple_id', cid).eq('user_id', uid)
          }
          break
        }
      }
    },
    [sb, session],
  )

  // Cloud dispatch: optimistic local update, then sync. RESET means sign out.
  const dispatch = useCallback(
    (action: Action) => {
      if (action.type === 'SET_ACTIVE_USER') return // no switching on your own phone
      if (action.type === 'RESET') {
        sb.auth.signOut()
        return
      }
      localDispatch(action)
      // These persist from the *updated* mirror, so defer to the next tick.
      if (action.type === 'TOGGLE_FAVORITE' || action.type === 'TOGGLE_OWNED_TOY') {
        setTimeout(() => persist(action), 0)
      } else {
        persist(action)
      }
    },
    [sb, persist],
  )

  const signOut = useCallback(() => sb.auth.signOut(), [sb])

  const value = useMemo(
    () => ({ state, dispatch, cloud: true, signOut, inviteCode }),
    [state, dispatch, signOut, inviteCode],
  )

  if (phase === 'loading') {
    return (
      <div className="grid min-h-full place-items-center">
        <div className="animate-pulse text-5xl">🔥</div>
      </div>
    )
  }
  if (phase === 'auth') return <AuthScreen />
  if (phase === 'link') return <LinkScreen onLinked={loadBundle} onSignOut={signOut} />

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}
