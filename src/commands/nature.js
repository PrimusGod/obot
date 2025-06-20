import { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';
import { NATURES } from '../pokeapi/mechanics.js';
import User from '../models/User.js';

export default {
  data: new SlashCommandBuilder()
    .setName('nature')
    .setDescription('List and change your selected Pokémon\'s nature.'),
  async execute(interaction) {
    const user = await User.getOrCreate(interaction.user.id);
    const selected = user.getSelectedPokemon();
    if (!selected)
      return interaction.reply({ content: 'No Pokémon selected.', ephemeral: false });

    const options = NATURES.map(nat => ({
      label: nat.name,
      description: nat.effect,
      value: nat.name
    }));
    const menu = new StringSelectMenuBuilder()
      .setCustomId('nature-select')
      .setPlaceholder('Select a nature')
      .addOptions(options);

    const row = new ActionRowBuilder().addComponents(menu);

    await interaction.reply({
      content: `Current nature: **${selected.nature}**\nChoose a new nature:`,
      components: [row],
      ephemeral: false
    });
  }
};