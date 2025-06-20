import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import User from '../models/User.js';
import { fetchPokemonMoves } from '../pokeapi/index.js';

export default {
  data: new SlashCommandBuilder()
    .setName('moves')
    .setDescription('Show all moves your selected Pokémon can learn.'),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: false }); // Defer at the start

    const user = await User.getOrCreate(interaction.user.id);
    const poke = user.getSelectedPokemon();
    if (!poke)
      return interaction.editReply({ content: 'No Pokémon selected.' }); // Use editReply

    const moves = await fetchPokemonMoves(poke.id);
    const embed = new EmbedBuilder()
      .setTitle(`${poke.name} Learnable Moves`)
      .setDescription(moves.map(m => `**${m.name}**: ${m.power ?? 'N/A'}`).join('\n'));

    await interaction.editReply({ embeds: [embed] }); // Use editReply
  }
};