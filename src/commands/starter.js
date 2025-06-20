import { SlashCommandBuilder, StringSelectMenuBuilder, ActionRowBuilder } from 'discord.js';
import User from '../models/User.js';
import { STARTERS } from '../pokeapi/mechanics.js';

export default {
  data: new SlashCommandBuilder()
    .setName('starter')
    .setDescription('Pick your starter Pokémon (one-time).'),
  async execute(interaction) {
    const user = await User.getOrCreate(interaction.user.id);
    if (user.pokemon.length > 0)
      return interaction.reply({ content: 'You already have a Pokémon. Use /reset to start over.', ephemeral: true });

    const menu = new StringSelectMenuBuilder()
      .setCustomId('starter-select')
      .setPlaceholder('Pick your starter')
      .addOptions(STARTERS.map(s => ({
        label: s.name,
        value: s.id.toString(),
        description: s.region
      })));

    const row = new ActionRowBuilder().addComponents(menu);

    await interaction.reply({
      content: 'Pick your starter Pokémon:',
      components: [row],
      ephemeral: true
    });
  }
};