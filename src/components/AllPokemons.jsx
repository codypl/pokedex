import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks'
import PokemonCard from './PokemonCard';

export default function AllPokemons() {

  let offset = 0
  let numberOfPokemonToFetch = 27; //27
  const maxPokemonToShow = 476;
  const [pokemons, setPokemons] = useState([]);

  const handleScroll = (e) => {
    if (offset - numberOfPokemonToFetch < maxPokemonToShow) {
      if (window.innerHeight + e.target.documentElement.scrollTop + 1 >= e.target.documentElement.scrollHeight) {
        loadPokemon()
      }
    }

  }

  let loadPokemon = () => {

    fetch('https://pokeapi.co/api/v2/pokemon/?limit=' + numberOfPokemonToFetch + '&offset=' + offset)
      .then(response => response.json())
      .then(data => {
        let results = data.results;
        let promisesArray = results.map(async result => {
          const response = await fetch(result.url);
          return await response.json();
        })
        return Promise.all(promisesArray);
      }).then((fetchedPokemon) => {

        setPokemons((currentPokemons) => [...currentPokemons, ...fetchedPokemon]);
        if (numberOfPokemonToFetch + offset > maxPokemonToShow) {
          numberOfPokemonToFetch = maxPokemonToShow - offset;
        }
        offset = numberOfPokemonToFetch + offset;
      });
  }

  useEffect(() => {
    loadPokemon();
    window.addEventListener('scroll', handleScroll);
  }, [])


  if (pokemons.length === 0) return <div>Loading...</div>;

  return (
    <div className='flex flex-wrap justify-center pb-10 max-w-2xl mx-auto'>
      {pokemons &&
        pokemons.map((pokemon, index) => {
          return (
            <PokemonCard key={pokemon.name} pokemon={pokemon} />
          )
        })}
    </div>
  );
}
