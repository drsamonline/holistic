"""Generates the reference tables appended to assets/js/data.js.
Run from the repo root:  python3 scripts/gen-reference-data.py
Source data for hexagram names and line patterns: hex_parsed.json
(derived from the Wikipedia list of hexagrams, King Wen order).
"""
import json, re, pathlib

root = pathlib.Path(__file__).resolve().parent.parent
hexes = json.load(open(root / 'hex_parsed.json', encoding='utf-8'))

NAMES = {
 1:"The Creative",2:"The Receptive",3:"Difficulty at the Beginning",4:"Youthful Folly",
 5:"Waiting",6:"Conflict",7:"The Army",8:"Holding Together",9:"Small Taming",
 10:"Treading",11:"Peace",12:"Standstill",13:"Fellowship",14:"Great Possession",
 15:"Modesty",16:"Enthusiasm",17:"Following",18:"Repair",19:"Approach",
 20:"Contemplation",21:"Biting Through",22:"Grace",23:"Splitting Apart",24:"Return",
 25:"Innocence",26:"Great Taming",27:"Nourishment",28:"Great Excess",29:"The Abyss",
 30:"The Clinging",31:"Influence",32:"Duration",33:"Retreat",34:"Great Power",
 35:"Progress",36:"Darkening",37:"The Family",38:"Opposition",39:"Obstruction",
 40:"Deliverance",41:"Decrease",42:"Increase",43:"Breakthrough",44:"Coming to Meet",
 45:"Gathering",46:"Pushing Upward",47:"Oppression",48:"The Well",49:"Revolution",
 50:"The Cauldron",51:"Thunder",52:"Keeping Still",53:"Development",54:"The Marrying Maiden",
 55:"Abundance",56:"The Wanderer",57:"The Wind",58:"The Joyous",59:"Dispersion",
 60:"Limitation",61:"Inner Truth",62:"Small Excess",63:"After Completion",64:"Before Completion"
}

READINGS = {
 1:"Pure initiative. Start the thing and keep going — the danger is excess, not hesitation.",
 2:"Yield and support. Strength now is in following the situation rather than steering it.",
 3:"Something is trying to begin and it is difficult. Get help early; do not force the first shoot.",
 4:"You are a beginner and pretending otherwise. Ask the plain question you have been avoiding.",
 5:"Nothing is ready yet. Prepare, then wait without anxiety — the delay is doing work.",
 6:"A dispute is forming. Stop before you win it, and check whether winning is the point.",
 7:"Collective effort, clear discipline, one purpose. Do not move without both.",
 8:"Union needs a centre. Join something, or be the thing others join.",
 9:"Small restraints, small gains. Work with the little you control today.",
 10:"Careful steps near something powerful. Mind the manners, not the ambition.",
 11:"Heaven below, earth above — things connect. Use the open window; do not assume it stays open.",
 12:"The channel is blocked and it is not your fault. Withdraw, keep your shape, wait it out.",
 13:"Common purpose, not common taste. Find the people who want the same thing you do.",
 14:"You have more than you need. The test is generosity, not acquisition.",
 15:"Lower than you could be. It is the only position from which you can still move.",
 16:"Momentum and appetite. Ride it, but check the direction before the crowd does.",
 17:"Follow what deserves following. Rest is earned by stopping at the right time.",
 18:"Something has spoiled through neglect. Name the cause before you clean it up.",
 19:"The good thing is coming toward you. Be present; it will not announce itself twice.",
 20:"Step back and look. Your example is teaching more than your words.",
 21:"An obstruction that needs a decision. Bite once, cleanly, and be done.",
 22:"Form matters, and form is not substance. Enjoy the ornament; do not build on it.",
 23:"Things are coming apart. Do not prop it up — let it fall and keep what is solid.",
 24:"You have been here before and can come back. A small turn is enough to restart.",
 25:"Act from what is actually true for you. Anything staged will not survive.",
 26:"Held power, stored strength. Restrain it deliberately and use it later.",
 27:"What you take in, and what you feed others. Look at both.",
 28:"The load is greater than the beam. Do something disproportionate or it breaks.",
 29:"Danger repeated. The way through is to keep moving with the current, not against it.",
 30:"Clarity that depends on what it burns. Illuminate; do not consume yourself.",
 31:"Attraction without force. Be moved first and the response follows.",
 32:"What lasts is what is maintained. Continue the boring thing.",
 33:"Withdraw while withdrawal is still a choice. Distance is a tactic, not a defeat.",
 34:"Strength with no need to prove it. Use it correctly and do not push past the mark.",
 35:"Advance, and be seen advancing. Accept the light while it is on you.",
 36:"The light is hidden. Keep your judgement inside until it is safe to show it.",
 37:"The household runs on roles honestly kept. Fix the inside before the outside.",
 38:"Two things that will not meet. Agree on the small things and stop arguing the large.",
 39:"The road is blocked ahead. Turn back and look for the other route.",
 40:"The knot loosens. Finish what remains quickly, then stop.",
 41:"Give something up on purpose. What remains gets stronger.",
 42:"Add, and move forward while the wind is behind. Give some of it away.",
 43:"Say it out loud. Resolve openly and refuse to carry the resentment forward.",
 44:"Something attractive and unmanaged arrives. Meet it; do not merge with it.",
 45:"People and resources collecting. Have a centre or the crowd becomes noise.",
 46:"Slow, stepwise ascent with no shortcuts. Keep going quietly.",
 47:"Constraint from outside. Words do not help now; endurance does.",
 48:"The source is shared and does not move. Fix the bucket, not the well.",
 49:"Change is due and has a date. Make it once, and make it believable.",
 50:"Transformation through a vessel. What you feed it becomes what you serve.",
 51:"Shock, then recovery. The first moment is fear; the second is clarity.",
 52:"Stop completely, including the thinking. Stillness is the action.",
 53:"Gradual, proper growth. The tree does not hurry and neither should you.",
 54:"You are entering on someone else's terms. Know that before you sign.",
 55:"Peak fullness, briefly. Do what only the peak allows, today.",
 56:"Passing through, belonging nowhere yet. Be courteous and keep moving.",
 57:"Steady, persistent penetration. Influence by repetition, not force.",
 58:"Open exchange and pleasure. Speak freely, and watch what you promise in a good mood.",
 59:"What has hardened is dissolving. Use the moment to reunite what matters.",
 60:"Limits that make things usable. Choose your own before someone chooses for you.",
 61:"Sincerity that reaches through. Say the true thing plainly.",
 62:"Modest measures in a modest situation. Do not attempt the grand gesture.",
 63:"It is done and now needs care. Order maintained is order, not victory.",
 64:"Almost, not yet. Keep the discipline of the unfinished last mile.",
}

