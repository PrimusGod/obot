import { SlashCommandBuilder } from 'discord.js';
import User from '../models/User.js';

export default {
  data: new SlashCommandBuilder()
    .setName('select')
    .setDescription('Select one of your caught Pokémon.')
    .addIntegerOption(opt => opt.setName('number').setDescription('Number from your /poke list').setRequired(true)),
  async execute(interaction) {
    const idx = interaction.options.getInteger('number') - 1;
    const user = await User.getOrCreate(interaction.user.id);
    if (idx < 0 || idx >= user.pokemon.length)
      return interaction.reply({ content: 'Invalid Pokémon number.', ephemeral: false });

    user.selected = idx;
    await user.save();
    await interaction.reply({ content: `Selected Pokémon: **${user.pokemon[idx].name}**`, ephemeral: false });
  }
};