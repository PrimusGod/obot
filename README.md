# Discord Pokémon Bot

A full-featured Pokémon Discord bot using Node.js, MongoDB, and data from [PokeAPI](https://pokeapi.co).

## Features

- Slash commands: `/nature`, `/poke`, `/peek`, `/ability`, `/moves`, `/learn`, `/select`, `/starter`, `/reset`, `/spawn-duel`
- Scheduled and manual wild Pokémon spawns with duels
- Turn-based duel mechanics (simplified for Discord)
- Pokémon catching, IVs, natures, abilities, moves, and stat scaling
- Experience, level-up, and more

## Setup

1. Clone the repo and install dependencies:
   ```
   npm install
   ```
2. Fill in your `.env` file with your bot token, MongoDB URI, and dev guild ID.
3. Start MongoDB locally or use MongoDB Atlas.
4. Start the bot:
   ```
   npm start
   ```
5. Invite your bot to your Discord server with the `applications.commands` and `bot` scopes.

## Notes

- **All Pokémon and move/stat data is fetched live from [PokeAPI](https://pokeapi.co).**
- You can extend the stat calculations and duel mechanics for a more realistic battle system.
- All user and Pokémon data is stored in MongoDB.

---

**Enjoy your adventure!**