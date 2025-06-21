import User from '../models/User.js';
import { handleDuelInteraction } from '../utils/duel.js';
import { NATURES, STARTERS } from '../pokeapi/mechanics.js';
import { fetchPokemonAbilities, getPokemonData } from '../pokeapi/index.js';
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

export default async (client, interaction) => {
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (command) await command.execute(interaction);
  }

  // Handle select menus
  if (interaction.isStringSelectMenu()) {
    await interaction.deferReply({ ephemeral: false }); // Defer at start

    if (interaction.customId === 'nature-select') {
      // Nature change
      const nat = NATURES.find(n => n.name === interaction.values[0]);
      const user = await User.getOrCreate(interaction.user.id);
      const poke = user.getSelectedPokemon();
      poke.nature = nat.name;
      await user.save();
      await interaction.editReply({ content: `Nature set to **${nat.name}** for ${poke.name}.` });
    }
    if (interaction.customId === 'starter-select') {
      const id = Number(interaction.values[0]);
      const starter = STARTERS.find(s => s.id === id);
      const user = await User.getOrCreate(interaction.user.id);
      // Fetch starter data
      const poke = await getPokemonData(id);
      user.pokemon = [{
        id: poke.id,
        name: poke.name,
        sprite: poke.sprite,
        ivs: poke.ivs,
        level: 5,
        xp: 0,
        nature: 'Hardy',
        ability: poke.abilities[0],
        moves: [],
        caught: Date.now()
      }];
      user.selected = 0;
      await user.save();
      await interaction.editReply({ content: `You picked **${poke.name}**!` });
    }
    if (interaction.customId === 'ability-select') {
      const user = await User.getOrCreate(interaction.user.id);
      const poke = user.getSelectedPokemon();
      poke.ability = interaction.values[0];
      await user.save();
      await interaction.editReply({ content: `Ability set to **${poke.ability}** for ${poke.name}.` });
    }
  }

  // Handle duel buttons
  if (interaction.isButton() && interaction.customId.startsWith('duel-')) {
    await handleDuelInteraction(client, interaction);
    // Inside handleDuelInteraction, use interaction.editReply instead of reply
  }

  // Handle poke pagination buttons
  if (interaction.isButton() && interaction.customId.startsWith('poke-')) {
    // poke-prev-X or poke-next-X
    const [, direction, pageStr] = interaction.customId.split('-');
    const oldPage = parseInt(pageStr, 10);
    const user = await User.getOrCreate(interaction.user.id);

    let newPage = direction === 'next' ? oldPage + 1 : oldPage - 1;
    const maxPage = Math.ceil(user.pokemon.length / PAGE_SIZE) - 1;
    if (newPage < 0) newPage = 0;
    if (newPage > maxPage) newPage = maxPage;

    const embed = getPokemonPageEmbed(user, newPage);
    const row = getPaginationRow(newPage, user.pokemon.length);

    await interaction.update({ embeds: [embed], components: [row] });
  }
};