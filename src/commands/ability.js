import { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';
import User from '../models/User.js';
import { fetchPokemonAbilities } from '../pokeapi/index.js';

export default {
  data: new SlashCommandBuilder()
    .setName('ability')
    .setDescription('Change the ability of your selected Pokémon.'),
  async execute(interaction) {
    const user = await User.getOrCreate(interaction.user.id);
    const poke = user.getSelectedPokemon();
    if (!poke)
      return interaction.reply({ content: 'No Pokémon selected.', ephemeral: false });

    await interaction.deferReply({ ephemeral: false });

    const abilities = await fetchPokemonAbilities(poke.id);
    const menu = new StringSelectMenuBuilder()
      .setCustomId('ability-select')
      .setPlaceholder('Choose ability')
      .addOptions(abilities.map(a => ({
        label: a,
        value: a
      })));

    const row = new ActionRowBuilder().addComponents(menu);

    await interaction.editReply({
      content: `Current ability: **${poke.ability}**\nChoose a new ability:`,
      components: [row]
    });
  }
};