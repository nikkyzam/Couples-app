import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { SPICE_META, type PartnerId, type SpiceLevel } from '../types'
import { SectionTitle, Card, Button } from '../components/ui'
import { useSpeech } from '../lib/useSpeech'

const EMOJIS = ['💜', '❤️', '🧡', '💛', '💚', '💙', '🩷', '🔥', '🌙', '⭐']

export default function Settings() {
  const { state, dispatch, cloud, inviteCode, signOut } = useStore()
  const navigate = useNavigate()
  const { profile } = state
  const { supported, voices, speak, prefs, setPrefs } = useSpeech()
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
