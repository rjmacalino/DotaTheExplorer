import { useEffect, useState } from 'react'

function App() {
  const [message, setMessage] = useState('Loading...')

  useEffect(() => {
    fetch('http://localhost:5223/api/test')
      .then(res => res.json())
      .then(data => setMessage(data.message))
      .catch(() => setMessage('Failed to connect'))
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-white mb-2">Connection Test</h1>
        <p className="text-emerald-400 text-lg">{message}</p>
      </div>
    </div>
  )
}

export default App
