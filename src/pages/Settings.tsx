import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { SPICE_META, type PartnerId, type SpiceLevel } from '../types'
import { SectionTitle, Card, Button } from '../components/ui'
import { useSpeech } from '../lib/useSpeech'
import { useAppLock } from '../lib/useAppLock'
import { useNotifications } from '../lib/useNotifications'

const EMOJIS = ['💜', '❤️', '🧡', '💛', '💚', '💙', '🩷', '🔥', '🌙', '⭐']

export default function Settings() {
  const { state, dispatch, cloud, inviteCode, signOut, leaveSpace } = useStore()
  const navigate = useNavigate()
  const { profile } = state
  const { supported, voices, speak, prefs, setPrefs } = useSpeech()
  const lock = useAppLock()
  const notif = useNotifications()
  const [pinDraft, setPinDraft] = useState('')
  const [pinStage, setPinStage] = useState<'idle' | 'set' | 'confirm'>('idle')
  const [firstPin, setFirstPin] = useState('')
  const [pinError, setPinError] = useState('')
  // "Leave this space" flow — confirm before removing yourself from the space.
  const [confirmLeave, setConfirmLeave] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const [leaveError, setLeaveError] = useState('')

  async function doLeave() {
    setLeaving(true)
    setLeaveError('')
    try {
      await leaveSpace?.()
      // On success CloudProvider swaps to the create/join screen automatically.
    } catch (e) {
      setLeaveError(e instanceof Error ? e.message : 'Could not leave the space.')
      setLeaving(false)
      setConfirmLeave(false)
    }
  }
  // In synced mode you can only edit your own profile (your partner edits theirs
  // on their own phone).
  const editableSlots: PartnerId[] = cloud ? [state.activeUser] : ['A', 'B']

  function rename(id: PartnerId, name: string) {
    dispatch({
      type: 'COMPLETE_ONBOARDING',
      payload: {
        accounts: {
          ...profile.accounts,
          [id]: { ...profile.accounts[id], name },
        },
      },
    })
  }
  function setEmoji(id: PartnerId, emoji: string) {
    dispatch({
      type: 'COMPLETE_ONBOARDING',
      payload: {
        accounts: {
          ...profile.accounts,
          [id]: { ...profile.accounts[id], emoji },
        },
      },
    })
  }

  return (
    <div>
      <SectionTitle eyebrow="Just for you two" title="Settings" />

      {/* Invite code (synced mode) */}
      {cloud && inviteCode && (
        <>
          <h3 className="mb-2 px-1 text-xs font-semibold uppercase tracking-widest text-plum-300/70">
            Your invite code
          </h3>
          <Card className="mb-6 text-center">
            <p className="text-4xl font-bold tracking-[0.3em] text-white">{inviteCode}</p>
            <p className="mt-2 text-xs text-plum-300/60">
              Share this with your partner so they can join your space from their phone.
            </p>

            {leaveSpace && (
              <div className="mt-4 border-t border-white/10 pt-4">
                {!confirmLeave ? (
                  <button
                    onClick={() => {
                      setConfirmLeave(true)
                      setLeaveError('')
                    }}
                    className="text-sm text-plum-300/70 underline underline-offset-4"
                  >
                    Joined the wrong space? Leave and join another
                  </button>
                ) : (
                  <div>
                    <p className="text-sm text-white">Leave this space?</p>
                    <p className="mt-1 text-xs text-plum-300/60">
                      You’ll go back to the create / join screen so you can join with a
                      code. If you’re the last one here, this space and its notes are
                      deleted.
                    </p>
                    <div className="mt-3 flex gap-2">
                      <Button
                        variant="danger"
                        className="flex-1"
                        disabled={leaving}
                        onClick={doLeave}
                      >
                        {leaving ? 'Leaving…' : 'Leave space'}
                      </Button>
                      <Button
                        variant="soft"
                        className="flex-1"
                        disabled={leaving}
                        onClick={() => setConfirmLeave(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                    {leaveError && (
                      <p className="mt-2 text-xs text-red-300">{leaveError}</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </Card>
        </>
      )}

      {/* Notifications (synced mode — a heads-up when your partner writes) */}
      {cloud && notif.supported && (
        <>
          <h3 className="mb-2 px-1 text-xs font-semibold uppercase tracking-widest text-plum-300/70">
            Notifications
          </h3>
          <Card className="mb-6">
            <label className="flex items-center justify-between">
              <span className="font-semibold text-white">Notify me about new notes</span>
              <button
                onClick={() => (notif.enabled ? notif.disable() : void notif.enable())}
                className={`relative h-7 w-12 rounded-full transition ${notif.enabled ? 'bg-ember-500' : 'bg-white/15'}`}
                role="switch"
                aria-checked={notif.enabled}
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${notif.enabled ? 'left-6' : 'left-1'}`}
                />
              </button>
            </label>
            <p className="mt-2 text-xs text-plum-300/60">
              A gentle heads-up when your partner leaves you a note. The words stay
              hidden — you’ll just see that one arrived.
            </p>
            {notif.permission === 'denied' && (
              <p className="mt-2 text-xs text-red-300/80">
                Notifications are blocked for Kindle in your device settings. Turn them
                on there first, then toggle this again.
              </p>
            )}
            <p className="mt-2 text-[11px] text-plum-300/50">
              On iPhone, add Kindle to your Home Screen first — notifications only work
              once it’s installed.
            </p>
          </Card>
        </>
      )}

      {/* Profiles */}
      <h3 className="mb-2 px-1 text-xs font-semibold uppercase tracking-widest text-plum-300/70">
        {cloud ? 'Your profile' : 'Profiles'}
      </h3>
      <div className="space-y-3">
        {editableSlots.map((id) => (
          <Card key={id} className="!p-4">
            <input
              value={profile.accounts[id].name}
              onChange={(e) => rename(id, e.target.value)}
              placeholder={`Partner ${id === 'A' ? 1 : 2}`}
              className="w-full bg-transparent text-lg font-semibold text-white placeholder:text-plum-300/50 focus:outline-none"
            />
            <div className="no-scrollbar mt-2 flex gap-2 overflow-x-auto">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  onClick={() => setEmoji(id, e)}
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-lg transition ${
                    profile.accounts[id].emoji === e
                      ? 'bg-ember-500/40 ring-2 ring-ember-400'
                      : 'bg-white/5'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {/* Comfort ceiling */}
      <h3 className="mb-2 mt-6 px-1 text-xs font-semibold uppercase tracking-widest text-plum-300/70">
        Comfort ceiling
      </h3>
      <Card>
        <p className="text-sm text-plum-200/80">
          The app never shows content above this. Move it together, only when you
          both feel ready.
        </p>
        <div className="mt-4 space-y-2">
          {[1, 2, 3, 4, 5].map((lvl) => {
            const m = SPICE_META[lvl as SpiceLevel]
            const active = profile.comfort === lvl
            return (
              <button
                key={lvl}
                onClick={() => dispatch({ type: 'SET_COMFORT', level: lvl as SpiceLevel })}
                className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${
                  active ? 'border-ember-400 bg-ember-500/15' : 'border-white/10 bg-white/5'
                }`}
              >
                <span className="text-xl">{m.emoji}</span>
                <span className="flex-1">
                  <span className="block text-sm font-semibold text-white">
                    L{lvl} · {m.name}
                  </span>
                  <span className="block text-xs text-plum-200/60">{m.blurb}</span>
                </span>
                {active && <span className="text-ember-400">✓</span>}
              </button>
            )
          })}
        </div>
      </Card>

      {/* Safe word */}
      <h3 className="mb-2 mt-6 px-1 text-xs font-semibold uppercase tracking-widest text-plum-300/70">
        Safe word
      </h3>
      <Card>
        <input
          value={profile.safeWord}
          onChange={(e) => dispatch({ type: 'SET_SAFEWORD', word: e.target.value })}
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-ember-400 focus:outline-none"
        />
        <p className="mt-2 text-xs text-plum-300/60">
          Either of you can say this to pause everything, anytime.
        </p>
      </Card>

      {/* App lock */}
      <h3 className="mb-2 mt-6 px-1 text-xs font-semibold uppercase tracking-widest text-plum-300/70">
        App lock
      </h3>
      <Card>
        <label className="flex items-center justify-between">
          <span>
            <span className="block font-semibold text-white">Require a PIN to open Kindle</span>
            <span className="block text-xs text-plum-300/60">
              {lock.hasLock ? 'On for this device' : 'Off — anyone with this device can open Kindle'}
            </span>
          </span>
          <button
            onClick={() => {
              if (lock.hasLock) {
                if (confirm('Turn off the app lock on this device?')) lock.setCode('')
                setPinStage('idle')
              } else {
                setPinStage('set')
                setPinError('')
              }
            }}
            className={`relative h-7 w-12 shrink-0 rounded-full transition ${lock.hasLock ? 'bg-ember-500' : 'bg-white/15'}`}
            role="switch"
            aria-checked={lock.hasLock}
          >
            <span
              className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${lock.hasLock ? 'left-6' : 'left-1'}`}
            />
          </button>
        </label>

        {pinStage !== 'idle' && (
          <div className="mt-4 border-t border-white/10 pt-4">
            <p className="text-sm text-white">
              {pinStage === 'set' ? 'Choose a 4-digit PIN' : 'Enter it again to confirm'}
            </p>
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              value={pinDraft}
              autoFocus
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, '').slice(0, 4)
                setPinDraft(v)
                setPinError('')
                if (v.length === 4) {
                  if (pinStage === 'set') {
                    setFirstPin(v)
                    setPinDraft('')
                    setPinStage('confirm')
                  } else if (v === firstPin) {
                    lock.setCode(v)
                    setPinStage('idle')
                    setPinDraft('')
                    setFirstPin('')
                  } else {
                    setPinError("Those didn't match — try again.")
                    setPinDraft('')
                    setPinStage('set')
                    setFirstPin('')
                  }
                }
              }}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-2xl tracking-[0.5em] text-white focus:border-ember-400 focus:outline-none"
            />
            {pinError && <p className="mt-2 text-xs text-red-300">{pinError}</p>}
            <p className="mt-2 text-xs text-plum-300/60">
              Applies the next time Kindle is opened on this device.
            </p>
          </div>
        )}
      </Card>

      {/* Guided voice */}
      {supported && (
        <>
          <h3 className="mb-2 mt-6 px-1 text-xs font-semibold uppercase tracking-widest text-plum-300/70">
            Guided voice
          </h3>
          <Card>
            <label className="flex items-center justify-between">
              <span className="font-semibold text-white">Narrate Date Night aloud</span>
              <button
                onClick={() => setPrefs({ enabled: !prefs.enabled })}
                className={`relative h-7 w-12 rounded-full transition ${prefs.enabled ? 'bg-ember-500' : 'bg-white/15'}`}
                role="switch"
                aria-checked={prefs.enabled}
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${prefs.enabled ? 'left-6' : 'left-1'}`}
                />
              </button>
            </label>

            {prefs.enabled && (
              <div className="mt-4 space-y-4">
                {voices.length > 0 && (
                  <div>
                    <label className="text-xs text-plum-300">Voice</label>
                    <select
                      value={prefs.voiceURI ?? ''}
                      onChange={(e) => setPrefs({ voiceURI: e.target.value || null })}
                      className="mt-1 w-full rounded-2xl border border-white/10 bg-plum-900 px-3 py-3 text-white focus:border-ember-400 focus:outline-none"
                    >
                      <option value="">Recommended (auto)</option>
                      {voices.map((v) => (
                        <option key={v.voiceURI} value={v.voiceURI}>
                          {v.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="flex items-center justify-between text-xs text-plum-300">
                    <span>Speed</span>
                    <span>{prefs.rate.toFixed(2)}×</span>
                  </label>
                  <input
                    type="range"
                    min={0.7}
                    max={1.1}
                    step={0.05}
                    value={prefs.rate}
                    onChange={(e) => setPrefs({ rate: Number(e.target.value) })}
                    className="mt-1 w-full accent-ember-500"
                  />
                  <div className="flex justify-between text-[10px] text-plum-300/60">
                    <span>slow &amp; sensual</span>
                    <span>brisk</span>
                  </div>
                </div>

                <Button
                  variant="soft"
                  className="w-full"
                  onClick={() =>
                    speak(
                      "Hi love. This is the voice that will guide you through your evening together. Relax, take your time, and enjoy each other.",
                      { force: true },
                    )
                  }
                >
                  🔊 Test voice
                </Button>
              </div>
            )}
          </Card>
        </>
      )}

      {/* Guides */}
      <h3 className="mb-2 mt-6 px-1 text-xs font-semibold uppercase tracking-widest text-plum-300/70">
        Guides
      </h3>
      <Link to="/pleasure">
        <Card className="flex items-center justify-between hover:bg-white/10">
          <span className="flex items-center gap-3">
            <span className="text-2xl">💎</span>
            <span className="font-semibold text-white">The Climax Guide</span>
          </span>
          <span className="text-plum-300">→</span>
        </Card>
      </Link>

      {/* Danger zone */}
      <div className="mt-8">
        {cloud ? (
          <Button variant="soft" className="w-full" onClick={() => signOut?.()}>
            Sign out
          </Button>
        ) : (
          <Button
            variant="danger"
            className="w-full"
            onClick={() => {
              if (confirm('Reset everything? This clears profiles, notes, and progress on this device.')) {
                dispatch({ type: 'RESET' })
                navigate('/onboarding')
              }
            }}
          >
            Reset all data
          </Button>
        )}
        <p className="mt-3 text-center text-xs text-plum-300/50">
          {cloud
            ? 'Your data is private to you and your partner, synced securely.'
            : 'Kindle keeps everything private on this device. Nothing is uploaded.'}
        </p>
      </div>
    </div>
  )
}
