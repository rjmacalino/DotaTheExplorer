import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LabelList } from 'recharts'
import Footer from '../components/Footer'

interface Hero {
  id: number
  localized_name: string
  img: string
  primary_attr: string
  "1_pick": number; "1_win": number;
  "2_pick": number; "2_win": number;
  "3_pick": number; "3_win": number;
  "4_pick": number; "4_win": number;
  "5_pick": number; "5_win": number;
  "6_pick": number; "6_win": number;
  "7_pick": number; "7_win": number;
  "8_pick": number; "8_win": number;
}

interface Matchup {
  hero_id: number
  games_played: number
  wins: number
}

export default function HeroDetail() {
  const { id } = useParams()

  // Helper for attribute icons
  const getAttrIcon = (attr: string) => {
    switch (attr) {
      case 'str': return 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/icons/hero_strength.png'
      case 'agi': return 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/icons/hero_agility.png'
      case 'int': return 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/icons/hero_intelligence.png'
      default: return 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/icons/hero_universal.png'
    }
  }

  const { data: allHeroes = [], isLoading: isHeroesLoading } = useQuery<Hero[]>({
    queryKey: ['heroes'],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/heroes`)
      return res.json()
    },
  })

  const hero = allHeroes.find((h) => h.id === Number(id))

  useEffect(() => {
    if (hero) {
      document.title = `${hero.localized_name} | Dota 2 Meta Explorer`
    } else {
      document.title = 'Loading... | Dota 2 Meta Explorer'
    }
  }, [hero])

  // Transform the raw OpenDota data into an array Recharts can understand
  const bracketData = hero ? [
    { name: 'Herald', winRate: hero["1_pick"] ? Number(((hero["1_win"] / hero["1_pick"]) * 100).toFixed(1)) : 0 },
    { name: 'Guardian', winRate: hero["2_pick"] ? Number(((hero["2_win"] / hero["2_pick"]) * 100).toFixed(1)) : 0 },
    { name: 'Crusader', winRate: hero["3_pick"] ? Number(((hero["3_win"] / hero["3_pick"]) * 100).toFixed(1)) : 0 },
    { name: 'Archon', winRate: hero["4_pick"] ? Number(((hero["4_win"] / hero["4_pick"]) * 100).toFixed(1)) : 0 },
    { name: 'Legend', winRate: hero["5_pick"] ? Number(((hero["5_win"] / hero["5_pick"]) * 100).toFixed(1)) : 0 },
    { name: 'Ancient', winRate: hero["6_pick"] ? Number(((hero["6_win"] / hero["6_pick"]) * 100).toFixed(1)) : 0 },
    { name: 'Divine', winRate: hero["7_pick"] ? Number(((hero["7_win"] / hero["7_pick"]) * 100).toFixed(1)) : 0 },
  ] : []

  const { data: matchups = [], isLoading } = useQuery<Matchup[]>({
    queryKey: ['matchups', id],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/heroes/${id}/matchups`)
      return res.json()
    },
  })

  if (isHeroesLoading || isLoading) {
    return (
      <div className="min-h-screen bg-[#0b0c10] p-8">
        <div className="max-w-4xl mx-auto">
          <div className="h-4 w-32 bg-[#1a1c23] rounded-sm animate-pulse mb-8"></div>
          <div className="flex items-center gap-6 bg-[#15171e] border border-[#2c303b] p-6 rounded-sm mb-8">
            <div className="w-32 h-20 bg-[#1a1c23] rounded-sm animate-pulse"></div>
            <div>
              <div className="h-10 w-48 bg-[#1a1c23] rounded-sm animate-pulse mb-2"></div>
              <div className="h-4 w-16 bg-[#1a1c23] rounded-sm animate-pulse"></div>
            </div>
          </div>
          <div className="h-6 w-64 bg-[#1a1c23] rounded-sm animate-pulse mb-4 mt-8"></div>
          <div className="bg-[#15171e] border border-[#2c303b] rounded-sm h-80 w-full mb-8 animate-pulse"></div>
          <div className="h-6 w-32 bg-[#1a1c23] rounded-sm animate-pulse mb-4"></div>
          <div className="bg-[#15171e] border border-[#2c303b] rounded-sm h-64 w-full animate-pulse"></div>
        </div>
      </div>
    )
  }

  if (!hero) return <div className="p-8 text-white">Hero not found.</div>

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
            <div className="flex items-center gap-1.5 mt-1">
              <img 
                src={getAttrIcon(hero.primary_attr)} 
                alt={hero.primary_attr} 
                className="w-4 h-4 object-contain" 
              />
              <p className="text-[#e3b04b] uppercase font-bold text-sm">
                {hero.primary_attr === 'all' ? 'Universal' : hero.primary_attr}
              </p>
            </div>
          </div>
        </div>

        {/* Win Rate by Bracket Chart */}
        <h2 className="text-xl font-bold uppercase tracking-wider mb-4 text-gray-300 mt-8">Win Rate by Skill Bracket</h2>
        <div className="bg-[#15171e] border border-[#2c303b] rounded-sm p-4 h-80 w-full mb-8">
          <ResponsiveContainer width="100%" height="100%">
            {/* Increased bottom margin to make room for bigger labels */}
            <BarChart data={bracketData} margin={{ top: 20, right: 10, left: -20, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2c303b" vertical={false} />
              
              {/* Custom XAxis with bigger Rank Medals */}
              <XAxis 
                dataKey="name" 
                stroke="#6b7280" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                tick={(props) => {
                  const { x, y, payload } = props;
                  const rankMap: Record<string, number> = {
                    'Herald': 1, 'Guardian': 2, 'Crusader': 3, 'Archon': 4, 
                    'Legend': 5, 'Ancient': 6, 'Divine': 7
                  };
                  const rankNum = rankMap[payload.value];
                  
                  return (
                    <g transform={`translate(${x},${y})`}>
                      <image 
                        href={`https://www.opendota.com/assets/images/dota2/rank_icons/rank_icon_${rankNum}.png`} 
                        x={-16} 
                        y={5} 
                        width={32} 
                        height={32} 
                      />
                      <text 
                        x={0} 
                        y={50} 
                        dy={0} 
                        textAnchor="middle" 
                        fill="#9ca3af" 
                        fontSize={11}
                        fontWeight="bold"
                      >
                        {payload.value}
                      </text>
                    </g>
                  );
                }}
              />
              
              <YAxis 
                domain={[40, 60]} 
                ticks={[40, 45, 50, 55, 60]} 
                allowDataOverflow={true}
                stroke="#6b7280" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
              />
              
              <Tooltip 
                cursor={{ fill: '#1a1c23' }}
                contentStyle={{ backgroundColor: '#0b0c10', borderColor: '#2c303b', color: '#fff' }}
                formatter={(value) => [`${value}%`, 'Win Rate']}
              />
              
              {/* Bar with labels on top */}
              <Bar dataKey="winRate" fill="#e3b04b" radius={[2, 2, 0, 0]}>
                <LabelList 
                  dataKey="winRate" 
                  position="top" 
                  fill="#e3b04b" 
                  fontSize={12} 
                  fontWeight="bold" 
                  formatter={(value: number) => `${value}%`} 
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Matchups Table */}
        <h2 className="text-xl font-bold uppercase tracking-wider mb-4 text-gray-300">Matchups</h2>
        <div className="bg-[#15171e] border border-[#2c303b] rounded-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#0b0c10] text-gray-400 uppercase text-xs">
              <tr>
                <th className="px-4 py-3">Opponent</th>
                <th className="px-4 py-3 text-right">Games Played</th>
                {/* Dynamic header */}
                <th className="px-4 py-3 text-right">{hero.localized_name} Win Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2c303b]">
              {matchups
                .sort((a, b) => b.games_played - a.games_played)
                .slice(0, 10)
                .map((matchup) => {
                  const opponent = allHeroes.find((h) => h.id === matchup.hero_id)
                  const winRate = ((matchup.wins / matchup.games_played) * 100).toFixed(1)
                  
                  return (
                    <tr key={matchup.hero_id} className="hover:bg-[#1a1c23] transition-colors">
                      <td className="px-4 py-3 font-semibold">
                        {opponent && (
                          <Link 
                            to={`/hero/${opponent.id}`} 
                            className="flex items-center gap-3 hover:text-[#e3b04b] transition-colors group"
                          >
                            <img
                              src={`https://cdn.cloudflare.steamstatic.com${opponent.img}`}
                              alt={opponent.localized_name}
                              className="w-12 h-7 object-cover rounded-sm bg-black shadow-sm border border-[#2c303b] group-hover:border-[#e3b04b] transition-colors"
                            />
                            {opponent.localized_name}
                          </Link>
                        )}
                      </td>
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
      <Footer />
    </div>
  )
}