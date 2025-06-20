import mongoose from 'mongoose';

const pokemonSchema = new mongoose.Schema({
  id: Number,
  name: String,
  sprite: String,
  ivs: {
    hp: Number,
    attack: Number,
    defense: Number,
    spattack: Number,
    spdefense: Number,
    speed: Number
  },
  level: { type: Number, default: 5 },
  xp: { type: Number, default: 0 },
  nature: { type: String, default: 'Hardy' },
  ability: String,
  moves: [String],
  caught: Date
}, { _id: false });

const userSchema = new mongoose.Schema({
  discordId: { type: String, required: true, unique: true },
  pokemon: [pokemonSchema],
  selected: { type: Number, default: 0 },
  _lastXp: Number,
  _xpToday: { type: Number, default: 0 }
});

userSchema.statics.getOrCreate = async function(discordId) {
  let user = await this.findOne({ discordId });
  if (!user) user = await this.create({ discordId, pokemon: [], selected: 0 });
  return user;
};

userSchema.methods.getSelectedPokemon = function() {
  if (this.selected < 0 || this.selected >= this.pokemon.length) return null;
  return this.pokemon[this.selected];
};

export default mongoose.model('User', userSchema);