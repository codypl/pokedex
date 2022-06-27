import { useState, useEffect } from 'preact/hooks'
import { MAX_POKEMON_TO_SHOW } from '../config';

function PokemonCard(props) {

  const [isLoading, setIsLoading] = useState(false);
  const [over, setOver] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [pokemonDetails, setPokemonDetails] = useState({
    flavor_text: '',
    evolutions: [],
  });

  const pokemon = props.pokemon

  let loadPokemonDetails = async (pokemonId) => {
    setIsLoading(true)

    const urlSpecies = 'https://pokeapi.co/api/v2/pokemon-species/' + pokemonId;
    const responseSpecies = await fetch(urlSpecies);
    const species = await responseSpecies.json();

    const reponseEvolutions = await fetch(species.evolution_chain.url);
    const evolution_chain = await reponseEvolutions.json();

    for (let i = 0; i < species.flavor_text_entries.length; i++) {
      if (species.flavor_text_entries[i].language.name == 'en') {
        setPokemonDetails(previousState => {
          return { ...previousState, flavor_text: species.flavor_text_entries[i].flavor_text.replace('', ' ') }
        });
        break
      }
    }

    let evoChain = [];
    let evoData = evolution_chain.chain;
    let evolution_profil = 0
    do {
      let numberOfEvolutions = evoData.evolves_to.length;
      evolution_profil++

      if (filterIdFromSpeciesURL(evoData.species.url) <= MAX_POKEMON_TO_SHOW && evoChain.find(evolution => evolution.id === filterIdFromSpeciesURL(evoData.species.url)) === undefined) {
        
        evoChain.push({
          "id": filterIdFromSpeciesURL(evoData.species.url),
          "species_name": evoData.species.name,
          "evolution_profil": evolution_profil,
          "image": 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/' + filterIdFromSpeciesURL(evoData.species.url) + '.png'
        });
      }

      if (numberOfEvolutions > 1) {
        for (let i = 0; i < numberOfEvolutions; i++) {
          if (filterIdFromSpeciesURL(evoData.evolves_to[i].species.url) <= MAX_POKEMON_TO_SHOW) {
            evoChain.push({
              "id": filterIdFromSpeciesURL(evoData.evolves_to[i].species.url),
              "evolution_profil": evolution_profil + 1,
              "species_name": evoData.evolves_to[i].species.name,
              "image": 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/' + filterIdFromSpeciesURL(evoData.evolves_to[i].species.url) + '.png'
            });
          }
        }
      }

      evoData = evoData.evolves_to[0];

    } while (evoData != undefined && evoData.hasOwnProperty('evolves_to'));

    // evoChain.sort(function (a, b) {
    //   return a.id - b.id;
    // });

    setPokemonDetails(previousState => {
      return { ...previousState, evolutions: evoChain }
    });

    setIsLoading(false)
  }

  let showPokemonDetails = () => {
    setShowModal(true)
    loadPokemonDetails(pokemon.id)
  }

  let filterIdFromSpeciesURL = (url) => {
    return url.replace('https://pokeapi.co/api/v2/pokemon-species/', '').replace('/', '');
  }

  useEffect(() => {
    showModal && (document.body.style.overflow = 'hidden');
    !showModal && (document.body.style.overflow = 'unset');
  }, [showModal]);

  return (
    <div className={`w-full md:w-[33%] min-w-fit `}>
      <div className={`mt-14 p-5 mx-6 md:mx-3 relative border-2 border-slate-100 hover:border-slate-200 hover:cursor-pointer hover:shadow-lg shadow-sm transition-all duration-200 bg-white rounded-xl flex justify-center items-center flex-col`}
        onMouseOver={() => setOver(true)}
        onMouseLeave={() => setOver(false)}
        onClick={() => showPokemonDetails()}
      >
        <img alt={pokemon.species.name} className={(over ? `w-24 -top-12` : `w-20 -top-10`) + ` absolute h-auto transition-all rendering-pixelated `}
          src={pokemon.sprites.front_default}
        />
        <img alt={pokemon.species.name} className='hidden w-2/5 h-auto rendering-pixelated'
          src={'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/' + pokemon.id + '.gif'}
        />
        <PokemonId />
        <PokemonName />
        <ListTypes />
      </div>

      {showModal ? (
        <>

          <div className="w-5/6 h-[90%] md:w-[30rem] mx-auto fixed z-20 inset-0 my-auto">
            <div className='flex flex-col items-center h-full p-6 overflow-y-scroll text-center bg-white rounded-lg shadow-lg'>
              <button className="absolute top-0 right-0 w-10 h-10 m-5 rounded-full shadow-lg bg-stone-100"
                onClick={() => setShowModal(false)}
              >
                <span className='sr-only'>Close</span><span className='text-xl font-bold not-sr-only text-stone-500'>X</span>
              </button>

              {isLoading ? (
                <p>Loading...</p>
              ) : (
                <>
                  <img alt={pokemon.species.name} className='w-1/4 h-auto rendering-pixelated'
                    src={'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/' + pokemon.id + '.gif'}
                  />

                  <PokemonId />
                  <span className='text-2xl'>
                    <PokemonName />
                  </span>

                  <ListTypes />
                  <span className='mt-5 mb-1 font-bold uppercase'>
                    Pokédex entry
                  </span>
                  {pokemonDetails.flavor_text}

                  <div className='flex justify-around w-full mt-5 space-x-2'>
                    <div className='flex flex-col w-1/2'>
                      <span className='mb-1 font-bold uppercase'>
                        Height
                      </span>
                      <div className='w-full py-1 bg-gray-100 rounded-full'>
                        {pokemon.height / 10}m
                      </div>
                    </div>
                    <div className='flex flex-col w-1/2'>
                      <span className='mb-1 font-bold uppercase'>
                        Weight
                      </span>
                      <div className='w-full py-1 bg-gray-100 rounded-full'>
                        {pokemon.weight / 10}Kg
                      </div>
                    </div>
                  </div>

                  <span className='mt-5 mb-1 font-bold uppercase'>Stats</span>
                  <ListStats />

                  <span className='mt-5 mb-1 font-bold uppercase'>Evolutions</span>
                  {pokemonDetails.evolutions.length > 1 ? (
                    <>
                      <div className='flex flex-wrap justify-around w-full'>
                        {pokemonDetails.evolutions.map(function (evolution) {
                          return (
                            <>
                              <img alt={evolution.species_name} className='rendering-pixelated'
                                src={evolution.image}
                              />
                            </>
                          )
                        })
                        }
                      </div>
                    </>
                  ) : (<p>∅</p>)}

                </>
              )
              }

            </div>
          </div>
          <div onClick={() => setShowModal(false)} className="fixed inset-0 z-10 bg-black opacity-25"></div>
        </>
      ) : null}
    </div>

  )

  function PokemonName() {
    return (
      <span className="font-bold capitalize">{pokemon.species.name}</span>
    )
  }

  function PokemonId() {
    return (
      <span className="mt-5 text-xs font-bold text-gray-500">N°{pokemon.id}</span>
    )
  }

  function ListTypes() {
    return (
      <div className="flex justify-between mx-auto mt-2 space-x-2 w-fit">
        {pokemon.types.map((type) => {
          return (
            <div style={{ backgroundColor: `var(--color-${type.type.name})` }} className={`text-white px-2 py-1 rounded-md text-xs font-bold uppercase`} key={pokemon.name + type.type.name}><span>{type.type.name}</span></div>
          )
        })}
      </div>
    )
  }

  function ListStats() {
    let total = 0
    return (

      <div className="flex flex-wrap justify-around w-full space-x-2">
        {pokemon.stats.map((stat) => {
          total += stat.base_stat
          return (
            <div key={pokemon.name + stat.stat.name} className='flex flex-col text-center bg-gray-100 rounded-full w-fit h-fit'>
              <div style={{ backgroundColor: `var(--color-${stat.stat.name})` }} className="text-sm font-bold rounded-full m-0.5 p-1 overflow-hidden text-opacity-75 w-9 h-9 flex justify-center items-center">
                {getShorterNameStat(stat.stat.name)}
              </div>
              <div className="rounded-b-full mb-1.5 mx-1">
                {stat.base_stat}
              </div>
            </div>
          )
        })}
        <div className='flex flex-col text-center bg-gray-100 rounded-full w-fit h-fit'>
          <div style={{ backgroundColor: `var(--color-total)` }} className="text-sm font-bold rounded-full m-0.5 p-1 overflow-hidden text-opacity-75 flex w-9 h-9 justify-center items-center">
            TOT
          </div>
          <div className="rounded-b-full mb-1.5 mx-1">
            {total}
          </div>
        </div>

      </div >
    )
  }

  function getShorterNameStat(statName) {
    switch (statName) {
      case 'hp':
        return 'HP'
      case 'attack':
        return 'ATK'
      case 'defense':
        return 'DEF'
      case 'special-attack':
        return 'SpA'
      case 'special-defense':
        return 'SpD'
      case 'speed':
        return 'SPD'
      default:
        break;
    }
  }

}



export default PokemonCard