import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import User from '../models/User.js';
import { calcStats } from '../utils/statUtils.js';

export default {
  data: new SlashCommandBuilder()
    .setName('peek')
    .setDescription('View your currently selected Pokémon.'),
  async execute(interaction) {
    const user = await User.getOrCreate(interaction.user.id);
    const poke = user.getSelectedPokemon();
    if (!poke)
      return interaction.reply({ content: 'No Pokémon selected.', ephemeral: false });

    const stats = calcStats(poke);
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle(`${poke.name} (Lv.${poke.level})`)
          .setThumbnail(poke.sprite)
          .setDescription([
            `**Nature:** ${poke.nature}`,
            `**Ability:** ${poke.ability}`,
            `**IVs:** ${Object.entries(poke.ivs).map(([k, v]) => `${k}: ${v}`).join(' | ')}`,
            `**Stats:** ${Object.entries(stats).map(([k, v]) => `${k}: ${v}`).join(' | ')}`,
            `**Moves:** ${poke.moves.filter(Boolean).join(', ') || 'None'}`
          ].join('\n'))
      ],
      ephemeral: false
    });
  }
};