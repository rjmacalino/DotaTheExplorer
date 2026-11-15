import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'

interface Hero {
  id: number
  localized_name: string
  img: string
  primary_attr: string
}

interface Matchup {
  hero_id: number
  games_played: number
  wins: number
}

export default function HeroDetail() {
  const { id } = useParams()

  // 1. Fetch all heroes (React Query will instantly load this from the cache, no extra network request!)
  const { data: allHeroes = [] } = useQuery<Hero[]>({
    queryKey: ['heroes'],
    queryFn: async () => {
      const res = await fetch('http://localhost:5223/api/heroes')
      return res.json()
    },
  })

  // Find the specific hero we are looking at based on the URL id
  const hero = allHeroes.find((h) => h.id === Number(id))

  // 2. Fetch the matchups for this specific hero
  const { data: matchups = [], isLoading } = useQuery<Matchup[]>({
    queryKey: ['matchups', id],
    queryFn: async () => {
      const res = await fetch(`http://localhost:5223/api/heroes/${id}/matchups`)
      return res.json()
    },
  })

  if (!hero) return <div className="p-8 text-white">Hero not found.</div>
  if (isLoading) return <div className="p-8 text-white">Loading matchups...</div>

  return (
    <div className="min-h-screen bg-[#0b0c10] p-8 text-white">
      <div className="max-w-4xl mx-auto">
        
        <Link to="/" className="text-gray-400 hover:text-[#e3b04b] mb-8 inline-block text-sm uppercase tracking-wider font-bold">
          &larr; Back to Grid
        </Link>

        {/* Hero Header */}
        <div className="flex items-center gap-6 bg-[#15171e] border border-[#2c303b] p-6 rounded-sm mb-8">
          <img 
            src={`https://cdn.cloudflare.steamstatic.com${hero.img}`} 
            alt={hero.localized_name}
            className="w-32 h-20 object-cover rounded-sm bg-black"
          />
          <div>
            <h1 className="text-4xl font-bold uppercase tracking-wide">{hero.localized_name}</h1>
            <p className="text-[#e3b04b] uppercase font-bold text-sm mt-1">{hero.primary_attr}</p>
          </div>
        </div>

        {/* Matchups Table */}
        <h2 className="text-xl font-bold uppercase tracking-wider mb-4 text-gray-300">Matchups</h2>
        <div className="bg-[#15171e] border border-[#2c303b] rounded-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#0b0c10] text-gray-400 uppercase text-xs">
              <tr>
                <th className="px-4 py-3">Opponent</th>
                <th className="px-4 py-3 text-right">Games Played</th>
                <th className="px-4 py-3 text-right">Win Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2c303b]">
              {/* Sort matchups by most games played, then show top 10 */}
              {matchups
                .sort((a, b) => b.games_played - a.games_played)
                .slice(0, 10)
                .map((matchup) => {
                  const opponent = allHeroes.find((h) => h.id === matchup.hero_id)
                  const winRate = ((matchup.wins / matchup.games_played) * 100).toFixed(1)
                  
                  return (
                    <tr key={matchup.hero_id} className="hover:bg-[#1a1c23]">
                      <td className="px-4 py-3 font-semibold">{opponent?.localized_name || 'Unknown'}</td>
                      <td className="px-4 py-3 text-right text-gray-400">{matchup.games_played.toLocaleString()}</td>
                      <td className={`px-4 py-3 text-right font-mono font-bold ${Number(winRate) >= 50 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {winRate}%
                      </td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
