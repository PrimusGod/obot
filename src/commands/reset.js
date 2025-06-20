import { SlashCommandBuilder } from 'discord.js';
import User from '../models/User.js';

export default {
  data: new SlashCommandBuilder()
    .setName('reset')
    .setDescription('Reset your account and delete all Pokémon data.'),
  async execute(interaction) {
    await User.deleteOne({ discordId: interaction.user.id });
    await interaction.reply({ content: 'Your account has been reset. You can now use /starter again.', ephemeral: true });
  }
};