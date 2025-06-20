// Registers slash commands for dev guild
import { REST, Routes } from 'discord.js';
import config from '../config.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const commands = [];
const commandFiles = fs.readdirSync(path.join(__dirname)).filter(f => f.endsWith('.js') && f !== '_register.js');

for (const file of commandFiles) {
  const command = await import(`./${file}`);
  commands.push(command.default.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(config.token);

try {
  await rest.put(
    Routes.applicationGuildCommands((await rest.get(Routes.user())).id, config.guildId),
    { body: commands }
  );
  console.log('Slash commands registered.');
} catch (error) {
  console.error(error);
}