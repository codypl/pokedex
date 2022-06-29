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
        <p class="info">N°{pokemon.id}</p>
        <p className="text-base title">{pokemon.species.name}</p>
        <ListTypes />
      </div>

      {showModal ? (
        <>

          <div className="w-5/6 h-fit max-h-[94vh] md:w-[30rem] overflow-y-auto mx-auto fixed  rounded-lg z-20 inset-0 my-auto">
            <div className='flex flex-col items-center p-6 text-center bg-white shadow-lg'>
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

                  <p class="info">N°{pokemon.id}</p>
                  <p className="title">{pokemon.species.name}</p>

                  <ListTypes />

                  <p className='subheading'>Pokédex entry</p>
                  <p>{pokemonDetails.flavor_text}</p>

                  <div className='flex justify-around w-full space-x-2'>
                    <Information name={'Height'} value={pokemon.height / 10 + `m`} />
                    <Information name={'Weight'} value={pokemon.weight / 10 + `Kg`} />
                  </div>

                  <p className='subheading'>Stats</p>
                  <ListStats />

                  <p className='subheading'>Evolutions</p>
                  <ListEvolutions />

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

  function Information(props) {
    return (
      <div className='flex flex-col grow'>
        <p className='mb-1 subheading'>
          {props.name}
        </p>
        <div className='w-full py-1 bg-gray-100 rounded-full'>
          {props.value}
        </div>
      </div>
    )
  }

  function ListTypes() {
    return (
      <div className="flex justify-between mx-auto mt-2 space-x-2 w-fit">
        {pokemon.types.map((type) => {
          return (
            <TypeBadge type={type} />
          )
        })}
      </div>
    )
  }

  function TypeBadge(props) {
    return (
      <div style={{ backgroundColor: `var(--color-${props.type.type.name})` }} className={`text-white px-2 py-1 rounded-md text-xs font-bold uppercase`} key={pokemon.name + props.type.type.name}><p>{props.type.type.name}</p></div>
    )
  }

  function ListStats() {
    let total = 0
    return (
      <div className="flex flex-wrap justify-around w-full space-x-2">
        {pokemon.stats.map((stat) => {
          total += stat.base_stat
          return (
            <div key={pokemon.name + stat.stat.name}>
              <Stat name={stat.stat.name} value={stat.base_stat} />
            </div>
          )
        })}
        <Stat name={"total"} value={total} />
      </div >
    )
  }

  function Stat(props) {
    return (
      <div className='flex flex-col text-center bg-gray-100 rounded-full w-fit h-fit'>
        <p style={{ backgroundColor: `var(--color-${props.name})` }} className="text-sm font-bold rounded-full m-0.5 p-1 overflow-hidden text-opacity-75 w-9 h-9 flex justify-center items-center">
          {getShorterNameStat(props.name)}
        </p>
        <p className="rounded-b-full mb-1.5 mx-1">
          {props.value}
        </p>
      </div>
    )
  }

  function ListEvolutions() {
    return (
      <>
        {
          pokemonDetails.evolutions.length > 1 ? (
            <div className='flex flex-wrap justify-around items-center w-full'>
              {pokemonDetails.evolutions.map((evolution, index) => {
              let hasEvolution = pokemonDetails.evolutions[index+1] && pokemonDetails.evolutions[index+1].evolution_profil > evolution.evolution_profil
              console.log(hasEvolution)
                return (
                  <>
                    <img alt={evolution.species_name} className='rendering-pixelated'
                      src={evolution.image}
                    />
                    {hasEvolution ? "→" : null}
                  </>
                )
              })}
            </div>

          ) : (<p>∅</p>)
        }
      </>
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
      case 'total':
        return 'TOT'
      default:
        break;
    }
  }

}



export default PokemonCard