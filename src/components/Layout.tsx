import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import type { PartnerId } from '../types'
import Ambiance from './Ambiance'

const TABS = [
  { to: '/', label: 'Home', icon: '🏠', end: true },
  { to: '/games', label: 'Play', icon: '🎲' },
  { to: '/desires', label: 'Desires', icon: '💭' },
  { to: '/toys', label: 'Explore', icon: '✨' },
  { to: '/notes', label: 'Notes', icon: '💌' },
]

export default function Layout() {
  const { state, dispatch, cloud } = useStore()
  const navigate = useNavigate()
  const { accounts } = state.profile
  const active = state.activeUser
  const other: PartnerId = active === 'A' ? 'B' : 'A'

  const unread = state.notes.filter((n) => n.to === active && !n.read).length

  return (
    <div className="relative mx-auto flex min-h-full max-w-md flex-col">
      <Ambiance />
      {/* Top bar with active-user switcher */}
      <header className="sticky top-0 z-20 flex items-center justify-between px-5 py-3 backdrop-blur-md">
        <button
          onClick={() => navigate('/settings')}
          className="flex items-center gap-2 rounded-full bg-white/5 py-1.5 pl-1.5 pr-3 text-sm"
        >
          <span className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-lg">
            {accounts[active].emoji}
          </span>
          <span className="font-semibold text-white">
            {accounts[active].name || 'You'}
          </span>
        </button>

        {cloud ? (
          // Synced mode: your partner is on their own phone — just show who.
          <span className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 text-xs text-plum-100">
            <span className="text-base">{accounts[other].emoji}</span>
            <span>with {accounts[other].name || 'your partner'}</span>
          </span>
        ) : (
          // Shared-device mode: hand the phone over by switching the active user.
          <button
            onClick={() => dispatch({ type: 'SET_ACTIVE_USER', user: other })}
            className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 text-xs text-plum-100"
            title="Switch who's holding the phone"
          >
            <span>Switch to {accounts[other].name || 'partner'}</span>
            <span className="text-base">{accounts[other].emoji}</span>
            <span aria-hidden>⇄</span>
          </button>
        )}
      </header>

      <main className="relative z-10 flex-1 px-5 pb-28 pt-2">
        <Outlet />
      </main>

      {/* Bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-md">
        <div className="m-3 flex items-center justify-around rounded-3xl border border-white/10 bg-plum-950/80 px-2 py-2 backdrop-blur-xl">
          {TABS.map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              end={t.end}
              className={({ isActive }) =>
                `relative flex flex-1 flex-col items-center gap-0.5 rounded-2xl py-2 text-[11px] font-medium transition-colors ${
                  isActive ? 'text-white' : 'text-plum-300/60'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className="text-xl">{t.icon}</span>
                  <span>{t.label}</span>
                  {t.to === '/notes' && unread > 0 && (
                    <span className="absolute right-3 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-ember-500 px-1 text-[10px] font-bold text-white">
                      {unread}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute -bottom-0.5 h-1 w-6 rounded-full bg-gradient-to-r from-ember-400 to-plum-400" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
