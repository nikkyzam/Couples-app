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
import type {
  AppState,
  PartnerId,
  SpiceLevel,
  Vote,
  LoveNote,
  DatePlan,
  CyclePlan,
  JournalEntry,
} from '../types'
import AuthScreen from './AuthScreen'
import LinkScreen from './LinkScreen'
import { showAppNotification, notificationsPref } from '../lib/useNotifications'
import { vapidPublicKey, pushSupported, urlBase64ToUint8Array } from '../lib/push'

const FAV_KEY = 'kindle.favorites'

interface CoupleRow {
  id: string
  invite_code: string
  comfort: number
  safe_word: string
  unlocked_level: number
  play_count: number
  owned_toys: string[] | null
  wishlist: string[] | null
  gift_list: string[] | null
  cycle_last_start: string | null
  cycle_length: number | null
  cycle_period_length: number | null
  cycle_owner: string | null
  anniversary: string | null
}
interface PlanRow {
  id: string
  created_by: string | null
  plan_date: string
  plan_time: string | null
  title: string
  note: string | null
  done: boolean
}
interface JournalRow {
  id: string
  author: string
  text: string
  mood: string
  photo_url: string | null
  created_at: string
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


// Assemble the local AppState mirror from the synced Supabase rows.
function buildState(
  couple: CoupleRow,
  members: MemberRow[],
  notes: NoteRow[],
  votes: VoteRow[],
  plans: PlanRow[],
  journalRows: JournalRow[],
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

  const mappedPlans: DatePlan[] = plans.map((p) => ({
    id: p.id,
    date: p.plan_date,
    time: p.plan_time ?? undefined,
    title: p.title,
    note: p.note ?? undefined,
    done: p.done,
    createdBy: p.created_by ? uidToSlot[p.created_by] : undefined,
  }))

  const mappedJournal: JournalEntry[] = journalRows.map((j) => ({
    id: j.id,
    author: uidToSlot[j.author] ?? 'A',
    text: j.text,
    mood: j.mood,
    photo: j.photo_url ?? undefined,
    createdAt: new Date(j.created_at).getTime(),
  }))

  const cycle: CyclePlan | null = couple.cycle_last_start
    ? {
        lastStart: couple.cycle_last_start,
        cycleLength: couple.cycle_length ?? 28,
        periodLength: couple.cycle_period_length ?? 5,
        owner: (couple.cycle_owner as PartnerId | null) ?? undefined,
      }
    : null

  return {
    profile: {
      accounts: {
        A: { name: bySlot.A?.display_name ?? '', emoji: bySlot.A?.emoji ?? '💜', pin: '' },
        B: { name: bySlot.B?.display_name ?? 'Your partner', emoji: bySlot.B?.emoji ?? '❤️', pin: '' },
      },
      comfort: couple.comfort as SpiceLevel,
      safeWord: couple.safe_word,
      onboarded: true,
      anniversary: couple.anniversary ?? undefined,
    },
    activeUser: mySlot,
    playCount: couple.play_count,
    unlockedLevel: couple.unlocked_level as SpiceLevel,
    desiresA,
    desiresB,
    favorites: loadFavorites(),
    ownedToys: couple.owned_toys ?? [],
    wishlist: couple.wishlist ?? [],
    notes: mappedNotes,
    plans: mappedPlans,
    cycle,
    giftList: couple.gift_list ?? [],
    journal: mappedJournal,
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
  // Notification bookkeeping: which incoming notes we've already accounted for,
  // and whether we've seeded the backlog yet (so we don't alert for every old
  // note the first time the bundle loads).
  const notifiedNoteIds = useRef<Set<string>>(new Set())
  const notesSeeded = useRef(false)

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
        notesSeeded.current = false
        notifiedNoteIds.current.clear()
        setPhase('auth')
      }
    })
    return () => sub.subscription.unsubscribe()
  }, [sb])

  // Fire a gentle notification for notes newly arrived from your partner. The
  // first load just seeds the set of known notes (no backlog spam); after that,
  // any note we haven't seen — surfaced live by the realtime subscription —
  // triggers one. We deliberately keep the note's text out of the alert.
  const notifyNewNotes = useCallback((next: AppState) => {
    const mine = next.activeUser
    const incoming = next.notes.filter((n) => n.to === mine)
    if (!notesSeeded.current) {
      incoming.forEach((n) => notifiedNoteIds.current.add(n.id))
      notesSeeded.current = true
      return
    }
    const partnerName =
      next.profile.accounts[mine === 'A' ? 'B' : 'A'].name || 'Your partner'
    for (const n of incoming) {
      if (notifiedNoteIds.current.has(n.id)) continue
      notifiedNoteIds.current.add(n.id)
      if (!n.read) {
        void showAppNotification(
          `💌 ${partnerName} sent you a note`,
          'Open Kindle to read it.',
          { tag: `note-${n.id}` },
        )
      }
    }
  }, [])

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
    const [{ data: couple }, { data: members }, { data: notes }, { data: votes }, { data: plans }, { data: journalRows }] =
      await Promise.all([
        sb.from('couples').select('*').eq('id', cid).single(),
        sb.from('members').select('*').eq('couple_id', cid),
        sb.from('notes').select('*').eq('couple_id', cid).order('created_at', { ascending: false }),
        sb.from('desire_votes').select('user_id,item_id,vote').eq('couple_id', cid),
        sb.from('plans').select('*').eq('couple_id', cid).order('plan_date', { ascending: true }),
        sb.from('journal_entries').select('*').eq('couple_id', cid).order('created_at', { ascending: false }),
      ])
    if (!couple) {
      setPhase('link')
      return
    }
    setInviteCode((couple as CoupleRow).invite_code)
    const next = buildState(
      couple as CoupleRow,
      (members ?? []) as MemberRow[],
      (notes ?? []) as NoteRow[],
      (votes ?? []) as VoteRow[],
      (plans ?? []) as PlanRow[],
      (journalRows ?? []) as JournalRow[],
      uid,
    )
    localDispatch({ type: 'REPLACE', state: next })
    notifyNewNotes(next)
    setPhase('ready')
  }, [sb, notifyNewNotes])

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
      .on('postgres_changes', { event: '*', schema: 'public', table: 'plans', filter: `couple_id=eq.${cid}` }, loadBundle)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'journal_entries', filter: `couple_id=eq.${cid}` }, loadBundle)
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
        case 'SET_ANNIVERSARY':
          await sb.from('couples').update({ anniversary: action.date }).eq('id', cid)
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
        case 'ADD_PLAN':
          await sb.from('plans').insert({
            id: action.plan.id,
            couple_id: cid,
            created_by: uid,
            plan_date: action.plan.date,
            plan_time: action.plan.time ?? null,
            title: action.plan.title,
            note: action.plan.note ?? null,
            done: action.plan.done,
          })
          break
        case 'DELETE_PLAN':
          await sb.from('plans').delete().eq('id', action.id)
          break
        case 'TOGGLE_PLAN_DONE': {
          const p = prev.plans.find((x) => x.id === action.id)
          await sb.from('plans').update({ done: !p?.done }).eq('id', action.id)
          break
        }
        case 'ADD_JOURNAL_ENTRY':
          await sb.from('journal_entries').insert({
            id: action.entry.id,
            couple_id: cid,
            author: uid,
            text: action.entry.text,
            mood: action.entry.mood,
            photo_url: action.entry.photo ?? null,
          })
          break
        case 'DELETE_JOURNAL_ENTRY':
          await sb.from('journal_entries').delete().eq('id', action.id)
          break
        case 'SET_CYCLE':
          await sb
            .from('couples')
            .update({
              cycle_last_start: action.cycle?.lastStart ?? null,
              cycle_length: action.cycle?.cycleLength ?? null,
              cycle_period_length: action.cycle?.periodLength ?? null,
              cycle_owner: action.cycle?.owner ?? null,
            })
            .eq('id', cid)
          break
        case 'TOGGLE_FAVORITE':
          // Favorites are personal, so they stay device-local by design.
          localStorage.setItem(FAV_KEY, JSON.stringify(stateRef.current.favorites))
          break
        case 'TOGGLE_OWNED_TOY':
          // The toy box is shared — sync it to the couple so both phones match.
          await sb
            .from('couples')
            .update({ owned_toys: stateRef.current.ownedToys, wishlist: stateRef.current.wishlist })
            .eq('id', cid)
          break
        case 'TOGGLE_WISHLIST_TOY':
          await sb
            .from('couples')
            .update({ wishlist: stateRef.current.wishlist })
            .eq('id', cid)
          break
        case 'TOGGLE_GIFT':
          // Shared "treat yourselves" list — sync so both phones match.
          await sb
            .from('couples')
            .update({ gift_list: stateRef.current.giftList })
            .eq('id', cid)
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
      if (
        action.type === 'TOGGLE_FAVORITE' ||
        action.type === 'TOGGLE_OWNED_TOY' ||
        action.type === 'TOGGLE_WISHLIST_TOY' ||
        action.type === 'TOGGLE_GIFT'
      ) {
        setTimeout(() => persist(action), 0)
      } else {
        persist(action)
      }
    },
    [sb, persist],
  )

  const signOut = useCallback(() => sb.auth.signOut(), [sb])

  // Register this device for background push (fires even when the app is closed).
  // Best-effort: silently no-ops if no VAPID key is configured or push is
  // unsupported — the in-app notification still works either way.
  const enablePush = useCallback(async () => {
    const key = vapidPublicKey()
    if (!key || !pushSupported()) return
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return
    const uid = session?.user.id
    const cid = coupleId.current
    if (!uid || !cid) return
    try {
      const reg = await navigator.serviceWorker.ready
      let sub = await reg.pushManager.getSubscription()
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(key),
        })
      }
      const json = sub.toJSON()
      if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) return
      await sb.from('push_subscriptions').upsert(
        {
          endpoint: json.endpoint,
          user_id: uid,
          couple_id: cid,
          p256dh: json.keys.p256dh,
          auth: json.keys.auth,
        },
        { onConflict: 'endpoint' },
      )
    } catch {
      /* push unavailable — in-app notifications still work */
    }
  }, [sb, session])

  const disablePush = useCallback(async () => {
    if (!pushSupported()) return
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        const endpoint = sub.endpoint
        await sub.unsubscribe()
        await sb.from('push_subscriptions').delete().eq('endpoint', endpoint)
      }
    } catch {
      /* ignore */
    }
  }, [sb])

  // If notifications are already opted-in, make sure this device has a live push
  // subscription once the couple bundle is loaded (endpoints can rotate).
  useEffect(() => {
    if (
      phase === 'ready' &&
      notificationsPref() &&
      typeof Notification !== 'undefined' &&
      Notification.permission === 'granted'
    ) {
      enablePush()
    }
  }, [phase, enablePush])

  // Upload a (already resized/compressed) photo blob for an optional Journal
  // entry attachment. Stored under a per-couple folder so storage RLS can scope
  // access to just this couple's members.
  const uploadPhoto = useCallback(
    async (blob: Blob): Promise<string> => {
      const cid = coupleId.current
      if (!cid) throw new Error('Not in a synced space yet.')
      const path = `${cid}/${crypto.randomUUID()}.jpg`
      const { error } = await sb.storage
        .from('memories')
        .upload(path, blob, { contentType: 'image/jpeg', upsert: false })
      if (error) throw error
      const { data } = sb.storage.from('memories').getPublicUrl(path)
      return data.publicUrl
    },
    [sb],
  )

  // Leave the current space and return to the create/join screen, so the user
  // can join a different space with a code (or start a fresh one).
  const leaveSpace = useCallback(async () => {
    const { error } = await sb.rpc('leave_couple')
    if (error) throw error
    coupleId.current = null
    notesSeeded.current = false
    notifiedNoteIds.current.clear()
    setInviteCode(undefined)
    localDispatch({ type: 'REPLACE', state: initialState })
    setPhase('link')
  }, [sb])

  const value = useMemo(
    () => ({
      state,
      dispatch,
      cloud: true,
      signOut,
      inviteCode,
      leaveSpace,
      enablePush,
      disablePush,
      uploadPhoto,
    }),
    [state, dispatch, signOut, inviteCode, leaveSpace, enablePush, disablePush, uploadPhoto],
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
