import type { Prompt } from '../types'

// Every prompt is written so a couple can always "pass". Lower levels are
// safe for the most reserved partners; higher levels are only ever shown once
// a couple has explicitly opted into that comfort ceiling.

export const TRUTHS: Prompt[] = [
  { id: 't1', level: 1, category: 'connection', text: 'What was the exact moment you knew you were into me?' },
  { id: 't2', level: 1, category: 'connection', text: 'What is one small thing I do that makes you feel loved?' },
  { id: 't3', level: 1, category: 'connection', text: 'When did you last feel really proud of us as a couple?' },
  { id: 't4', level: 2, category: 'flirt', text: 'Whats the first thing you noticed about my body?' },
  { id: 't5', level: 2, category: 'flirt', text: 'Describe your ideal slow, lazy morning in bed with me.' },
  { id: 't6', level: 2, category: 'flirt', text: 'Whats an outfit of mine you secretly love seeing me in?' },
  { id: 't7', level: 3, category: 'touch', text: 'Where on your body do you most love being kissed?' },
  { id: 't8', level: 3, category: 'touch', text: 'Whats a type of touch you wish we did more often?' },
  { id: 't9', level: 3, category: 'touch', text: 'Whats your favorite memory of us being physically close?' },
  { id: 't10', level: 4, category: 'toys', text: 'Is there a toy youve been curious to try together but felt shy to mention?' },
  { id: 't11', level: 4, category: 'adventure', text: 'Whats a fantasy youve never said out loud to me?' },
  { id: 't12', level: 4, category: 'touch', text: 'Whats one thing I could do that would drive you wild?' },
  { id: 't13', level: 5, category: 'adventure', text: 'Whats the boldest thing youd want to try if nothing was off-limits?' },
  { id: 't14', level: 5, category: 'adventure', text: 'Describe, in detail, your dream night with me start to finish.' },
  { id: 't15', level: 5, category: 'toys', text: 'Which toy would you most want to introduce into our nights and why?' },
]

export const DARES: Prompt[] = [
  { id: 'd1', level: 1, category: 'connection', text: 'Give your partner a genuine, specific compliment while holding eye contact.' },
  { id: 'd2', level: 1, category: 'connection', text: 'Share a 20-second hug and notice how it feels.' },
  { id: 'd3', level: 1, category: 'flirt', text: 'Send your partner a flirty text right now, even from across the room.' },
  { id: 'd4', level: 2, category: 'flirt', text: 'Whisper something sweet and a little cheeky into your partners ear.' },
  { id: 'd5', level: 2, category: 'flirt', text: 'Slow dance together to one song, no phones.' },
  { id: 'd6', level: 2, category: 'touch', text: 'Give a two-minute hand or shoulder massage.' },
  { id: 'd7', level: 3, category: 'touch', text: 'Kiss your partner somewhere you dont usually — the neck, the wrist, the shoulder.' },
  { id: 'd8', level: 3, category: 'touch', text: 'Trace a slow line down your partners spine with your fingertips.' },
  { id: 'd9', level: 3, category: 'touch', text: 'Undress one item of your partners clothing, slowly.' },
  { id: 'd10', level: 4, category: 'touch', text: 'Guide your partners hand to show them exactly how you like to be touched.' },
  { id: 'd11', level: 4, category: 'toys', text: 'Pick a toy from the Toy Explorer youd both be curious to try tonight.' },
  { id: 'd12', level: 4, category: 'adventure', text: 'Blindfold your partner and surprise them with three different textures.' },
  { id: 'd13', level: 5, category: 'adventure', text: 'Take turns being fully in charge for the next ten minutes.' },
  { id: 'd14', level: 5, category: 'toys', text: 'Introduce a toy youve both said yes to and explore together, no rush.' },
  { id: 'd15', level: 5, category: 'adventure', text: 'Act out the opening scene of a shared fantasy.' },
]

// Would You Rather — two options, both playful.
export const WOULD_YOU_RATHER: Prompt[] = [
  { id: 'w1', level: 1, category: 'connection', text: 'a whole day of cuddling on the couch', altText: 'a spontaneous adventure out together' },
  { id: 'w2', level: 1, category: 'flirt', text: 'get a love note in your bag', altText: 'get a surprise good-morning kiss' },
  { id: 'w3', level: 2, category: 'flirt', text: 'a candlelit massage', altText: 'a long steamy shower together' },
  { id: 'w4', level: 2, category: 'flirt', text: 'me wearing your favorite outfit', altText: 'me whispering what Id do to you' },
  { id: 'w5', level: 3, category: 'touch', text: 'slow teasing all evening', altText: 'passionate and right now' },
  { id: 'w6', level: 3, category: 'touch', text: 'be the one giving', altText: 'be the one receiving' },
  { id: 'w7', level: 4, category: 'toys', text: 'explore a vibrator together', altText: 'explore a blindfold and feathers' },
  { id: 'w8', level: 4, category: 'adventure', text: 'try a new position', altText: 'try a new location in the house' },
  { id: 'w9', level: 5, category: 'toys', text: 'introduce a dildo to our play', altText: 'introduce a couples toy we both feel' },
  { id: 'w10', level: 5, category: 'adventure', text: 'act out my fantasy tonight', altText: 'act out your fantasy tonight' },
]
