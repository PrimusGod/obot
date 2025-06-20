// Handles duel logic
import User from '../models/User.js';
import { getPokemonData } from '../pokeapi/index.js';
import { calcStats } from './statUtils.js';
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

const DUELS = new Map(); // duelId => duel state

export async function handleDuelInteraction(client, interaction) {
  const [_, pokeId, duelStamp] = interaction.customId.split('-');
  const duelId = `${pokeId}-${duelStamp}`;
  if (DUELS.has(duelId)) return interaction.reply({ content: 'This duel is already in progress.', ephemeral: false });

  // Only let the first clicker duel
  DUELS.set(duelId, true);

  const wild = await getPokemonData(pokeId);
  const user = await User.getOrCreate(interaction.user.id);
  const mypoke = user.getSelectedPokemon();
  if (!mypoke) return interaction.reply({ content: 'No selected Pokémon!', ephemeral: false });

  let wildStats = calcStats({ ...wild, level: mypoke.level }); // Match level
  let myStats = calcStats(mypoke);

  let wildHP = wildStats.hp, myHP = myStats.hp;
  let turn = 0;
  let log = [`Duel Start: ${mypoke.name} vs ${wild.name} (Lv.${mypoke.level})`];

  // Get moves
  const myMoves = mypoke.moves.filter(Boolean);
  const wildMoves = wild.moves.slice(0, 4);

  // For simplicity, automate wild moves and basic damage
  while (wildHP > 0 && myHP > 0) {
    turn++;
    // Player attacks
    const move = myMoves[0] || 'Tackle';
    const dmg = Math.max(1, Math.floor((myStats.attack || 1) - (wildStats.defense || 1) / 2));
    wildHP -= dmg;
    log.push(`Turn ${turn}: ${mypoke.name} used ${move}! Wild ${wild.name} took ${dmg} damage. (HP: ${Math.max(wildHP,0)})`);
    if (wildHP <= 0) break;
    // Wild attacks
    const wildMove = wildMoves[0] || 'Tackle';
    const wdmg = Math.max(1, Math.floor((wildStats.attack || 1) - (myStats.defense || 1) / 2));
    myHP -= wdmg;
    log.push(`Wild ${wild.name} used ${wildMove}! ${mypoke.name} took ${wdmg} damage. (HP: ${Math.max(myHP,0)})`);
  }

  let win = myHP > 0;
  let embed = new EmbedBuilder()
    .setTitle(win ? `You caught ${wild.name}!` : `You lost to ${wild.name}`)
    .setDescription(log.join('\n'))
    .setThumbnail(wild.sprite);

  if (win) {
    user.pokemon.push({
      id: wild.id,
      name: wild.name,
      sprite: wild.sprite,
      ivs: wild.ivs,
      level: mypoke.level,
      xp: 0,
      nature: 'Hardy',
      ability: wild.abilities[0],
      moves: [],
      caught: Date.now()
    });
    // XP reward
    mypoke.xp = (mypoke.xp || 0) + 25;
    // Level up logic
    while (mypoke.level < 100 && mypoke.xp >= 100 * mypoke.level) {
      mypoke.xp -= 100 * mypoke.level;
      mypoke.level += 1;
    }
    await user.save();
  }

  await interaction.reply({ embeds: [embed], ephemeral: false });
  setTimeout(() => DUELS.delete(duelId), 60_000);
}

export function createDuel() {
  // Not used, duel is handled on-the-fly in handleDuelInteraction
}