SUITS = {
  'Wands':  ('fire',  'drive, work and appetite'),
  'Cups':   ('water', 'feeling, bond and memory'),
  'Swords': ('air',   'thought, speech and conflict'),
  'Coins':  ('earth', 'body, money and time'),
}

MINOR = {
 'Wands': {
  'Ace':'A spark with somewhere to go. Start before the enthusiasm cools.',
  'Two':'Planning a move while still holding the old one. Choose a date.',
  'Three':'The horizon opens. Your work is beginning to be seen from a distance.',
  'Four':'A celebration worth stopping for. Home, harvest, a threshold held.',
  'Five':'Scrappy competition. Everyone is tired and nobody will concede.',
  'Six':'Recognition arrives. Take the win publicly and move on.',
  'Seven':'Holding ground against a crowd. Defend the hill only if it is worth it.',
  'Eight':'Speed and sudden news. Things move faster than your plan.',
  'Nine':'Bruised but still standing. One more push, then rest properly.',
  'Ten':'Overloaded. You are carrying what could be handed over.',
  'Page':'A curious beginning. Ask the naive question out loud.',
  'Knight':'Charge first, aim later. Energy without a map.',
  'Queen':'Warm authority. Lead by being visibly unafraid.',
  'King':'Vision held with discipline. Decide, then commit the resources.'},
 'Cups': {
  'Ace':'An opening of feeling. Something is available that was not before.',
  'Two':'A meeting of equals. The beginning of a real exchange.',
  'Three':'Shared joy. Community, celebration, a table that fits.',
  'Four':'Apathy dressed as calm. You are offered something and looking away.',
  'Five':'Grief over what spilled. Three cups still stand behind you.',
  'Six':'Nostalgia and old kindness. Memory as a resource, not a hiding place.',
  'Seven':'Too many options, most of them imaginary. Pick one and test it.',
  'Eight':'Leaving something good enough to look for something true.',
  'Nine':'Contentment earned. Enjoy it without bracing for the loss.',
  'Ten':'Belonging at full scale. A home that holds everyone.',
  'Page':'A tender message. Something small wants to be said.',
  'Knight':'Romance and idealism in motion. Charming, and not yet reliable.',
  'Queen':'Deep feeling held steadily. Empathy with a boundary.',
  'King':'Emotional maturity. Calm that others can borrow.'},
 'Swords': {
  'Ace':'A clean idea cutting through. Say the accurate thing.',
  'Two':'A stalemate held by refusal. You have decided not to look.',
  'Three':'A truth that hurts. Let the grief be the grief.',
  'Four':'Rest as repair. Step out of the argument to recover.',
  'Five':'A win that costs more than it returns. Check who is left standing.',
  'Six':'Moving out of rough water. Passage, not arrival.',
  'Seven':'Quiet strategy, or quiet deception. Check which one you are doing.',
  'Eight':'Self-imposed limits. The bindings are looser than they look.',
  'Nine':'Late-night spiralling. Most of it is fear, not fact.',
  'Ten':'The end of a bad run. It is finished — stop replaying it.',
  'Page':'Sharp curiosity. Gather information before opinion.',
  'Knight':'Fast and blunt. Say it, then check the damage.',
  'Queen':'Clear sight without cruelty. Judge accurately and kindly.',
  'King':'Intellectual authority. Rules applied with consistency.'},
 'Coins': {
  'Ace':'A concrete opportunity. Something you can actually hold.',
  'Two':'Juggling commitments. Balance is a rhythm, not a pose.',
  'Three':'Craft recognised. Work with others on something solid.',
  'Four':'Holding tight. Security, or hoarding — check which.',
  'Five':'Scarcity and cold. Walk toward help rather than away from it.',
  'Six':'Generosity with a balance. Give and receive in proportion.',
  'Seven':'Patience with slow growth. The harvest is not late.',
  'Eight':'Deliberate practice. Skill built by repetition, not inspiration.',
  'Nine':'Self-sufficiency earned. Enjoy your own company and your own garden.',
  'Ten':'Inheritance and legacy. What is being passed on, and to whom.',
  'Page':'A practical beginning. Learn the boring fundamentals.',
  'Knight':'Slow, methodical, unstoppable. Boring progress that holds.',
  'Queen':'Nurture with competence. Care that is also organised.',
  'King':'Material mastery. Stewardship of what has been built.'},
}

