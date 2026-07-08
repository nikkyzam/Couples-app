import { Navigate, Route, Routes } from 'react-router-dom'
import { useStore } from './store'
import Layout from './components/Layout'
import Onboarding from './pages/Onboarding'
import Home from './pages/Home'
import Games from './pages/Games'
import TruthOrDare from './pages/TruthOrDare'
import WouldYouRather from './pages/WouldYouRather'
import DesireDeck from './pages/DesireDeck'
import Whisper from './pages/Whisper'
import Dice from './pages/Dice'
import Desires from './pages/Desires'
import Toys from './pages/Toys'
import DateNight from './pages/DateNight'
import Notes from './pages/Notes'
import NewNote from './pages/NewNote'
import Pleasure from './pages/Pleasure'
import Planner from './pages/Planner'
import Gifts from './pages/Gifts'
import Settings from './pages/Settings'

export default function App() {
  const { state } = useStore()

  if (!state.profile.onboarded) {
    return (
      <Routes>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="*" element={<Navigate to="/onboarding" replace />} />
      </Routes>
    )
  }

  return (
    <Routes>
      <Route path="/onboarding" element={<Navigate to="/" replace />} />
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/games" element={<Games />} />
        <Route path="/games/dare" element={<TruthOrDare />} />
        <Route path="/games/wyr" element={<WouldYouRather />} />
        <Route path="/games/deck" element={<DesireDeck />} />
        <Route path="/games/whisper" element={<Whisper />} />
        <Route path="/games/dice" element={<Dice />} />
        <Route path="/desires" element={<Desires />} />
        <Route path="/toys" element={<Toys />} />
        <Route path="/date-night" element={<DateNight />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/notes/new" element={<NewNote />} />
        <Route path="/pleasure" element={<Pleasure />} />
        <Route path="/planner" element={<Planner />} />
        <Route path="/gifts" element={<Gifts />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
