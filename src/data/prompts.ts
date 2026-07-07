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

  // Level 1 · Cozy
  { id: 't16', level: 1, category: 'connection', text: 'When recently did you feel the closest to me?' },
  { id: 't17', level: 1, category: 'connection', text: 'Whats something I do that always makes you smile?' },
  { id: 't18', level: 1, category: 'connection', text: 'Whats the first thing that made you trust me?' },
  { id: 't19', level: 1, category: 'connection', text: 'Whats a little memory of us you find yourself replaying?' },
  { id: 't20', level: 1, category: 'connection', text: 'Whats one way Im different with you than with anyone else?' },

  // Level 2 · Flirty
  { id: 't21', level: 2, category: 'flirt', text: 'Whats the sexiest thing about the way I move?' },
  { id: 't22', level: 2, category: 'flirt', text: 'When did you last catch yourself checking me out?' },
  { id: 't23', level: 2, category: 'flirt', text: 'Whats something attractive I do without even realizing it?' },
  { id: 't24', level: 2, category: 'flirt', text: 'If you could kiss me anywhere right now, where would it be?' },
  { id: 't25', level: 2, category: 'flirt', text: 'Whats a look Ive given you that stuck with you?' },

  // Level 3 · Warm
  { id: 't26', level: 3, category: 'touch', text: 'What kind of kiss do you crave most from me?' },
  { id: 't27', level: 3, category: 'touch', text: 'Wheres a spot you love being touched that I might not know about?' },
  { id: 't28', level: 3, category: 'touch', text: 'Whats a reaction of mine you love drawing out of me?' },
  { id: 't29', level: 3, category: 'touch', text: 'Whats a moment between us you wish had lasted longer?' },
  { id: 't30', level: 3, category: 'touch', text: 'Whats something slow and gentle Id do that would melt you?' },

  // Level 4 · Spicy
  { id: 't31', level: 4, category: 'adventure', text: 'Whats a fantasy youd be nervous but excited to share with me?' },
  { id: 't32', level: 4, category: 'touch', text: 'Whats a part of your body you wish I paid more attention to?' },
  { id: 't33', level: 4, category: 'toys', text: 'What sensation are you most curious to try — buzzing, teasing, or warming?' },
  { id: 't34', level: 4, category: 'adventure', text: 'Is there a role or scenario youve imagined us playing out?' },
  { id: 't35', level: 4, category: 'flirt', text: 'Whats the naughtiest thought youve had about me this week?' },

  // Level 5 · Adventurous
  { id: 't36', level: 5, category: 'adventure', text: 'Whats something youve always wanted to ask for but havent yet?' },
  { id: 't37', level: 5, category: 'toys', text: 'How exactly would you want us to use a toy on you?' },
  { id: 't38', level: 5, category: 'adventure', text: 'Describe a fantasy where youre completely in control of me.' },
  { id: 't39', level: 5, category: 'adventure', text: 'Describe a fantasy where you hand all the control to me.' },
  { id: 't40', level: 5, category: 'adventure', text: 'Whats the wildest place youve imagined being with me?' },
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

  // Level 1 · Cozy
  { id: 'd16', level: 1, category: 'connection', text: 'Tell your partner three things you adore about them.' },
  { id: 'd17', level: 1, category: 'connection', text: 'Hold hands and share the best part of your day.' },
  { id: 'd18', level: 1, category: 'flirt', text: 'Give your partner your best playful wink and a compliment.' },
  { id: 'd19', level: 1, category: 'connection', text: 'Look into each others eyes for 30 seconds without a word.' },
  { id: 'd20', level: 1, category: 'flirt', text: 'Send an emoji-only text that says how they make you feel.' },

  // Level 2 · Flirty
  { id: 'd21', level: 2, category: 'flirt', text: 'Describe your partner using three sexy adjectives, out loud.' },
  { id: 'd22', level: 2, category: 'touch', text: 'Play with your partners hair for a full minute.' },
  { id: 'd23', level: 2, category: 'flirt', text: 'Whisper the first thing youd do if you were suddenly alone.' },
  { id: 'd24', level: 2, category: 'touch', text: 'Give your partner a slow, lingering kiss on the forehead, then the lips.' },
  { id: 'd25', level: 2, category: 'flirt', text: 'Take one photo of your partner looking irresistible and show them.' },

  // Level 3 · Warm
  { id: 'd26', level: 3, category: 'touch', text: 'Kiss slowly up your partners arm, from wrist to shoulder.' },
  { id: 'd27', level: 3, category: 'touch', text: 'Give a two-minute massage anywhere your partner chooses.' },
  { id: 'd28', level: 3, category: 'touch', text: 'Trail soft, slow kisses along your partners neck.' },
  { id: 'd29', level: 3, category: 'touch', text: 'Breathe softly against your partners ear, then whisper something warm.' },
  { id: 'd30', level: 3, category: 'flirt', text: 'Undo one more button or strap than usual — teasingly slow.' },

  // Level 4 · Spicy
  { id: 'd31', level: 4, category: 'touch', text: 'Guide your partners hands over you and show them your favorite pace.' },
  { id: 'd32', level: 4, category: 'toys', text: 'Pick a toy from Explore and describe exactly how youd want to try it.' },
  { id: 'd33', level: 4, category: 'adventure', text: 'Blindfold your partner and surprise them with a taste and a touch.' },
  { id: 'd34', level: 4, category: 'touch', text: 'Kiss your partner somewhere new and watch how they respond.' },
  { id: 'd35', level: 4, category: 'adventure', text: 'Take charge and tell your partner one thing to do to you.' },

  // Level 5 · Adventurous
  { id: 'd36', level: 5, category: 'adventure', text: 'Swap roles: whoever is usually shy leads for five minutes.' },
  { id: 'd37', level: 5, category: 'toys', text: 'Bring in a toy you both said yes to and let your partner guide it.' },
  { id: 'd38', level: 5, category: 'adventure', text: 'Act out the first two minutes of a shared fantasy together.' },
  { id: 'd39', level: 5, category: 'adventure', text: 'Give your partner three whispered commands and let them pick one.' },
  { id: 'd40', level: 5, category: 'adventure', text: 'Tell your partner, in detail, exactly what you want to happen next.' },
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
