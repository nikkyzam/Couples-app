import { useNavigate } from 'react-router-dom'
import { SectionTitle, Card } from '../components/ui'

// A warm, communication-first guide oriented around her pleasure and climax.
// Educational and body-positive — the throughline is: slow down, focus on the
// clitoris, keep talking, and let her guide.
const CHAPTERS = [
  {
    emoji: '🗣️',
    title: 'It starts with talking',
    body: 'The single biggest predictor of her pleasure is feeling safe and heard. Ask what she likes and actually listen. "Show me" and "tell me what feels good" are the most powerful phrases you have.',
    points: [
      'Ask, then follow her lead — she is the expert on her body',
      'No performance pressure: an orgasm is never owed or a test',
      'Check in out loud: "more of that?", "softer?", "right there?"',
    ],
  },
  {
    emoji: '🕰️',
    title: 'Go slower, warm up longer',
    body: 'Most women need far more warm-up than porn suggests — often 20 minutes or more. Rushing to the main event is the #1 mistake. Build anticipation everywhere else first.',
    points: [
      'Kissing, necks, thighs, everywhere but the obvious — build the tension',
      'Tease and retreat; anticipation is its own kind of pleasure',
      'Arousal makes everything feel better, so let it build fully',
    ],
  },
  {
    emoji: '💎',
    title: 'The clitoris is the headline',
    body: 'For most women, clitoral stimulation is how orgasm happens — with or without penetration. It is sensitive, so start gentle and let her tell you how much pressure and speed feels right.',
    points: [
      'Start light and slow, then build with her feedback',
      'Consistency matters — when something works, keep doing that',
      'Combine with penetration if she likes it; both together is powerful',
    ],
  },
  {
    emoji: '✨',
    title: 'Let toys do the heavy lifting',
    body: 'A vibrator or wand can give a steady, powerful sensation hands simply can\'t match — and using one together is a gift, not a replacement for you. It is one of the most reliable paths to her climax.',
    points: [
      'A wand or bullet vibrator on the clitoris is a reliable route',
      'Use it together — hold it for her, or let her guide your hand',
      'Plenty of water-based lubricant makes everything better',
    ],
  },
  {
    emoji: '🌊',
    title: 'Near the edge: stay steady',
    body: 'As she gets close, the instinct to change things up backfires. Keep the same rhythm, pressure, and spot. This is the moment to be boringly consistent — don\'t stop, don\'t speed up unless she asks.',
    points: [
      'Do not change what\'s working right as she approaches',
      'Keep breathing together and stay connected',
      'If it fades, ease off and rebuild — there is no rush',
    ],
  },
  {
    emoji: '🫶',
    title: 'Afterward matters too',
    body: 'The clitoris can be very sensitive right after, so ease off gently. Hold her, talk, and enjoy the closeness. Great sex is a loop — the warmth afterward makes the next time even better.',
    points: [
      'Gentle after climax — soften your touch',
      'Cuddle and stay present; aftercare builds trust',
      'Celebrate what worked so you both remember it',
    ],
  },
]

export default function Pleasure() {
  const navigate = useNavigate()
  return (
    <div>
      <button onClick={() => navigate(-1)} className="mb-2 text-sm text-plum-300">
        ← Back
      </button>
      <SectionTitle
        eyebrow="Her pleasure, together"
        title="The Climax Guide"
        sub="A gentle, judgment-free playbook for helping her finish feeling amazing — built on communication, patience, and paying attention."
      />

      <div className="space-y-4">
        {CHAPTERS.map((c, i) => (
          <Card key={i} className="animate-float-in">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/5 text-2xl">
                {c.emoji}
              </span>
              <div>
                <p className="text-xs text-ember-300">Step {i + 1}</p>
                <h3 className="text-lg font-bold text-white">{c.title}</h3>
              </div>
            </div>
            <p className="mt-3 text-sm text-plum-100/90">{c.body}</p>
            <ul className="mt-3 space-y-1.5">
              {c.points.map((p, j) => (
                <li key={j} className="flex gap-2 text-sm text-plum-100">
                  <span className="text-ember-400">•</span> {p}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>

      <p className="mt-6 px-2 text-center text-xs text-plum-300/50">
        Every body is different — treat this as a starting point, not a rulebook.
        The best guide in the room is always her.
      </p>
    </div>
  )
}
