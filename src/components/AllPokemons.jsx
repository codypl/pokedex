import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks'
import PokemonCard from './PokemonCard'
import {NUMBER_OF_POKEMON_TO_FETCH, MAX_POKEMON_TO_SHOW} from '../config';

export default function AllPokemons() {
  let offset = 0
  let numberOfPokemonToFetch = NUMBER_OF_POKEMON_TO_FETCH;
  const maxPokemonToShow = MAX_POKEMON_TO_SHOW;
  const [pokemons, setPokemons] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleScroll = (e) => {
    if (offset + numberOfPokemonToFetch <= maxPokemonToShow && offset != maxPokemonToShow) {
      if (window.innerHeight + e.target.documentElement.scrollTop + 1 >= e.target.documentElement.scrollHeight) {
        loadPokemons()
      }
    }
  }

  let loadPokemons = async () => {

    if (!isLoading) {
      try {
        setIsLoading(true)

        fetch(`https://pokeapi.co/api/v2/pokemon/?limit=${numberOfPokemonToFetch}&offset=${offset}`)
          .then(response => response.json())
          .then(data => {
            let results = data.results;
            let promisesArray = results.map(async result => {
              const response = await fetch(result.url);
              return await response.json();
            })
            return Promise.all(promisesArray);
          }).then((fetchedPokemons) => {
            setPokemons((currentPokemons) => [...currentPokemons, ...fetchedPokemons]);

            offset += numberOfPokemonToFetch;

            if (offset + numberOfPokemonToFetch > maxPokemonToShow) {
              console.log('max reached')
              numberOfPokemonToFetch = maxPokemonToShow - offset;
            }

            setIsLoading(false);

          });
      } catch (error) {
        console.log(error);
      }
    }

  }

  useEffect(() => {
    loadPokemons();
    window.addEventListener('scroll', handleScroll);
  }, [])


  if (pokemons.length === 0) return <div>Loading...</div>;

  return (
    <div className='flex flex-wrap justify-center max-w-2xl pb-10 mx-auto'>
      {pokemons &&
        pokemons.map((pokemon) => {
          return (
            <PokemonCard key={pokemon.name} pokemon={pokemon} />
          )
        })}
    </div>
  );
}
