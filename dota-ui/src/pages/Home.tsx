import { useState, useMemo, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import Footer from '../components/Footer'

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
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/heroes`)
      if (!res.ok) throw new Error('Failed to fetch')
      return res.json()
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  })

  // Set the page title when this component mounts
  useEffect(() => {
    document.title = 'Dota 2 Meta Explorer'
  }, [])

  // Helper for attribute icons
  const getAttrIcon = (attr: string) => {
    switch (attr) {
      case 'str': return 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/icons/hero_strength.png'
      case 'agi': return 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/icons/hero_agility.png'
      case 'int': return 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/icons/hero_intelligence.png'
      default: return 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/icons/hero_universal.png'
    }
  }

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
          {Array.from({ length: 32 }).map((_, index) => (
            <HeroCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </div>
  )

  if (isError) return <div className="p-8 text-red-500">Error loading data.</div>

  const hasNoResults = processedHeroes.length === 0

  // 4. THE UI
  return (
    <div className="min-h-screen bg-[#0b0c10] p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header & Controls */}
        <div className="border-b border-[#2c303b] pb-4 mb-8 flex flex-col xl:flex-row xl:items-end justify-between gap-4">
          <h1 className="text-3xl font-bold text-white tracking-wide uppercase">
            Dota 2 <span className="text-[#e3b04b]">Meta</span> Explorer
          </h1>
          
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
            
            {/* Search Bar */}
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
        </div>

        {/* The Grid */}
        {hasNoResults ? (
          <div className="flex flex-col items-center justify-center py-20 bg-[#15171e] border border-[#2c303b] rounded-sm">
            <p className="text-gray-400 text-lg mb-4">No heroes found matching your search.</p>
            <button 
              onClick={() => { setSearchQuery(''); setAttributeFilter('all_heroes'); }}
              className="px-4 py-2 bg-[#0b0c10] border border-[#2c303b] hover:border-[#e3b04b] text-white text-sm font-bold uppercase tracking-wider rounded-sm transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
            {processedHeroes.map((hero) => {
              const winRate = hero.pub_pick > 0 
                ? ((hero.pub_win / hero.pub_pick) * 100).toFixed(1) 
                : '0.0'

              const attrTitle = hero.primary_attr === 'all' ? 'Universal' : 
                                hero.primary_attr === 'str' ? 'Strength' : 
                                hero.primary_attr === 'agi' ? 'Agility' : 'Intelligence'

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
                      {/* Attribute Icon Only */}
                      <span title={attrTitle} className="flex items-center">
                        <img 
                          src={getAttrIcon(hero.primary_attr)} 
                          alt={attrTitle} 
                          className="w-4 h-4 object-contain opacity-80 hover:opacity-100 transition-opacity" 
                        />
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
        )}
        
      </div>
      <Footer />
    </div>
  )
}

// A placeholder component that mimics the shape of a hero card
function HeroCardSkeleton() {
  return (
    <div className="bg-[#15171e] border border-[#2c303b] rounded-sm overflow-hidden flex flex-col">
      <div className="h-24 w-full bg-[#1a1c23] animate-pulse"></div>
      <div className="p-3 flex flex-col flex-grow">
        <div className="h-4 bg-[#1a1c23] rounded-sm w-3/4 animate-pulse"></div>
        <div className="flex justify-between items-center mt-auto pt-2">
          <div className="h-4 w-4 bg-[#1a1c23] rounded-sm animate-pulse"></div>
          <div className="h-4 bg-[#1a1c23] rounded-sm w-10 animate-pulse"></div>
        </div>
      </div>
    </div>
  )
}

export default Home
