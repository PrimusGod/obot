import { SlashCommandBuilder } from 'discord.js';
import User from '../models/User.js';
import { fetchPokemonMoves } from '../pokeapi/index.js';

export default {
  data: new SlashCommandBuilder()
    .setName('learn')
    .setDescription('Teach your selected Pokémon a move.')
    .addIntegerOption(opt => opt.setName('slot').setDescription('Move slot 1-4').setMinValue(1).setMaxValue(4).setRequired(true))
    .addStringOption(opt => opt.setName('move').setDescription('Move name').setRequired(true)),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: false }); // Defer at the start

    const slot = interaction.options.getInteger('slot') - 1;
    const moveName = interaction.options.getString('move');
    const user = await User.getOrCreate(interaction.user.id);
    const poke = user.getSelectedPokemon();
    if (!poke)
      return interaction.editReply({ content: 'No Pokémon selected.' }); // Use editReply

    const moves = await fetchPokemonMoves(poke.id);
    const matched = moves.find(m => m.name.toLowerCase() === moveName.toLowerCase());
    if (!matched)
      return interaction.editReply({ content: 'This Pokémon cannot learn that move.' }); // Use editReply

    poke.moves[slot] = matched.name;
    await user.save();
    await interaction.editReply({ content: `${poke.name} learned **${matched.name}** in slot ${slot+1}.` }); // Use editReply
  }
};