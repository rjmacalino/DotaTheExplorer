import { useParams, Link } from 'react-router-dom'

export default function HeroDetail() {
  // useParams reads the URL. If the URL is /hero/12, id will be "12"
  const { id } = useParams()

  return (
    <div className="min-h-screen bg-[#0b0c10] p-8 flex flex-col items-center justify-center text-white">
      <h1 className="text-4xl font-bold mb-4">Hero Detail Page</h1>
      <p className="text-xl text-gray-400 mb-8">
        Displaying data for Hero ID: <span className="text-[#e3b04b] font-mono">{id}</span>
      </p>
      <Link 
        to="/" 
        className="px-6 py-2 bg-[#15171e] border border-[#2c303b] hover:border-[#e3b04b] rounded-sm uppercase tracking-wider text-sm font-bold transition-colors"
      >
        Back to Grid
      </Link>
    </div>
  )
}