import dotenv from 'dotenv';
dotenv.config();

export default {
  token: process.env.DISCORD_TOKEN,
  mongoUri: process.env.MONGODB_URI,
  guildId: process.env.GUILD_ID
};