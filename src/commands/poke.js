import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import User from '../models/User.js';

export default {
  data: new SlashCommandBuilder()
    .setName('poke')
    .setDescription('List all your caught Pokémon.'),
  async execute(interaction) {
    const user = await User.getOrCreate(interaction.user.id);
    if (!user.pokemon.length)
      return interaction.reply({ content: 'You have no Pokémon yet.', ephemeral: false });
    const embeds = [];
    for (const [i, poke] of user.pokemon.entries()) {
      embeds.push(
        new EmbedBuilder()
          .setTitle(`#${i + 1}: ${poke.name} (Lv.${poke.level})`)
          .setThumbnail(poke.sprite)
          .addFields(
            { name: 'IVs', value: Object.entries(poke.ivs).map(([s, v]) => `${s}: ${v}`).join(' | '), inline: false },
            { name: 'Nature', value: poke.nature, inline: true },
            { name: 'Ability', value: poke.ability, inline: true }
          )
      );
    }
    await interaction.reply({ embeds, ephemeral: false });
  }
};