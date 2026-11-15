import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'

// Define what a Hero looks like based on OpenDota's data
interface Hero {
  id: number
  localized_name: string
  primary_attr: string
  img: string
  pub_pick: number
  pub_win: number
}

function Home() {
  // 1. ALL HOOKS MUST GO AT THE VERY TOP
  const [attributeFilter, setAttributeFilter] = useState('all_heroes')
  const [sortBy, setSortBy] = useState('alphabetical')
  const [searchQuery, setSearchQuery] = useState('')

  const { data: heroes = [], isLoading, isError } = useQuery<Hero[]>({
    queryKey: ['heroes'],
    queryFn: async () => {
      const res = await fetch('http://localhost:5223/api/heroes')
      if (!res.ok) throw new Error('Failed to fetch')
      return res.json()
    },
  })

  // 2. CALCULATE FILTERED & SORTED HEROES
  const processedHeroes = useMemo(() => {
    const filtered = heroes.filter((hero) => {
      // 1. Check attribute filter
      const matchesAttribute = 
        attributeFilter === 'all_heroes' || 
        hero.primary_attr === attributeFilter

      // 2. Check search query (case-insensitive)
      const matchesSearch = 
        hero.localized_name.toLowerCase().includes(searchQuery.toLowerCase())

      // Both must be true
      return matchesAttribute && matchesSearch
    })

    const getWinRate = (hero: Hero) => hero.pub_pick > 0 ? (hero.pub_win / hero.pub_pick) : 0

    // We use [...filtered] to sort a copy, not the original array
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'alphabetical': 
          return a.localized_name.localeCompare(b.localized_name)
        case 'win_rate_desc': return getWinRate(b) - getWinRate(a)
        case 'win_rate_asc': return getWinRate(a) - getWinRate(b)
        case 'pick_rate_desc': return b.pub_pick - a.pub_pick
        default: return 0
      }
    })
  }, [heroes, attributeFilter, sortBy, searchQuery])

  // 3. EARLY RETURNS (Must come AFTER all hooks)
    if (isLoading) return (
    <div className="min-h-screen bg-[#0b0c10] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Fake Header */}
        <div className="border-b border-[#2c303b] pb-4 mb-8 flex flex-col xl:flex-row justify-between gap-4">
          <div className="h-9 w-64 bg-[#2c303b] rounded-sm animate-pulse"></div>
          <div className="h-8 w-full xl:w-96 bg-[#2c303b] rounded-sm animate-pulse"></div>
        </div>
        
        {/* Fake Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
          {/* Render 32 skeleton cards to fill large screens */}
          {Array.from({ length: 32 }).map((_, index) => (
            <HeroCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </div>
  )

  if (isError) return <div className="p-8 text-red-500">Error loading data.</div>

  // 4. THE UI
  return (
    <div className="min-h-screen bg-[#0b0c10] p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header & Controls */}
        <div className="border-b border-[#2c303b] pb-4 mb-8 flex flex-col xl:flex-row xl:items-end justify-between gap-4">
          <h1 className="text-3xl font-bold text-white tracking-wide uppercase">
            Dota 2 <span className="text-[#e3b04b]">Meta</span> Explorer
          </h1>
          
          {/* 👇 THIS IS THE NEW CONTAINER 👇 */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
            
            {/* ADD THIS SEARCH BAR */}
            <input
              type="text"
              placeholder="Search heroes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#15171e] text-white text-sm border border-[#2c303b] rounded-sm px-3 py-1.5 outline-none focus:border-[#e3b04b] w-full lg:w-48 placeholder-gray-500"
            />

            {/* Filter Buttons */}
            <div className="flex gap-2 flex-wrap">
              {[
                { id: 'all_heroes', label: 'All' },
                { id: 'str', label: 'Strength' },
                { id: 'agi', label: 'Agility' },
                { id: 'int', label: 'Intelligence' },
                { id: 'all', label: 'Universal' },
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setAttributeFilter(filter.id)}
                  className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-sm border transition-colors ${
                    attributeFilter === filter.id
                      ? 'bg-[#e3b04b] text-black border-[#e3b04b]'
                      : 'bg-[#15171e] text-gray-400 border-[#2c303b] hover:text-white hover:border-gray-500'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[#15171e] text-gray-300 text-xs font-bold uppercase tracking-wider border border-[#2c303b] rounded-sm px-2 py-1.5 outline-none focus:border-[#e3b04b] cursor-pointer"
            >
              <option value="alphabetical">A - Z</option>
              <option value="win_rate_desc">Highest Win Rate</option>
              <option value="win_rate_asc">Lowest Win Rate</option>
              <option value="pick_rate_desc">Most Picked</option>
            </select>
          </div>
          {/* 👆 END OF NEW CONTAINER 👆 */}
        </div>
        
        {/* The Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
          {processedHeroes.map((hero) => {
            const winRate = hero.pub_pick > 0 
              ? ((hero.pub_win / hero.pub_pick) * 100).toFixed(1) 
              : '0.0'

            const attrColor = 
              hero.primary_attr === 'str' ? 'text-red-500' :
              hero.primary_attr === 'agi' ? 'text-green-500' :
              hero.primary_attr === 'int' ? 'text-blue-500' :
              'text-gray-300'

            return (
              <Link
                to={`/hero/${hero.id}`}
                key={hero.id} 
                className="bg-[#15171e] border border-[#2c303b] rounded-sm overflow-hidden hover:border-[#e3b04b] transition-colors duration-200 cursor-pointer flex flex-col"
              >
                <div className="relative h-24 w-full bg-black">
                  <img
                    src={`https://cdn.cloudflare.steamstatic.com${hero.img}`}
                    alt={hero.localized_name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
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
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// A placeholder component that mimics the shape of a hero card
function HeroCardSkeleton() {
  return (
    // We copied the exact wrapper classes from the real card
    <div className="bg-[#15171e] border border-[#2c303b] rounded-sm overflow-hidden flex flex-col">
      {/* Image Placeholder (h-24 matches the real image) */}
      <div className="h-24 w-full bg-[#1a1c23] animate-pulse"></div>
      
      {/* Text Area (p-3 matches the real card) */}
      <div className="p-3 flex flex-col flex-grow">
        {/* Fake Hero Name (h-4 matches text-sm) */}
        <div className="h-4 bg-[#1a1c23] rounded-sm w-3/4 animate-pulse"></div>
        
        {/* Fake Bottom Row (matches the real flex row) */}
        <div className="flex justify-between items-center mt-auto pt-2">
          {/* Fake Attribute text */}
          <div className="h-3 bg-[#1a1c23] rounded-sm w-8 animate-pulse"></div>
          {/* Fake Win Rate text */}
          <div className="h-4 bg-[#1a1c23] rounded-sm w-10 animate-pulse"></div>
        </div>
      </div>
    </div>
  )
}

export default Home
