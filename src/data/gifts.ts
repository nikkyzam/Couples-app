import type { Gift, GiftCategory } from '../types'

// "Treat Yourselves" — a curated catalog of intimate gift ideas a couple can buy
// for themselves. Each item links out to a retailer *search* (see types.ts) so
// links never break and no single store is hard-coded.

export const GIFT_CATEGORIES: { id: GiftCategory; label: string; emoji: string }[] = [
  { id: 'toy', label: 'Toys', emoji: '🎁' },
  { id: 'lingerie', label: 'Lingerie', emoji: '👙' },
  { id: 'sensory', label: 'Sensory', emoji: '🕯️' },
  { id: 'experience', label: 'Experiences', emoji: '✨' },
  { id: 'romance', label: 'Romance', emoji: '💐' },
]

export const GIFTS: Gift[] = [
  // ── Toys ──
  { id: 'g-vibe', name: 'Couples vibrator', emoji: '💗', category: 'toy', price: 2,
    blurb: 'A wearable, hands-free vibe designed to be worn together.', search: 'couples vibrator wearable' },
  { id: 'g-bullet', name: 'Bullet vibrator', emoji: '✨', category: 'toy', price: 1,
    blurb: 'Small, beginner-friendly, and endlessly versatile.', search: 'bullet vibrator beginner' },
  { id: 'g-ring', name: 'Vibrating ring', emoji: '💍', category: 'toy', price: 1,
    blurb: 'Buzzy fun that adds a little extra for both of you.', search: 'vibrating couples ring' },
  { id: 'g-wand', name: 'Massage wand', emoji: '🪄', category: 'toy', price: 3,
    blurb: 'A powerful wand — great for sensual massage and more.', search: 'personal massage wand' },

  // ── Lingerie ──
  { id: 'g-set', name: 'Lingerie set', emoji: '🩱', category: 'lingerie', price: 2,
    blurb: 'Something that makes you feel gorgeous the second it’s on.', search: 'lingerie set' },
  { id: 'g-robe', name: 'Silk robe', emoji: '🥻', category: 'lingerie', price: 2,
    blurb: 'Soft, slinky, and perfect for a slow reveal.', search: 'silk robe' },
  { id: 'g-boxers', name: 'Matching sleepwear', emoji: '🩳', category: 'lingerie', price: 1,
    blurb: 'His-and-hers loungewear for cozy nights in.', search: 'matching couples pajamas' },

  // ── Sensory ──
  { id: 'g-oil', name: 'Massage oil', emoji: '🫗', category: 'sensory', price: 1,
    blurb: 'Warming, edible-safe oil for long, unhurried massages.', search: 'sensual massage oil' },
  { id: 'g-candle', name: 'Massage candle', emoji: '🕯️', category: 'sensory', price: 1,
    blurb: 'Melts into warm oil — mood lighting and massage in one.', search: 'massage candle' },
  { id: 'g-blindfold', name: 'Soft blindfold', emoji: '🌙', category: 'sensory', price: 1,
    blurb: 'Take away sight, heighten every other sensation.', search: 'silk blindfold intimate' },
  { id: 'g-feather', name: 'Feather tickler', emoji: '🪶', category: 'sensory', price: 1,
    blurb: 'Feather-light teasing from head to toe.', search: 'feather tickler' },
  { id: 'g-silk', name: 'Silk ties', emoji: '🎀', category: 'sensory', price: 1,
    blurb: 'Gentle, beginner-friendly soft restraints.', search: 'soft silk restraints beginner' },

  // ── Experiences ──
  { id: 'g-massage', name: "Couples' massage", emoji: '💆', category: 'experience', price: 3,
    blurb: 'Book a side-by-side massage and unwind together.', search: 'couples massage near me gift' },
  { id: 'g-getaway', name: 'Weekend getaway', emoji: '🧳', category: 'experience', price: 3,
    blurb: 'A night away — new room, no distractions, just you two.', search: 'romantic weekend getaway hotel' },
  { id: 'g-class', name: 'Dance class', emoji: '💃', category: 'experience', price: 2,
    blurb: 'Learn something close and playful together.', search: 'couples dance class gift' },
  { id: 'g-cook', name: 'Cooking class', emoji: '🍝', category: 'experience', price: 2,
    blurb: 'A hands-on date night you can taste at the end.', search: 'couples cooking class' },
  { id: 'g-tasting', name: 'Wine tasting', emoji: '🍷', category: 'experience', price: 2,
    blurb: 'Sip, swirl, and flirt your way through the evening.', search: 'wine tasting experience gift' },

  // ── Romance ──
  { id: 'g-flowers', name: 'Flowers', emoji: '💐', category: 'romance', price: 1,
    blurb: 'A classic that never stops meaning something.', search: 'flower delivery' },
  { id: 'g-cards', name: 'Conversation cards', emoji: '🃏', category: 'romance', price: 1,
    blurb: 'Deep-questions and dares decks to keep opening up.', search: 'couples conversation card game' },
  { id: 'g-book', name: 'Photo book', emoji: '📖', category: 'romance', price: 2,
    blurb: 'Turn your favorite memories into something to hold.', search: 'custom photo book' },
  { id: 'g-jewelry', name: 'A little jewelry', emoji: '💎', category: 'romance', price: 3,
    blurb: 'Something small they’ll wear and think of you.', search: 'romantic jewelry gift' },
  { id: 'g-chocolate', name: 'Chocolates', emoji: '🍫', category: 'romance', price: 1,
    blurb: 'Sweet, simple, and made for sharing in bed.', search: 'luxury chocolate gift box' },
]

// Build a neutral shopping-search URL for a gift (Google Shopping — aggregates
// many retailers, so we don't endorse or hard-link any single store).
export function giftShopUrl(gift: Gift): string {
  return `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(gift.search)}`
}

export const PRICE_LABEL: Record<1 | 2 | 3, string> = { 1: '$', 2: '$$', 3: '$$$' }
