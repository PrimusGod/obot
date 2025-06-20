import { getRandomPokemon } from '../pokeapi/index.js';
import { ButtonBuilder, ActionRowBuilder, ButtonStyle } from 'discord.js';

export default function startSpawnScheduler(client) {
  setInterval(async () => {
    // Pick a random channel from all text channels in all guilds the bot is in
    for (const guild of client.guilds.cache.values()) {
      const channels = guild.channels.cache.filter(c => c.isTextBased() && c.viewable);
      if (!channels.size) continue;
      const channel = channels.random();
      const poke = await getRandomPokemon();
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`duel-${poke.id}-${Date.now()}`)
          .setLabel(`Duel ${poke.name}!`)
          .setStyle(ButtonStyle.Primary)
      );
      await channel.send({
        content: `A wild **${poke.name}** appeared!\nClick below to challenge!`,
        files: [poke.sprite],
        components: [row]
      });
    }
  }, Math.floor(Math.random() * 180000) + 120000); // 2-5 min random
}