RUNES = [
 ('Fehu','ᚠ','Wealth, cattle, mobile property','What you have, and whether it is moving. Money is a tool, not a score.','Money stuck or spent badly; a gain that costs more than it brings.'),
 ('Uruz','ᚢ','The aurochs — wild strength','Raw vitality and health. Endurance that does not need encouragement.','Strength misused; force where patience was needed.'),
 ('Thurisaz','ᚦ','The thorn, the giant','A defended gate. Protection, and the pain of forcing your way through it.','A defence that has become a cage; danger you keep walking into.'),
 ('Ansuz','ᚨ','A god, the breath, the word','A message, a signal, an idea worth saying out loud.','Noise instead of signal; a lie or a misunderstanding.'),
 ('Raidho','ᚱ','Ride, journey, right order','Deliberate movement in the correct direction. Travel with a purpose.','Going the wrong way; a journey that is only escape.'),
 ('Kenaz','ᚲ','Torch, kindling','Controlled fire — knowledge, craft, the thing that lights the next thing.','Something burning without light; creativity gone cold.'),
 ('Gebo','ᚷ','Gift','Exchange and generosity. A gift that creates an obligation both ways.','An unbalanced exchange; a gift with a hook.'),
 ('Wunjo','ᚹ','Joy','Contentment and belonging. The relief of being where you should be.','Hollow cheer; joy deferred until conditions are met.'),
 ('Hagalaz','ᚺ','Hail','Disruption from outside, unavoidable and short. Shelter, then rebuild.','The storm passing; the damage already done and ready to clear.'),
 ('Nauthiz','ᚾ','Need, constraint','Necessity. You are being taught by a limit, not punished by one.','Need that has become habit; resisting a lesson.'),
 ('Isa','ᛁ','Ice','Stillness. Everything is frozen and nothing is moving — on purpose.','Thaw beginning; the patience finally paying.'),
 ('Jera','ᛃ','Year, harvest','Time doing its work. You cannot hurry a season.','Impatience with a process that has its own clock.'),
 ('Eihwaz','ᛇ','Yew tree','Endurance through a long test. Deep roots, slow strength.','Instability at the root; endurance that has turned to stubbornness.'),
 ('Perthro','ᛈ','Lot cup, dice','Chance, fate, the hidden factor. Something you cannot see is deciding.','A gamble that is not worth taking; secrets working against you.'),
 ('Algiz','ᛉ','Elk, protection','Vigilance and defence. Hands raised in the right direction.','Vigilance misplaced; guarding the wrong gate.'),
 ('Sowilo','ᛊ','Sun','Clarity, success, the light that shows everything.','Burnout from too much exposure; a false dawn.'),
 ('Tiwaz','ᛏ','Tyr, the sky god','Justice and sacrifice. Victory that requires giving something up.','Judgement without mercy; sacrifice that bought nothing.'),
 ('Berkanaz','ᛒ','Birch','Growth, birth, the first green. Beginning that is already happening.','Growth stalled; a start that was never tended.'),
 ('Ehwaz','ᛖ','Horse, two horses','Partnership in motion. Two moving as one.','A partnership out of step; a bond that has come apart.'),
 ('Mannaz','ᛗ','Man, the self','Yourself among others. Community, identity, the mirror of company.','Isolation; a mask that no longer fits.'),
 ('Laguz','ᛚ','Lake, water','Flow, intuition, what can be sensed but not measured.','A current you are fighting; intuition ignored.'),
 ('Ingwaz','ᛜ','Ing, the seed','Stored potential, waiting to be planted. Gestation.','Potential that will not start; a seed left in the packet.'),
 ('Dagaz','ᛞ','Day','Breakthrough and daylight. A threshold crossed.','A turning point you have not accepted yet.'),
 ('Othala','ᛟ','Heritage, estate','Inheritance, home, what was given before you arrived.','A legacy that does not fit; home as obligation.'),
]

