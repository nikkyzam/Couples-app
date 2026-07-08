import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import type { JournalEntry } from '../types'
import { Button, SectionTitle, EmptyState } from '../components/ui'
import { resizeImage, blobToDataURL } from '../lib/image'

const MOODS = ['💛', '🥰', '😊', '🫶', '✨', '😌']

function timeAgo(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

export default function Journal() {
  const { state, dispatch, cloud, uploadPhoto } = useStore()
  const navigate = useNavigate()
  const me = state.activeUser
  const names = state.profile.accounts

  const [text, setText] = useState('')
  const [mood, setMood] = useState('💛')
  const [writing, setWriting] = useState(false)
  const [photoBlob, setPhotoBlob] = useState<Blob | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoError, setPhotoError] = useState('')
  const [sharing, setSharing] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)

  const entries = [...state.journal].sort((a, b) => b.createdAt - a.createdAt)

  async function pickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setPhotoError('')
    try {
      const resized = await resizeImage(file)
      setPhotoBlob(resized)
      setPhotoPreview(await blobToDataURL(resized))
    } catch {
      setPhotoError("Couldn't read that photo — try a different one.")
    }
  }

  function removePhoto() {
    setPhotoBlob(null)
    setPhotoPreview(null)
    setPhotoError('')
  }

  async function share() {
    if (!text.trim() || sharing) return
    setSharing(true)
    let photo: string | undefined
    try {
      if (photoBlob) {
        photo = cloud && uploadPhoto ? await uploadPhoto(photoBlob) : await blobToDataURL(photoBlob)
      }
    } catch {
      // Photo upload failed — still share the words rather than blocking on it.
    }
    const entry: JournalEntry = {
      id: crypto.randomUUID(),
      author: me,
      text: text.trim(),
      mood,
      photo,
      createdAt: Date.now(),
    }
    dispatch({ type: 'ADD_JOURNAL_ENTRY', entry })
    setText('')
    setMood('💛')
    setWriting(false)
    setPhotoBlob(null)
    setPhotoPreview(null)
    setSharing(false)
  }

  return (
    <div>
      <button onClick={() => navigate('/')} className="mb-2 text-sm text-plum-300">
        ← Home
      </button>

      <SectionTitle
        eyebrow="A shared little log"
        title="Journal"
        sub="One thing you loved about today — visible to both of you, no reply needed."
      />

      {!writing ? (
        <button
          onClick={() => setWriting(true)}
          className="mb-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-ember-500 to-plum-500 py-3 font-semibold text-white shadow-lg active:scale-[0.98]"
        >
          ✍️ Add today's entry
        </button>
      ) : (
        <div className="card-glass mb-6 rounded-3xl p-4">
          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
            {MOODS.map((m) => (
              <button
                key={m}
                onClick={() => setMood(m)}
                className={`grid h-11 w-11 shrink-0 place-items-center rounded-full text-xl transition ${
                  mood === m ? 'bg-ember-500/40 ring-2 ring-ember-400' : 'bg-white/5'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          <textarea
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="One thing I loved about today…"
            rows={3}
            className="mt-3 w-full resize-none rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-plum-300/50 focus:border-ember-400 focus:outline-none"
          />

          {photoPreview ? (
            <div className="relative mt-3">
              <img
                src={photoPreview}
                alt=""
                className="max-h-48 w-full rounded-2xl object-cover"
              />
              <button
                onClick={removePhoto}
                className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-black/60 text-white"
                title="Remove photo"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileInput.current?.click()}
              className="mt-3 w-full rounded-2xl border border-dashed border-white/15 py-3 text-sm text-plum-200/70 hover:bg-white/5"
            >
              📷 Add a photo (optional)
            </button>
          )}
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            onChange={pickPhoto}
            className="hidden"
          />
          {photoError && <p className="mt-2 text-xs text-red-300">{photoError}</p>}

          <div className="mt-3 flex gap-2">
            <Button className="flex-1" onClick={share} disabled={!text.trim() || sharing}>
              {sharing ? 'Sharing…' : 'Share it'}
            </Button>
            <Button
              variant="soft"
              onClick={() => {
                setWriting(false)
                removePhoto()
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {entries.length === 0 ? (
        <EmptyState
          emoji="📔"
          title="No entries yet"
          sub="Write down one good thing from today. Little moments add up."
        />
      ) : (
        <div className="space-y-3">
          {entries.map((j) => (
            <div key={j.id} className="card-glass rounded-3xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-ember-300">
                  {j.mood} {names[j.author].emoji}{' '}
                  {names[j.author].name || `Partner ${j.author === 'A' ? 1 : 2}`}
                </span>
                <span className="text-xs text-plum-300/60">{timeAgo(j.createdAt)}</span>
              </div>
              {j.photo && (
                <img
                  src={j.photo}
                  alt=""
                  className="mt-2 max-h-64 w-full rounded-2xl object-cover"
                />
              )}
              <p className="mt-2 text-white">{j.text}</p>
              {j.author === me && (
                <button
                  onClick={() => dispatch({ type: 'DELETE_JOURNAL_ENTRY', id: j.id })}
                  className="mt-2 text-xs text-plum-300/50"
                >
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
