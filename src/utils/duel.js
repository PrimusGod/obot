// Handles duel logic
import User from '../models/User.js';
import { getPokemonData } from '../pokeapi/index.js';
import { calcStats } from './statUtils.js';
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

const DUELS = new Map(); // duelId => duel state

// Utility: retry a function for up to 2 minutes on error (network)
async function retryAsync(fn, maxMs = 120_000, intervalMs = 5000) {
  const start = Date.now();
  let lastErr;
  while (Date.now() - start < maxMs) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      // Only retry on network-related errors
      if (
        err.code === "ETIMEDOUT" ||
        err.code === "ECONNREFUSED" ||
        err.message?.includes("ETIMEDOUT") ||
        err.message?.includes("ECONNREFUSED")
      ) {
        await new Promise((res) => setTimeout(res, intervalMs));
      } else {
        throw err;
      }
    }
  }
  throw lastErr;
}

export async function handleDuelInteraction(client, interaction) {
  const [_, pokeId, duelStamp] = interaction.customId.split('-');
  const duelId = `${pokeId}-${duelStamp}`;
  if (DUELS.has(duelId)) return interaction.editReply({ content: 'This duel is already in progress.', ephemeral: false });

  // Only let the first clicker duel
  DUELS.set(duelId, true);

  // --- Retry section for all network/database calls ---
  let wild, user, mypoke;
  try {
    [wild, user] = await retryAsync(async () => {
      const wildData = await getPokemonData(pokeId);
      const userData = await User.getOrCreate(interaction.user.id);
      return [wildData, userData];
    });
    mypoke = user.getSelectedPokemon();
  } catch (err) {
    await interaction.reply({ content: `Failed to fetch duel data after 2 minutes, please try again later.`, ephemeral: false });
    DUELS.delete(duelId);
    return;
  }

  if (!mypoke) {
    await interaction.reply({ content: 'No selected Pokémon!', ephemeral: false });
    DUELS.delete(duelId);
    return;
  }

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

  // Retry saving user data if needed
  if (win) {
    try {
      await retryAsync(async () => {
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
      });
    } catch (err) {
      await interaction.reply({ content: `Failed to save duel results after 2 minutes, please try again later.`, ephemeral: false });
      DUELS.delete(duelId);
      return;
    }
  }

  // Retry replying up to 2 minutes
  try {
    await retryAsync(async () => {
      await interaction.reply({ embeds: [embed], ephemeral: false });
    });
  } catch (err) {
    // Could not send reply after 2 minutes
    // Nothing more we can do, just clean up
  }

  setTimeout(() => DUELS.delete(duelId), 60_000);
}

export function createDuel() {
  // Not used, duel is handled on-the-fly in handleDuelInteraction
}