/* ============================================================
   Holistic — data tables
   All static reference content. No logic here.
   ============================================================ */
(function (root) {
  'use strict';

  var NUMEROLOGY = {
    1:  { name: 'The Initiator', trait: 'Leadership, initiative, independence', element: 'Fire',
          strengths: 'Starts things, decides fast, leads from the front',
          watch: 'Impatience, doing everything alone', colour: '#f59e0b' },
    2:  { name: 'The Diplomat', trait: 'Cooperation, balance, partnership', element: 'Water',
          strengths: 'Reads a room, mediates, holds relationships together',
          watch: 'Over-accommodating, avoiding conflict', colour: '#14b8a6' },
    3:  { name: 'The Expressor', trait: 'Creativity, communication, play', element: 'Air',
          strengths: 'Explains, entertains, finds the words',
          watch: 'Scatter, starting more than finishing', colour: '#f43f5e' },
    4:  { name: 'The Builder', trait: 'Structure, systems, reliability', element: 'Earth',
          strengths: 'Builds what lasts, keeps promises, plans',
          watch: 'Rigidity, resistance to change', colour: '#84cc16' },
    5:  { name: 'The Explorer', trait: 'Change, freedom, adaptability', element: 'Air',
          strengths: 'Adapts fast, curious, comfortable with uncertainty',
          watch: 'Restlessness, leaving before the payoff', colour: '#0ea5e9' },
    6:  { name: 'The Caretaker', trait: 'Service, harmony, responsibility', element: 'Water',
          strengths: 'Notices what people need, carries others well',
          watch: 'Over-responsibility, self-neglect', colour: '#8b5cf6' },
    7:  { name: 'The Analyst', trait: 'Depth, inquiry, solitude', element: 'Fire',
          strengths: 'Goes deep, questions the obvious, researches',
          watch: 'Withdrawal, analysis instead of action', colour: '#6366f1' },
    8:  { name: 'The Executive', trait: 'Power, material result, scale', element: 'Earth',
          strengths: 'Drives outcomes, negotiates, builds leverage',
          watch: 'Overwork, measuring worth by output', colour: '#eab308' },
    9:  { name: 'The Closer', trait: 'Completion, perspective, release', element: 'Water',
          strengths: 'Sees the whole, finishes, teaches what was learned',
          watch: 'Carrying old weight, hard to let go', colour: '#a78bfa' },
    11: { name: 'The Intuitive', trait: 'Insight, signal, teaching', element: 'Fire + Water',
          strengths: 'Reads what is unsaid, pattern-spots early',
          watch: 'Overwhelm, sensitivity read as weakness', colour: '#f472b6' },
    22: { name: 'The Architect', trait: 'Vision at scale, systems', element: 'All',
          strengths: 'Turns a long view into a working structure',
          watch: 'Pressure of the standard, paralysis by scope', colour: '#22d3ee' }
  };

  var ZODIAC = {
    Aries:       { symbol: '\u2648', element: 'Fire',  dates: 'Mar 21 – Apr 19', modality: 'Cardinal', trait: 'Courageous, direct, fast to act' },
    Taurus:      { symbol: '\u2649', element: 'Earth', dates: 'Apr 20 – May 20', modality: 'Fixed',    trait: 'Steady, sensory, hard to rush' },
    Gemini:      { symbol: '\u264A', element: 'Air',   dates: 'May 21 – Jun 20', modality: 'Mutable',  trait: 'Curious, quick, many threads' },
    Cancer:      { symbol: '\u264B', element: 'Water', dates: 'Jun 21 – Jul 22', modality: 'Cardinal', trait: 'Protective, intuitive, loyal' },
    Leo:         { symbol: '\u264C', element: 'Fire',  dates: 'Jul 23 – Aug 22', modality: 'Fixed',    trait: 'Warm, visible, generous' },
    Virgo:       { symbol: '\u264D', element: 'Earth', dates: 'Aug 23 – Sep 22', modality: 'Mutable',  trait: 'Precise, useful, improving' },
    Libra:       { symbol: '\u264E', element: 'Air',   dates: 'Sep 23 – Oct 22', modality: 'Cardinal', trait: 'Fair, relational, aesthetic' },
    Scorpio:     { symbol: '\u264F', element: 'Water', dates: 'Oct 23 – Nov 21', modality: 'Fixed',    trait: 'Intense, private, committed' },
    Sagittarius: { symbol: '\u2650', element: 'Fire',  dates: 'Nov 22 – Dec 21', modality: 'Mutable',  trait: 'Restless, philosophical, blunt' },
    Capricorn:   { symbol: '\u2651', element: 'Earth', dates: 'Dec 22 – Jan 19', modality: 'Cardinal', trait: 'Long game, disciplined, dry' },
    Aquarius:    { symbol: '\u2652', element: 'Air',   dates: 'Jan 20 – Feb 18', modality: 'Fixed',    trait: 'Systems-minded, detached, original' },
    Pisces:      { symbol: '\u2653', element: 'Water', dates: 'Feb 19 – Mar 20', modality: 'Mutable',  trait: 'Absorbent, imaginative, porous' }
  };

  var ELEMENT_NOTE = {
    Fire:  'action, momentum and visibility',
    Earth: 'structure, patience and tangible result',
    Air:   'language, ideas and connection',
    Water: 'feeling, memory and intuition'
  };

  var MOON_PHASES = [
    { name: 'New Moon',        icon: '\uD83C\uDF11', energy: 'Low',        note: 'Start quietly. Set the intention, skip the launch.' },
    { name: 'Waxing Crescent', icon: '\uD83C\uDF12', energy: 'Building',   note: 'First push. Momentum is cheap now.' },
    { name: 'First Quarter',   icon: '\uD83C\uDF13', energy: 'Friction',   note: 'Resistance shows up. Push through or re-plan.' },
    { name: 'Waxing Gibbous',  icon: '\uD83C\uDF14', energy: 'Strong',     note: 'Refine. Details decide the outcome.' },
    { name: 'Full Moon',       icon: '\uD83C\uDF15', energy: 'Peak',       note: 'Visible, emotional, hard to hide. Good for decisions.' },
    { name: 'Waning Gibbous',  icon: '\uD83C\uDF16', energy: 'Sharing',    note: 'Teach it, hand it over, say thank you.' },
    { name: 'Last Quarter',    icon: '\uD83C\uDF17', energy: 'Releasing',  note: 'Cut what is finished. Do not start new weight.' },
    { name: 'Waning Crescent', icon: '\uD83C\uDF18', energy: 'Resting',    note: 'Recover. Low output is correct here.' }
  ];

  var BIORHYTHM = {
    physical:     { label: 'Physical',     cycle: 23, colour: '#f43f5e', high: 'Body is with you — train, travel, do the physical thing', low: 'Recover. Force now costs twice as much tomorrow' },
    emotional:    { label: 'Emotional',    cycle: 28, colour: '#8b5cf6', high: 'Steady enough for hard conversations', low: 'Thin skin. Delay the confrontation if you can' },
    intellectual: { label: 'Intellectual', cycle: 33, colour: '#14b8a6', high: 'Clear head — take on the complex problem', low: 'Fog. Do routine work, not decisions' }
  };

  var TAROT = [
    { name: 'The Fool',           meaning: 'A beginning with no map. Go, but travel light.' },
    { name: 'The Magician',       meaning: 'You already have the tools. Stop gathering, start doing.' },
    { name: 'The High Priestess', meaning: 'The answer is known and unspoken. Wait before acting.' },
    { name: 'The Empress',        meaning: 'Growth through care, not force. Feed what is already planted.' },
    { name: 'The Emperor',        meaning: 'Structure now. Decide the rule before the exception.' },
    { name: 'The Hierophant',     meaning: 'Learn from the tradition before you break it.' },
    { name: 'The Lovers',         meaning: 'A choice between values, not between people.' },
    { name: 'The Chariot',        meaning: 'Two forces, one direction. Hold the reins deliberately.' },
    { name: 'Strength',           meaning: 'Soft control beats force. Patience is the strategy.' },
    { name: 'The Hermit',         meaning: 'Withdraw to see it clearly. Solitude is the tool.' },
    { name: 'Wheel of Fortune',   meaning: 'The cycle turns without asking. Work with the season.' },
    { name: 'Justice',            meaning: 'Cause and effect are aligned. Be accurate, not nice.' },
    { name: 'The Hanged Man',     meaning: 'Stop pushing. The shift comes from a change of angle.' },
    { name: 'Death',              meaning: 'Something has finished. Let it, or it will finish itself.' },
    { name: 'Temperance',         meaning: 'Blend, don\'t choose. The middle is the answer.' },
    { name: 'The Devil',          meaning: 'A chain you are holding yourself. Check who has the key.' },
    { name: 'The Tower',          meaning: 'What falls was load-bearing and wrong. Rebuild smaller.' },
    { name: 'The Star',           meaning: 'Repair after damage. Small honest steps restore the ground.' },
    { name: 'The Moon',           meaning: 'You are guessing and calling it knowing. Verify.' },
    { name: 'The Sun',            meaning: 'Clear, visible, good. Say the thing out loud.' },
    { name: 'Judgement',          meaning: 'A reckoning you have been avoiding. Answer the call.' },
    { name: 'The World',          meaning: 'Complete. Close the loop before starting the next one.' }
  ];

  var TRIGRAMS = [
    { name: 'The Creative',  meaning: 'Heaven over Heaven. Pure initiative — begin, do not deliberate.' },
    { name: 'The Receptive', meaning: 'Earth over Earth. Yield and support. Strength is in following.' },
    { name: 'The Arousing',  meaning: 'Thunder. A shock that starts movement. Act in the first moment.' },
    { name: 'The Gentle',    meaning: 'Wind. Steady, persistent influence beats a single push.' },
    { name: 'The Abysmal',   meaning: 'Water. Danger, and the way through is to keep moving.' },
    { name: 'The Clinging',  meaning: 'Fire. Clarity and dependence. Illuminate, do not burn.' },
    { name: 'Stillness',     meaning: 'Mountain. Stop. Stillness is the action required.' },
    { name: 'The Joyous',    meaning: 'Lake. Openness and exchange. Speak, share, enjoy.' }
  ];

  var ORACLE_8 = [
    'Yes, and sooner than you think', 'It is already decided — go', 'Yes, but not the way you planned',
    'Strong yes', 'Yes, if you ask directly', 'Likely, keep moving', 'Good signs, weak evidence',
    'Yes — with conditions you already know', 'Yes', 'Not yet — you are missing a fact',
    'Ask again after you have done the reading', 'The answer is not yours to give',
    'Cannot read it — the question is wrong', 'No, and you know why', 'No',
    'My read says no', 'Poor odds as things stand', 'Very unlikely', 'No — stop spending on this'
  ];

  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'];

  var WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  var PHASE_ICON = ['\uD83C\uDF11', '\uD83C\uDF12', '\uD83C\uDF13', '\uD83C\uDF14',
                    '\uD83C\uDF15', '\uD83C\uDF16', '\uD83C\uDF17', '\uD83C\uDF18'];

  root.HL_DATA = {
    NUMEROLOGY: NUMEROLOGY, ZODIAC: ZODIAC, ELEMENT_NOTE: ELEMENT_NOTE,
    MOON_PHASES: MOON_PHASES, BIORHYTHM: BIORHYTHM, TAROT: TAROT,
    TRIGRAMS: TRIGRAMS, ORACLE_8: ORACLE_8, MONTHS: MONTHS,
    WEEKDAYS: WEEKDAYS, PHASE_ICON: PHASE_ICON
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
