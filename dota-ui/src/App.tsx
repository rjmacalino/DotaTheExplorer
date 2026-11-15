import { useEffect, useState } from 'react'

function App() {
  const [message, setMessage] = useState('Loading...')

  useEffect(() => {
    fetch('http://localhost:5000/api/test') // Use your backend's actual URL
      .then(res => res.json())
      .then(data => setMessage(data.message))
      .catch(() => setMessage('Failed to connect'))
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Connection Test</h1>
      <p className="text-lg text-green-500">{message}</p>
    </div>
  )
}

export default App
