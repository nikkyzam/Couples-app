import type { DesireItem } from '../types'

// The Yes / No / Maybe list — the safest way to discover shared interests.
// Each partner votes privately; the app only reveals the overlap. Nobody sees
// the other person's "no"s, so there is zero pressure to say yes to anything.
export const DESIRES: DesireItem[] = [
  { id: 'x1', label: 'Long, unhurried kissing', level: 1, category: 'connection' },
  { id: 'x2', label: 'Giving each other massages', level: 1, category: 'connection' },
  { id: 'x3', label: 'Cuddling naked with no expectations', level: 2, category: 'connection' },
  { id: 'x4', label: 'Flirty texts during the day', level: 2, category: 'flirt' },
  { id: 'x5', label: 'Showering or bathing together', level: 2, category: 'flirt' },
  { id: 'x6', label: 'A striptease (giving)', level: 3, category: 'flirt' },
  { id: 'x7', label: 'A striptease (watching)', level: 3, category: 'flirt' },
  { id: 'x8', label: 'Using a blindfold', level: 3, category: 'touch', toyId: 'blindfold' },
  { id: 'x9', label: 'Trying a bullet or small vibrator', level: 3, category: 'toys', toyId: 'bullet-vibe' },
  { id: 'x10', label: 'Light dirty talk', level: 3, category: 'touch' },
  { id: 'x11', label: 'Introducing a couples vibrator', level: 4, category: 'toys', toyId: 'couples-vibe' },
  { id: 'x12', label: 'Introducing a dildo', level: 4, category: 'toys', toyId: 'dildo' },
  { id: 'x13', label: 'Sharing a fantasy out loud', level: 4, category: 'adventure' },
  { id: 'x14', label: 'Trying a new position or location', level: 4, category: 'adventure' },
  { id: 'x15', label: 'Light restraints or being "in charge"', level: 5, category: 'adventure' },
  { id: 'x16', label: 'Using a wand massager together', level: 5, category: 'toys', toyId: 'wand' },
  { id: 'x17', label: 'Role play', level: 5, category: 'adventure' },
  { id: 'x18', label: 'Recording a private photo just for us', level: 5, category: 'adventure' },

  // Level 1 · Cozy
  { id: 'x19', label: 'Slow dancing together at home', level: 1, category: 'connection' },
  { id: 'x20', label: 'Falling asleep tangled up together', level: 1, category: 'connection' },
  { id: 'x21', label: 'Leaving each other flirty notes', level: 1, category: 'flirt' },

  // Level 2 · Flirty
  { id: 'x22', label: 'Sending each other a sexy selfie', level: 2, category: 'flirt' },
  { id: 'x23', label: 'A striptease set to music', level: 2, category: 'flirt' },
  { id: 'x24', label: 'Making out slowly, no rush', level: 2, category: 'flirt' },
  { id: 'x25', label: 'A full-body massage with oil', level: 2, category: 'touch', toyId: 'massage-oil' },

  // Level 3 · Warm
  { id: 'x26', label: 'Lots of teasing before anything more', level: 3, category: 'touch' },
  { id: 'x27', label: 'Being blindfolded and surprised', level: 3, category: 'touch', toyId: 'blindfold' },
  { id: 'x28', label: 'Whispered dirty talk in the moment', level: 3, category: 'touch' },
  { id: 'x29', label: 'Using a warming or tingling lube', level: 3, category: 'toys', toyId: 'warming-lube' },
  { id: 'x30', label: 'Watching each other undress slowly', level: 3, category: 'flirt' },

  // Level 4 · Spicy
  { id: 'x31', label: 'A remote or app-controlled vibrator', level: 4, category: 'toys', toyId: 'remote-vibe' },
  { id: 'x32', label: 'A vibrating ring we both feel', level: 4, category: 'toys', toyId: 'ring' },
  { id: 'x33', label: 'Trying a brand-new position', level: 4, category: 'adventure' },
  { id: 'x34', label: 'Somewhere other than the bedroom', level: 4, category: 'adventure' },
  { id: 'x35', label: 'One of us fully in charge', level: 4, category: 'touch' },

  // Level 5 · Adventurous
  { id: 'x36', label: 'Light bondage with soft cuffs or ties', level: 5, category: 'adventure' },
  { id: 'x37', label: 'Blindfold and restraints together', level: 5, category: 'adventure' },
  { id: 'x38', label: 'Using a wand massager together', level: 5, category: 'toys' },
  { id: 'x39', label: 'Acting out a specific role or fantasy', level: 5, category: 'adventure' },
  { id: 'x40', label: 'A little playful spanking', level: 5, category: 'adventure' },
  { id: 'x41', label: 'Gentle anal play, with plenty of lube', level: 5, category: 'toys' },
]
