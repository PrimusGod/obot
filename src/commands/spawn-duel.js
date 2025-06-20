import { SlashCommandBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } from 'discord.js';
import { getRandomPokemon } from '../pokeapi/index.js';
import { createDuel } from '../utils/duel.js';

export default {
  data: new SlashCommandBuilder()
    .setName('spawn-duel')
    .setDescription('Spawn a random Pokémon for a duel!'),
  async execute(interaction) {
    await interaction.deferReply(); // Add this at the start

    const poke = await getRandomPokemon();
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`duel-${poke.id}-${Date.now()}`)
        .setLabel(`Duel ${poke.name}!`)
        .setStyle(ButtonStyle.Primary)
    );
    await interaction.editReply({ // Change reply() to editReply()
      content: `A wild **${poke.name}** appeared!\nClick below to challenge!`,
      files: [poke.sprite],
      components: [row]
    });
    // Duel is handled by interactionCreate.js when button is clicked
  }
};