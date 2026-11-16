import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LabelList } from 'recharts'
import Footer from '../components/Footer'

interface Hero {
  id: number
  localized_name: string
  img: string
  primary_attr: string
  // Public Stats
  "1_pick": number; "1_win": number;
  "2_pick": number; "2_win": number;
  "3_pick": number; "3_win": number;
  "4_pick": number; "4_win": number;
  "5_pick": number; "5_win": number;
  "6_pick": number; "6_win": number;
  "7_pick": number; "7_win": number;
  "8_pick": number; "8_win": number;
  // Pro Stats
  pro_pick: number
  pro_win: number
  pro_ban: number
}

interface Matchup {
  hero_id: number
  games_played: number
  wins: number
}

export default function HeroDetail() {
  const { id } = useParams()
  
  // State for minimum games filter
  const [minGames, setMinGames] = useState(1)

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

  const bracketData = hero ? [
    { name: 'Herald', winRate: hero["1_pick"] ? Number(((hero["1_win"] / hero["1_pick"]) * 100).toFixed(1)) : 0 },
    { name: 'Guardian', winRate: hero["2_pick"] ? Number(((hero["2_win"] / hero["2_pick"]) * 100).toFixed(1)) : 0 },
    { name: 'Crusader', winRate: hero["3_pick"] ? Number(((hero["3_win"] / hero["3_pick"]) * 100).toFixed(1)) : 0 },
    { name: 'Archon', winRate: hero["4_pick"] ? Number(((hero["4_win"] / hero["4_pick"]) * 100).toFixed(1)) : 0 },
    { name: 'Legend', winRate: hero["5_pick"] ? Number(((hero["5_win"] / hero["5_pick"]) * 100).toFixed(1)) : 0 },
    { name: 'Ancient', winRate: hero["6_pick"] ? Number(((hero["6_win"] / hero["6_pick"]) * 100).toFixed(1)) : 0 },
    { name: 'Divine', winRate: hero["7_pick"] ? Number(((hero["7_win"] / hero["7_pick"]) * 100).toFixed(1)) : 0 },
  ] : []

  const proWinRate = hero && hero.pro_pick > 0 
    ? ((hero.pro_win / hero.pro_pick) * 100).toFixed(1) 
    : '0.0'

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
        <div className="max-w-6xl mx-auto">
          <div className="h-4 w-32 bg-[#1a1c23] rounded-sm animate-pulse mb-8"></div>
          <div className="flex items-center gap-6 bg-[#15171e] border border-[#2c303b] p-6 rounded-sm mb-8">
            <div className="w-32 h-20 bg-[#1a1c23] rounded-sm animate-pulse"></div>
            <div>
              <div className="h-10 w-48 bg-[#1a1c23] rounded-sm animate-pulse mb-2"></div>
              <div className="h-4 w-16 bg-[#1a1c23] rounded-sm animate-pulse"></div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-8">
             <div className="h-20 bg-[#15171e] border border-[#2c303b] rounded-sm animate-pulse"></div>
             <div className="h-20 bg-[#15171e] border border-[#2c303b] rounded-sm animate-pulse"></div>
             <div className="h-20 bg-[#15171e] border border-[#2c303b] rounded-sm animate-pulse"></div>
          </div>
          <div className="h-6 w-64 bg-[#1a1c23] rounded-sm animate-pulse mb-4 mt-8"></div>
          <div className="bg-[#15171e] border border-[#2c303b] rounded-sm h-80 w-full mb-8 animate-pulse"></div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <div className="bg-[#15171e] border border-[#2c303b] rounded-sm h-64 w-full animate-pulse"></div>
            <div className="bg-[#15171e] border border-[#2c303b] rounded-sm h-64 w-full animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!hero) return <div className="p-8 text-white">Hero not found.</div>

  const processedMatchups = matchups.map(m => {
    const opponent = allHeroes.find(h => h.id === m.hero_id)
    const winRate = (m.wins / m.games_played) * 100
    return { ...m, opponent, winRate }
  })
  .filter(m => m.opponent && m.games_played >= minGames)

  const goodMatchups = [...processedMatchups].filter(m => m.winRate >= 50).sort((a, b) => b.winRate - a.winRate)
  const badMatchups = [...processedMatchups].filter(m => m.winRate < 50).sort((a, b) => a.winRate - b.winRate)

  return (
    <div className="min-h-screen bg-[#0b0c10] p-8 text-white">
      <div className="max-w-6xl mx-auto">
        
        <Link to="/" className="text-gray-400 hover:text-[#e3b04b] mb-8 inline-block text-sm uppercase tracking-wider font-bold">
          &larr; Back to Grid
        </Link>

        {/* Hero Header */}
        <div className="flex items-center gap-6 bg-[#15171e] border border-[#2c303b] p-6 rounded-sm mb-6">
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

        {/* Pro Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-[#15171e] border border-[#2c303b] p-4 rounded-sm flex flex-col justify-center items-center">
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Pro Picks</p>
            <p className="text-2xl font-mono font-bold text-white">{hero.pro_pick.toLocaleString()}</p>
          </div>
          <div className="bg-[#15171e] border border-[#2c303b] p-4 rounded-sm flex flex-col justify-center items-center">
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Pro Bans</p>
            <p className="text-2xl font-mono font-bold text-red-400">{hero.pro_ban.toLocaleString()}</p>
          </div>
          <div className="bg-[#15171e] border border-[#2c303b] p-4 rounded-sm flex flex-col justify-center items-center">
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Pro Win Rate</p>
            <p className={`text-2xl font-mono font-bold ${Number(proWinRate) >= 50 ? 'text-emerald-500' : 'text-red-500'}`}>
              {proWinRate}%
            </p>
          </div>
        </div>

        {/* Win Rate by Bracket Chart */}
        <h2 className="text-xl font-bold uppercase tracking-wider mb-4 text-gray-300 mt-8 pl-4">Win Rate by Skill Bracket</h2>
        <div className="bg-[#15171e] border border-[#2c303b] rounded-sm p-4 h-80 w-full mb-8">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={bracketData} margin={{ top: 20, right: 10, left: -20, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2c303b" vertical={false} />
              
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

        {/* Matchups Header & Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-12 mb-4 gap-4 border-b border-[#2c303b] pb-4">
          <h2 className="text-2xl font-bold uppercase tracking-wider text-gray-300">Matchups</h2>
          
          <div className="flex items-center gap-3">
            <label htmlFor="minGames" className="text-sm text-gray-400 uppercase tracking-wider">
              Min. Games Played
            </label>
            <select
              id="minGames"
              value={minGames}
              onChange={(e) => setMinGames(Number(e.target.value))}
              className="bg-[#15171e] text-gray-300 text-sm font-bold uppercase tracking-wider border border-[#2c303b] rounded-sm px-3 py-1.5 outline-none focus:border-[#e3b04b] cursor-pointer"
            >
              <option value="1">Any</option>
              <option value="10">10+</option>
              <option value="20">20+</option>
              <option value="50">50+</option>
              <option value="100">100+</option>
            </select>
          </div>
        </div>

        {/* Matchups Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          
          {/* STRONG AGAINST */}
          <div>
            {/* Added pl-4 here */}
            <h3 className="text-lg font-bold uppercase tracking-wider mb-3 pl-4 text-emerald-500">Strong Against</h3>
            <div className="bg-[#15171e] border border-[#2c303b] rounded-sm max-h-[500px] overflow-y-auto custom-scrollbar">
              <table className="w-full text-left text-sm relative">
                <thead className="bg-[#0b0c10] text-gray-400 uppercase text-xs sticky top-0 z-10 shadow-md shadow-black/50">
                  <tr>
                    <th className="px-4 py-3">Opponent</th>
                    <th className="px-4 py-3 text-right">Games</th>
                    <th className="px-4 py-3 text-right">{hero.localized_name} WR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2c303b]">
                  {goodMatchups.length > 0 ? goodMatchups.map((matchup) => (
                    <tr key={matchup.hero_id} className="hover:bg-[#1a1c23] transition-colors">
                      <td className="px-4 py-3 font-semibold">
                        {matchup.opponent && (
                          <Link 
                            to={`/hero/${matchup.opponent.id}`} 
                            className="flex items-center gap-3 hover:text-emerald-400 transition-colors group"
                          >
                            <img
                              src={`https://cdn.cloudflare.steamstatic.com${matchup.opponent.img}`}
                              alt={matchup.opponent.localized_name}
                              className="w-12 h-7 object-cover rounded-sm bg-black shadow-sm border border-[#2c303b] group-hover:border-emerald-400 transition-colors"
                            />
                            {matchup.opponent.localized_name}
                          </Link>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-400">{matchup.games_played.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-emerald-500">
                        {matchup.winRate.toFixed(1)}%
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                        No matchups found meeting the criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* WEAK AGAINST */}
          <div>
            {/* Added pl-4 here */}
            <h3 className="text-lg font-bold uppercase tracking-wider mb-3 pl-4 text-red-500">Weak Against</h3>
            <div className="bg-[#15171e] border border-[#2c303b] rounded-sm max-h-[500px] overflow-y-auto custom-scrollbar">
              <table className="w-full text-left text-sm relative">
                <thead className="bg-[#0b0c10] text-gray-400 uppercase text-xs sticky top-0 z-10 shadow-md shadow-black/50">
                  <tr>
                    <th className="px-4 py-3">Opponent</th>
                    <th className="px-4 py-3 text-right">Games</th>
                    <th className="px-4 py-3 text-right">{hero.localized_name} WR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2c303b]">
                  {badMatchups.length > 0 ? badMatchups.map((matchup) => (
                    <tr key={matchup.hero_id} className="hover:bg-[#1a1c23] transition-colors">
                      <td className="px-4 py-3 font-semibold">
                        {matchup.opponent && (
                          <Link 
                            to={`/hero/${matchup.opponent.id}`} 
                            className="flex items-center gap-3 hover:text-red-400 transition-colors group"
                          >
                            <img
                              src={`https://cdn.cloudflare.steamstatic.com${matchup.opponent.img}`}
                              alt={matchup.opponent.localized_name}
                              className="w-12 h-7 object-cover rounded-sm bg-black shadow-sm border border-[#2c303b] group-hover:border-red-400 transition-colors"
                            />
                            {matchup.opponent.localized_name}
                          </Link>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-400">{matchup.games_played.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-red-500">
                        {matchup.winRate.toFixed(1)}%
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                        No matchups found meeting the criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
      <Footer />
    </div>
  )
}
