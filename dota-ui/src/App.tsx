import { useQuery } from '@tanstack/react-query'

// Define what a Hero looks like based on OpenDota's data
interface Hero {
  id: number
  localized_name: string
  primary_attr: string
  img: string
  pub_pick: number
  pub_win: number
}

function App() {
  const { data: heroes = [], isLoading, isError } = useQuery<Hero[]>({
    queryKey: ['heroes'],
    queryFn: async () => {
      const res = await fetch('http://localhost:5223/api/heroes')
      if (!res.ok) throw new Error('Failed to fetch')
      return res.json()
    },
  })

  if (isLoading) return <div className="p-8 text-white">Loading heroes...</div>
  if (isError) return <div className="p-8 text-red-500">Error loading data.</div>

  return (
    <div className="min-h-screen bg-[#0b0c10] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="border-b border-[#2c303b] pb-4 mb-8">
          <h1 className="text-3xl font-bold text-white tracking-wide uppercase">
            Dota 2 <span className="text-[#e3b04b]">Meta</span> Explorer
          </h1>
        </div>
        
        {/* The Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
          {heroes.map((hero) => {
            // Calculate win rate
            const winRate = hero.pub_pick > 0 
              ? ((hero.pub_win / hero.pub_pick) * 100).toFixed(1) 
              : '0.0'

            // Map attributes to distinct colors
            const attrColor = 
              hero.primary_attr === 'str' ? 'text-red-500' :
              hero.primary_attr === 'agi' ? 'text-green-500' :
              hero.primary_attr === 'int' ? 'text-blue-500' :
              'text-gray-300' // Universal

            return (
              <div 
                key={hero.id} 
                // Solid card, sharp borders, no backdrop blur
                className="bg-[#15171e] border border-[#2c303b] rounded-sm overflow-hidden hover:border-[#e3b04b] transition-colors duration-200 cursor-pointer flex flex-col"
              >
                {/* Hero Image */}
                <div className="relative h-24 w-full bg-black">
                  <img
                    src={`https://cdn.cloudflare.steamstatic.com${hero.img}`}
                    alt={hero.localized_name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Hero Info */}
                <div className="p-3 flex flex-col flex-grow">
                  <h2 className="text-gray-100 font-semibold text-sm truncate uppercase tracking-tight">
                    {hero.localized_name}
                  </h2>
                  
                  <div className="flex justify-between items-center mt-auto pt-2">
                    <span className={`text-xs font-bold uppercase ${attrColor}`}>
                      {hero.primary_attr === 'all' ? 'Univ' : hero.primary_attr}
                    </span>
                    <span className="text-gray-300 font-mono text-sm">
                      {winRate}%
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default App
