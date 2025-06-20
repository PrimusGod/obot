import User from '../models/User.js';
import { handleDuelInteraction } from '../utils/duel.js';
import { NATURES, STARTERS } from '../pokeapi/mechanics.js';
import { fetchPokemonAbilities, getPokemonData } from '../pokeapi/index.js';

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

  // Handle buttons
  if (interaction.isButton() && interaction.customId.startsWith('duel-')) {
    await interaction.editReply
    await handleDuelInteraction(client, interaction);
    // Inside handleDuelInteraction, use interaction.editReply instead of reply
  }
};