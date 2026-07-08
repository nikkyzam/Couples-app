import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import type { Gift, GiftCategory } from '../types'
import { GIFTS, GIFT_CATEGORIES, PRICE_LABEL, giftShopUrl } from '../data/gifts'
import { Card, SectionTitle } from '../components/ui'

export default function Gifts() {
  const { state, dispatch } = useStore()
  const navigate = useNavigate()
  const [filter, setFilter] = useState<GiftCategory | 'all'>('all')

  const saved = state.giftList
  const isSaved = (id: string) => saved.includes(id)
  const toggle = (id: string) => dispatch({ type: 'TOGGLE_GIFT', id })

  const savedGifts = useMemo(
    () => GIFTS.filter((g) => saved.includes(g.id)),
    [saved],
  )

  const shown = useMemo(
    () => (filter === 'all' ? GIFTS : GIFTS.filter((g) => g.category === filter)),
    [filter],
  )

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/')} className="text-sm text-plum-300">
        ← Home
      </button>

      <SectionTitle
        eyebrow="Treat yourselves"
        title="Gifts"
        sub="Spoil each other. Heart the ones you both want, then shop when you're ready."
      />

      {/* Shared wishlist */}
      {savedGifts.length > 0 && (
        <div>
          <h2 className="mb-2 px-1 text-sm font-semibold uppercase tracking-widest text-ember-300">
            Your list ({savedGifts.length})
          </h2>
          <div className="space-y-2">
            {savedGifts.map((g) => (
              <Card key={g.id} className="flex items-center gap-3 !py-3">
                <span className="text-2xl">{g.emoji}</span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-white">{g.name}</p>
                  <p className="text-xs text-plum-300/70">{PRICE_LABEL[g.price]}</p>
                </div>
                <a
                  href={giftShopUrl(g)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-gradient-to-br from-ember-500 to-plum-500 px-4 py-2 text-sm font-semibold text-white"
                >
                  Shop →
                </a>
                <button
                  onClick={() => toggle(g.id)}
                  className="text-plum-300/60 hover:text-red-300"
                  title="Remove"
                >
                  ✕
                </button>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Category filter */}
      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setFilter('all')}
          className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
            filter === 'all' ? 'bg-white/15 text-white' : 'bg-white/5 text-plum-200/70'
          }`}
        >
          All
        </button>
        {GIFT_CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setFilter(c.id)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
              filter === c.id ? 'bg-white/15 text-white' : 'bg-white/5 text-plum-200/70'
            }`}
          >
            {c.emoji} {c.label}
          </button>
        ))}
      </div>

      {/* Catalog */}
      <div className="grid grid-cols-2 gap-3">
        {shown.map((g) => (
          <GiftCard key={g.id} gift={g} saved={isSaved(g.id)} onToggle={() => toggle(g.id)} />
        ))}
      </div>

      <p className="px-1 text-[11px] leading-relaxed text-plum-300/50">
        Tapping “Shop” opens a product search in your browser — purchases happen on
        that store, never inside Kindle. Your saved list stays private to your space.
      </p>
    </div>
  )
}

function GiftCard({
  gift,
  saved,
  onToggle,
}: {
  gift: Gift
  saved: boolean
  onToggle: () => void
}) {
  return (
    <div className="card-glass flex flex-col rounded-3xl p-4">
      <div className="flex items-start justify-between">
        <span className="text-3xl">{gift.emoji}</span>
        <button
          onClick={onToggle}
          className="text-xl"
          title={saved ? 'Remove from your list' : 'Add to your list'}
        >
          {saved ? '❤️' : '🤍'}
        </button>
      </div>
      <p className="mt-2 font-semibold text-white">{gift.name}</p>
      <p className="mt-0.5 flex-1 text-xs text-plum-200/70">{gift.blurb}</p>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs font-semibold text-plum-300/70">
          {PRICE_LABEL[gift.price]}
        </span>
        <a
          href={giftShopUrl(gift)}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/15"
        >
          Shop →
        </a>
      </div>
    </div>
  )
}
