import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0b0c10] flex flex-col items-center justify-center p-8 text-center">
      <h1 className="text-8xl font-bold text-[#e3b04b] tracking-widest mb-4">404</h1>
      <h2 className="text-2xl font-bold text-white uppercase tracking-wider mb-2">
        Page Not Found
      </h2>
      <p className="text-gray-400 mb-8 max-w-md">
        The page you are looking for doesn't exist. Maybe you took a wrong turn in the jungle?
      </p>
      
      <Link 
        to="/" 
        className="px-6 py-3 bg-[#15171e] border border-[#2c303b] hover:border-[#e3b04b] text-white text-sm font-bold uppercase tracking-wider rounded-sm transition-colors"
      >
        Return to Base
      </Link>
    </div>
  )
}