import User from '../models/User.js';

export default async (client, message) => {
  if (message.author.bot) return;
  const user = await User.getOrCreate(message.author.id);
  const poke = user.getSelectedPokemon();
  if (!poke) return;
  // +1 XP per message, max 100 per day
  if (!user._lastXp || user._lastXp < Date.now() - 86400000) user._xpToday = 0;
  if (user._xpToday < 100) {
    poke.xp = (poke.xp || 0) + 1;
    user._xpToday = (user._xpToday || 0) + 1;
    user._lastXp = Date.now();
    // Level up logic
    while (poke.level < 100 && poke.xp >= 100 * poke.level) {
      poke.xp -= 100 * poke.level;
      poke.level += 1;
    }
    await user.save();
  }
};