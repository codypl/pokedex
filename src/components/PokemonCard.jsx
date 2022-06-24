import { useState, useEffect } from 'preact/hooks'

function PokemonCard(props) {

  const [over, setOver] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const pokemon = props.pokemon

  const isAnimated = pokemon.id < 650
  const sprite_animated = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/' + (isAnimated ? 'animated/' : '') + pokemon.id + (isAnimated ? '.gif' : '.png')

  useEffect(() => {
    showModal && (document.body.style.overflow = 'hidden');
    !showModal && (document.body.style.overflow = 'unset');
  }, [showModal]);

  return (
    <div className={`w-full md:w-[33%] min-w-fit `}>
      <div className={`mt-14 p-5 mx-6 md:mx-3 relative hover:cursor-pointer hover:shadow-xl shadow-md transition-all duration-200 bg-white rounded-lg flex justify-center items-center flex-col`}
        onMouseOver={() => setOver(true)}
        onMouseLeave={() => setOver(false)}
        onClick={() => setShowModal(true)}
      >
        <img alt={pokemon.species.name} className={(over ? `w-24 -top-12` : `w-20 -top-10`) + ` absolute h-auto transition-all rendering-pixelated `}
          src={pokemon.sprites.front_default}
        />
        <span className="mt-3 font-bold capitalize">{pokemon.species.name}</span>
        <ListTypes />

      </div>

      {showModal ? (
        <div className=''>
          <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
            <div className="m-6 md:m-0 max-w-lg w-full md:w-96 border-0 rounded-lg shadow-lg relative flex flex-col bg-white ">
              <button
                className="absolute top-4 right-4 self-end flex items-center justify-center bg-stone-100 w-10 h-10 rounded-full"
                onClick={() => setShowModal(false)}
              >
                <span className='sr-only'>Close</span><span className='not-sr-only font-bold text-stone-500 text-xl'>X</span>
              </button>

              <div className="mx-6 my-6">
                <div className='w-fit'>
                  <p className="opacity-60 text-lg mb-0">#{pokemon.id}</p>
                  <p className='text-3xl font-bold capitalize'>{pokemon.species.name}</p>
                </div>
                <img alt={pokemon.species.name} className='w-3/5 mx-auto h-auto rendering-pixelated' src={sprite_animated} />
                <ListTypes />
                <ListStats />
              </div>
            </div>
          </div>
          <div onClick={() => setShowModal(false)} className="opacity-25 fixed inset-0 z-40 bg-black"></div>
        </div>
      ) : null}
    </div>

  )

  function ListTypes() {
    return (
      <div className="w-fit mx-auto mt-4 flex justify-between space-x-2">
        {pokemon.types.map((type) => {
          return (
            <div style={{ backgroundColor: `var(--color-${type.type.name})` }} className={`text-white px-2 py-1 rounded-md text-xs font-bold uppercase`} key={pokemon.name + type.type.name}><span>{type.type.name}</span></div>
          )
        })}
      </div>
    )
  }

  function ListStats() {
    return (

      <div className="flex justify-center space-x-2 text-xs font-bold mt-4">
        {pokemon.stats.map((stat) => {
          return (
            <div key={pokemon.name + stat.stat.name} className='bg-gray-100 rounded-full flex flex-col w-fit h-fit text-center'>
              <div style={{ backgroundColor: `var(--color-${stat.stat.name})` }} className="rounded-full m-0.5 p-1 overflow-hidden text-opacity-75 h-8 w-8 flex justify-center items-center">
                {getShorterNameStat(stat.stat.name)}
              </div>
              <div className="rounded-b-full mb-1.5 mx-1">
                {stat.base_stat}
              </div>

            </div>
          )
        })
        }
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