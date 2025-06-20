// Stat calculation, IVs

export function randomIVs() {
  return {
    hp: rand31(),
    attack: rand31(),
    defense: rand31(),
    spattack: rand31(),
    spdefense: rand31(),
    speed: rand31()
  };
}
function rand31() { return Math.floor(Math.random() * 32); }

// Nature multipliers (simplified)
const NATURE_MAP = {
  Hardy: {},
  Lonely: { up: 'attack', down: 'defense' },
  Brave: { up: 'attack', down: 'speed' },
  Adamant: { up: 'attack', down: 'spattack' },
  Naughty: { up: 'attack', down: 'spdefense' },
  Bold: { up: 'defense', down: 'attack' },
  Docile: {},
  Relaxed: { up: 'defense', down: 'speed' },
  Impish: { up: 'defense', down: 'spattack' },
  Lax: { up: 'defense', down: 'spdefense' },
  Timid: { up: 'speed', down: 'attack' },
  Hasty: { up: 'speed', down: 'defense' },
  Serious: {},
  Jolly: { up: 'speed', down: 'spattack' },
  Naive: { up: 'speed', down: 'spdefense' },
  Modest: { up: 'spattack', down: 'attack' },
  Mild: { up: 'spattack', down: 'defense' },
  Quiet: { up: 'spattack', down: 'speed' },
  Bashful: {},
  Rash: { up: 'spattack', down: 'spdefense' },
  Calm: { up: 'spdefense', down: 'attack' },
  Gentle: { up: 'spdefense', down: 'defense' },
  Sassy: { up: 'spdefense', down: 'speed' },
  Careful: { up: 'spdefense', down: 'spattack' },
  Quirky: {}
};

export function calcStats(poke) {
  // Use base stats from pokeapi for real, here is a placeholder
  // For this template let's use some static example base stats
  const baseStats = {
    hp: 50, attack: 50, defense: 50, spattack: 50, spdefense: 50, speed: 50
  };
  // TODO: fetch real base stats from pokeapi
  const ivs = poke.ivs || {};
  const nat = NATURE_MAP[poke.nature] || {};
  let out = {};
  for (let stat of Object.keys(baseStats)) {
    let val = Math.floor(((2 * baseStats[stat] + (ivs[stat] ?? 0)) * poke.level) / 100) + 5;
    if (stat === 'hp') val += poke.level + 5;
    if (nat.up === stat) val = Math.floor(val * 1.1);
    if (nat.down === stat) val = Math.floor(val * 0.9);
    out[stat] = val;
  }
  return out;
}