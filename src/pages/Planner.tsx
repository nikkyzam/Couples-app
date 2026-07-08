import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import type { CyclePlan, DatePlan, PartnerId } from '../types'
import { Button, Card, SectionTitle } from '../components/ui'
import { cycleInfo, PHASE_META, prettyDate, todayISO } from '../lib/cycle'

const IDEAS = [
  'Date night 🕯️',
  'Slow morning in bed',
  'Try something new',
  'Whisper game 🫦',
  'Long massage',
  'Shower together',
  'Weekend getaway',
]

function sortKey(p: DatePlan) {
  return `${p.date} ${p.time || '99:99'}`
}

export default function Planner() {
  const { state, dispatch } = useStore()
  const navigate = useNavigate()
  const me = state.activeUser
  const names = state.profile.accounts

  // ── Sex / date schedule ──────────────────────────────────────────────
  const [adding, setAdding] = useState(false)
  const [date, setDate] = useState(todayISO())
  const [time, setTime] = useState('')
  const [title, setTitle] = useState('')
  const [note, setNote] = useState('')

  const { upcoming, past } = useMemo(() => {
    const sorted = [...state.plans].sort((a, b) => sortKey(a).localeCompare(sortKey(b)))
    const today = todayISO()
    return {
      upcoming: sorted.filter((p) => !p.done && p.date >= today),
      past: sorted.filter((p) => p.done || p.date < today).reverse(),
    }
  }, [state.plans])

  function addPlan() {
    if (!title.trim() || !date) return
    const plan: DatePlan = {
      id: crypto.randomUUID(),
      date,
      time: time || undefined,
      title: title.trim(),
      note: note.trim() || undefined,
      done: false,
      createdBy: me,
    }
    dispatch({ type: 'ADD_PLAN', plan })
    setTitle('')
    setNote('')
    setTime('')
    setDate(todayISO())
    setAdding(false)
  }

  // ── Cycle ────────────────────────────────────────────────────────────
  const [editingCycle, setEditingCycle] = useState(false)
  const [owner, setOwner] = useState<PartnerId>(state.cycle?.owner ?? me)
  const [lastStart, setLastStart] = useState(state.cycle?.lastStart ?? todayISO())
  const [cycleLength, setCycleLength] = useState(String(state.cycle?.cycleLength ?? 28))
  const [periodLength, setPeriodLength] = useState(String(state.cycle?.periodLength ?? 5))

  function saveCycle() {
    const c: CyclePlan = {
      lastStart,
      cycleLength: Number(cycleLength) || 28,
      periodLength: Number(periodLength) || 5,
      owner,
    }
    dispatch({ type: 'SET_CYCLE', cycle: c })
    setEditingCycle(false)
  }

  const info = state.cycle ? cycleInfo(state.cycle) : null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/')} className="text-sm text-plum-300">
          ← Home
        </button>
      </div>

      <SectionTitle
        eyebrow="Plan your time together"
        title="Planner"
        sub="Schedule your moments, and keep an eye on the rhythm of the month."
      />

      {/* ─── Sex / date schedule ─── */}
      <div>
        <div className="mb-3 flex items-center justify-between px-1">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-ember-300">
            Your schedule
          </h2>
          <button
            onClick={() => setAdding((v) => !v)}
            className="rounded-full bg-white/10 px-3 py-1 text-sm font-semibold text-white"
          >
            {adding ? 'Close' : '+ Plan'}
          </button>
        </div>

        {adding && (
          <Card className="mb-3 space-y-3">
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-xs text-plum-300">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-white focus:border-ember-400 focus:outline-none"
                />
              </div>
              <div className="w-28">
                <label className="text-xs text-plum-300">Time</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-white focus:border-ember-400 focus:outline-none"
                />
              </div>
            </div>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's the plan?"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-plum-300/50 focus:border-ember-400 focus:outline-none"
            />
            <div className="no-scrollbar flex gap-2 overflow-x-auto">
              {IDEAS.map((idea) => (
                <button
                  key={idea}
                  onClick={() => setTitle(idea)}
                  className="shrink-0 rounded-full bg-white/5 px-3 py-1.5 text-xs text-plum-100 hover:bg-white/10"
                >
                  {idea}
                </button>
              ))}
            </div>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note (optional)"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-plum-300/50 focus:border-ember-400 focus:outline-none"
            />
            <Button className="w-full" onClick={addPlan} disabled={!title.trim() || !date}>
              Add to schedule
            </Button>
          </Card>
        )}

        {upcoming.length === 0 && !adding && (
          <Card className="text-center text-sm text-plum-200/70">
            Nothing planned yet. Tap <span className="font-semibold text-white">+ Plan</span> to
            put something on the calendar to look forward to. 💞
          </Card>
        )}

        <div className="space-y-2">
          {upcoming.map((p) => (
            <PlanRow key={p.id} plan={p} names={names} dispatch={dispatch} />
          ))}
        </div>

        {past.length > 0 && (
          <details className="mt-3">
            <summary className="cursor-pointer px-1 text-xs text-plum-300/70">
              Past &amp; done ({past.length})
            </summary>
            <div className="mt-2 space-y-2">
              {past.map((p) => (
                <PlanRow key={p.id} plan={p} names={names} dispatch={dispatch} muted />
              ))}
            </div>
          </details>
        )}
      </div>

      {/* ─── Cycle ─── */}
      <div>
        <h2 className="mb-3 px-1 text-sm font-semibold uppercase tracking-widest text-ember-300">
          Cycle
        </h2>

        {info && state.cycle && !editingCycle ? (
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-white">
                  {PHASE_META[info.phase].emoji} {PHASE_META[info.phase].label}
                </p>
                <p className="text-sm text-plum-200/80">Day {info.cycleDay} of the cycle</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-plum-300/70">Next period</p>
                <p className="font-semibold text-white">
                  {info.daysUntilNextPeriod === 0
                    ? 'Today'
                    : `in ${info.daysUntilNextPeriod}d`}
                </p>
                <p className="text-xs text-plum-300/60">{prettyDate(info.nextPeriodDate)}</p>
              </div>
            </div>

            <p className="rounded-2xl bg-white/5 px-3 py-2 text-sm text-plum-100">
              {PHASE_META[info.phase].blurb}
            </p>

            <div className="text-xs text-plum-300/70">
              <span className="font-semibold text-plum-100">Fertile window (estimate):</span>{' '}
              {prettyDate(info.fertileStart)} – {prettyDate(info.fertileEnd)}
              {state.cycle.owner && (
                <>
                  {' · '}
                  {names[state.cycle.owner].emoji}{' '}
                  {names[state.cycle.owner].name || `Partner ${state.cycle.owner}`}’s cycle
                </>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                className="flex-1"
                onClick={() =>
                  dispatch({
                    type: 'SET_CYCLE',
                    cycle: { ...state.cycle!, lastStart: todayISO() },
                  })
                }
              >
                🩸 Period started today
              </Button>
              <Button
                variant="soft"
                onClick={() => {
                  setOwner(state.cycle!.owner ?? me)
                  setLastStart(state.cycle!.lastStart)
                  setCycleLength(String(state.cycle!.cycleLength))
                  setPeriodLength(String(state.cycle!.periodLength))
                  setEditingCycle(true)
                }}
              >
                Edit
              </Button>
            </div>

            <p className="text-[11px] leading-relaxed text-plum-300/50">
              These predictions are estimates for awareness and planning — they are not
              a form of birth control. Everything stays private to your space.
            </p>
          </Card>
        ) : (
          <Card className="space-y-3">
            {!state.cycle && !editingCycle && (
              <p className="text-sm text-plum-200/80">
                Optionally track the cycle so you both know what to expect — energy,
                comfort, and timing. It’s private to your space and easy to turn off.
              </p>
            )}

            <div>
              <label className="text-xs text-plum-300">Whose cycle?</label>
              <div className="mt-1 flex gap-2">
                {(['A', 'B'] as PartnerId[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setOwner(p)}
                    className={`flex-1 rounded-2xl py-2 text-sm font-semibold transition ${
                      owner === p
                        ? 'bg-gradient-to-br from-ember-500 to-plum-500 text-white'
                        : 'bg-white/5 text-plum-100 hover:bg-white/10'
                    }`}
                  >
                    {names[p].emoji} {names[p].name || `Partner ${p}`}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-plum-300">First day of the last period</label>
              <input
                type="date"
                value={lastStart}
                max={todayISO()}
                onChange={(e) => setLastStart(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-white focus:border-ember-400 focus:outline-none"
              />
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-xs text-plum-300">Cycle length (days)</label>
                <input
                  type="number"
                  inputMode="numeric"
                  min={15}
                  max={60}
                  value={cycleLength}
                  onChange={(e) => setCycleLength(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-white focus:border-ember-400 focus:outline-none"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-plum-300">Period length (days)</label>
                <input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={14}
                  value={periodLength}
                  onChange={(e) => setPeriodLength(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-white focus:border-ember-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button className="flex-1" onClick={saveCycle} disabled={!lastStart}>
                Save cycle
              </Button>
              {state.cycle && (
                <Button
                  variant="danger"
                  onClick={() => {
                    dispatch({ type: 'SET_CYCLE', cycle: null })
                    setEditingCycle(false)
                  }}
                >
                  Turn off
                </Button>
              )}
              {editingCycle && state.cycle && (
                <Button variant="soft" onClick={() => setEditingCycle(false)}>
                  Cancel
                </Button>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}

function PlanRow({
  plan,
  names,
  dispatch,
  muted,
}: {
  plan: DatePlan
  names: ReturnType<typeof useStore>['state']['profile']['accounts']
  dispatch: ReturnType<typeof useStore>['dispatch']
  muted?: boolean
}) {
  return (
    <Card className={`flex items-center gap-3 !py-3 ${muted ? 'opacity-60' : ''}`}>
      <button
        onClick={() => dispatch({ type: 'TOGGLE_PLAN_DONE', id: plan.id })}
        className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border text-sm ${
          plan.done
            ? 'border-ember-400 bg-ember-500/30 text-white'
            : 'border-white/20 text-transparent'
        }`}
        title={plan.done ? 'Mark not done' : 'Mark done'}
      >
        ✓
      </button>
      <div className="min-w-0 flex-1">
        <p className={`font-semibold text-white ${plan.done ? 'line-through' : ''}`}>
          {plan.title}
        </p>
        <p className="text-xs text-plum-300/70">
          {prettyDate(plan.date)}
          {plan.time ? ` · ${plan.time}` : ''}
          {plan.createdBy ? ` · ${names[plan.createdBy].emoji}` : ''}
        </p>
        {plan.note && <p className="mt-0.5 truncate text-xs text-plum-200/70">{plan.note}</p>}
      </div>
      <button
        onClick={() => dispatch({ type: 'DELETE_PLAN', id: plan.id })}
        className="shrink-0 text-plum-300/50 hover:text-red-300"
        title="Delete"
      >
        ✕
      </button>
    </Card>
  )
}
