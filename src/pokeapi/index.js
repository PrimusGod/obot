import axios from 'axios';
import { randomIVs } from '../utils/statUtils.js';

export async function getPokemonData(idOrName) {
  const { data } = await axios.get(`https://pokeapi.co/api/v2/pokemon/${idOrName}`);
  return {
    id: data.id,
    name: capitalize(data.name),
    sprite: data.sprites.front_default,
    abilities: data.abilities.map(a => capitalize(a.ability.name)),
    moves: data.moves.map(m => capitalize(m.move.name)),
    ivs: randomIVs()
  };
}

export async function getRandomPokemon() {
  const id = Math.floor(Math.random() * 898) + 1; // up to Gen 8, change as needed
  return await getPokemonData(id);
}

export async function fetchPokemonAbilities(idOrName) {
  const { data } = await axios.get(`https://pokeapi.co/api/v2/pokemon/${idOrName}`);
  return data.abilities.map(a => capitalize(a.ability.name));
}

export async function fetchPokemonMoves(idOrName) {
  const { data } = await axios.get(`https://pokeapi.co/api/v2/pokemon/${idOrName}`);
  const moves = await Promise.all(data.moves.map(async (m) => {
    // Only include level-up and machine moves with damage
    const moveData = await axios.get(m.move.url);
    return {
      name: capitalize(m.move.name),
      power: moveData.data.power
    };
  }));
  return moves.filter(m => m.power);
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}