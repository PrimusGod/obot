import { Client, GatewayIntentBits, Collection, Partials } from 'discord.js';
import mongoose from 'mongoose';
import config from './config.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MongoDB
mongoose.connect(config.mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(()=>console.log('MongoDB connected.'))
  .catch(console.error);

// Discord Client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

// Load commands
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js') && f !== '_register.js');
for (const file of commandFiles) {
  const command = await import(`./commands/${file}`);
  client.commands.set(command.default.data.name, command.default);
}

// Register slash commands on startup
import './commands/_register.js';

// Register events
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(f => f.endsWith('.js'));
for (const file of eventFiles) {
  const event = await import(`./events/${file}`);
  const eventName = file.replace('.js', '');
  client.on(eventName, (...args) => event.default(client, ...args));
}

// Start spawn scheduler
 import('./scheduler/spawnScheduler.js').then(mod => mod.default(client));

// Login
client.login(config.token);