def js(s):
    return "'" + s.replace('\\', '\\\\').replace("'", "\\'") + "'"

lines = []
lines.append("  /* ---------- I Ching: all 64 hexagrams (King Wen order) ---------- */")
lines.append("  /* bits are six lines, bottom to top, 1 = yang */")
lines.append("  var HEXAGRAMS = [")
for h in hexes:
    n = h['n']
    lines.append("    { n: %d, name: %s, cn: %s, bits: '%s',\n      reading: %s }," % (
        n, js(NAMES[n]), js(h['cn']), h['bits'], js(READINGS[n])))
lines.append("  ];")
lines.append("")

lines.append("  /* ---------- Tarot: 56 minor arcana ---------- */")
lines.append("  var MINORS = [")
for suit, cards in MINOR.items():
    el, note = SUITS[suit]
    for rank in ['Ace','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten',
                 'Page','Knight','Queen','King']:
        lines.append("    { name: %s, suit: %s, element: %s, reading: %s }," % (
            js(rank + ' of ' + suit), js(suit), js(el), js(cards[rank])))
lines.append("  ];")
lines.append("  var SUIT_NOTE = { Wands: %s, Cups: %s, Swords: %s, Coins: %s };" % (
    js(SUITS['Wands'][1]), js(SUITS['Cups'][1]), js(SUITS['Swords'][1]), js(SUITS['Coins'][1])))
lines.append("")

lines.append("  /* ---------- Runes: 24 Elder Futhark ---------- */")
lines.append("  var RUNES = [")
for name, glyph, gloss, up, rev in RUNES:
    lines.append("    { name: %s, glyph: %s, gloss: %s,\n      upright: %s, reversed: %s }," % (
        js(name), js(glyph), js(gloss), js(up), js(rev)))
lines.append("  ];")

block = "\n".join(lines)

p = root / 'assets/js/data.js'
src = p.read_text()
marker = "  var MONTHS = ["
assert marker in src, 'anchor not found'
src = src.replace(marker, block + "\n\n" + marker)

src = src.replace(
  "    TRIGRAMS: TRIGRAMS, ORACLE_8: ORACLE_8, MONTHS: MONTHS,",
  "    TRIGRAMS: TRIGRAMS, ORACLE_8: ORACLE_8, MONTHS: MONTHS,\n"
  "    HEXAGRAMS: HEXAGRAMS, MINORS: MINORS, SUIT_NOTE: SUIT_NOTE, RUNES: RUNES,")
p.write_text(src)
print('data.js updated:', len(src), 'bytes')
