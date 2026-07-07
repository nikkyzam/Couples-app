import { useCallback, useEffect, useState } from 'react'

// A gentle on-device narrator built on the browser's Web Speech API. No network,
// no keys — the voices live on the device, so it works offline in the PWA.

const PREF_KEY = 'kindle.voice.v1'

export interface VoicePrefs {
  enabled: boolean
  voiceURI: string | null
  rate: number // 0.7 slow & sensual … 1.1 brisk
}

const DEFAULTS: VoicePrefs = { enabled: true, voiceURI: null, rate: 0.9 }

function loadPrefs(): VoicePrefs {
  try {
    const raw = localStorage.getItem(PREF_KEY)
    if (raw) return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<VoicePrefs>) }
  } catch {
    /* ignore */
  }
  return DEFAULTS
}

// Warm, natural-sounding voices we prefer when the user hasn't picked one.
const PREFERRED = [
  'Samantha',
  'Google UK English Female',
  'Microsoft Aria',
  'Microsoft Jenny',
  'Serena',
  'Karen',
  'Moira',
  'Tessa',
  'Google US English',
]

export function useSpeech() {
  const supported =
    typeof window !== 'undefined' && 'speechSynthesis' in window
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [prefs, setPrefsState] = useState<VoicePrefs>(loadPrefs)
  const [speaking, setSpeaking] = useState(false)

  useEffect(() => {
    if (!supported) return
    const load = () => setVoices(window.speechSynthesis.getVoices())
    load()
    window.speechSynthesis.addEventListener?.('voiceschanged', load)
    return () => window.speechSynthesis.removeEventListener?.('voiceschanged', load)
  }, [supported])

  const setPrefs = useCallback((patch: Partial<VoicePrefs>) => {
    setPrefsState((prev) => {
      const nextVal = { ...prev, ...patch }
      try {
        localStorage.setItem(PREF_KEY, JSON.stringify(nextVal))
      } catch {
        /* ignore */
      }
      return nextVal
    })
  }, [])

  // The English voices worth offering in the picker.
  const englishVoices = voices.filter((v) => v.lang.toLowerCase().startsWith('en'))

  const pickVoice = useCallback((): SpeechSynthesisVoice | null => {
    const pool = englishVoices.length ? englishVoices : voices
    if (!pool.length) return null
    if (prefs.voiceURI) {
      const chosen = pool.find((v) => v.voiceURI === prefs.voiceURI)
      if (chosen) return chosen
    }
    for (const name of PREFERRED) {
      const v = pool.find((x) => x.name.includes(name))
      if (v) return v
    }
    return pool.find((v) => /female/i.test(v.name)) ?? pool[0]
  }, [englishVoices, voices, prefs.voiceURI])

  const stop = useCallback(() => {
    if (!supported) return
    window.speechSynthesis.cancel()
    setSpeaking(false)
  }, [supported])

  // `force` lets the Settings "Test voice" button play even while narration is off.
  const speak = useCallback(
    (text: string, opts?: { force?: boolean }) => {
      if (!supported || !text) return
      if (!prefs.enabled && !opts?.force) return
      window.speechSynthesis.cancel()
      const u = new SpeechSynthesisUtterance(text)
      const v = pickVoice()
      if (v) u.voice = v
      u.rate = prefs.rate
      u.pitch = 1.0
      u.onstart = () => setSpeaking(true)
      u.onend = () => setSpeaking(false)
      u.onerror = () => setSpeaking(false)
      window.speechSynthesis.speak(u)
    },
    [supported, prefs.enabled, prefs.rate, pickVoice],
  )

  // Stop any narration if the component using it unmounts.
  useEffect(() => stop, [stop])

  return { supported, voices: englishVoices, speaking, speak, stop, prefs, setPrefs }
}
