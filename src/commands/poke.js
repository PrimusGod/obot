import { SlashCommandBuilder } from 'discord.js';
import User from '../models/User.js';
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

const PAGE_SIZE = 10;

function getPokemonPageEmbed(user, page) {
  const start = page * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  const total = user.pokemon.length;
  const pagePokemon = user.pokemon.slice(start, end);
  return new EmbedBuilder()
    .setTitle(`Your Pokémon (Page ${page + 1}/${Math.ceil(total / PAGE_SIZE)})`)
    .setDescription(
      pagePokemon.map((poke, i) =>
        `**#${start + i + 1}:** ${poke.name} (Lv.${poke.level}) - Nature: ${poke.nature}, Ability: ${poke.ability}`
      ).join('\n') || 'No Pokémon found.'
    );
}

function getPaginationRow(page, total) {
  const maxPage = Math.ceil(total / PAGE_SIZE) - 1;
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`poke-prev-${page}`)
      .setLabel('⬅️')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page === 0),
    new ButtonBuilder()
      .setCustomId(`poke-next-${page}`)
      .setLabel('➡️')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page === maxPage)
  );
}

export default {
  data: new SlashCommandBuilder()
    .setName('poke')
    .setDescription('List all your caught Pokémon.'),
  async execute(interaction) {
    const user = await User.getOrCreate(interaction.user.id);
    if (!user.pokemon || !user.pokemon.length)
      return interaction.reply({ content: 'You have no Pokémon yet.', ephemeral: false });

    const embed = getPokemonPageEmbed(user, 0);
    const row = getPaginationRow(0, user.pokemon.length);

    await interaction.reply({ embeds: [embed], components: [row], ephemeral: false });
  }
};