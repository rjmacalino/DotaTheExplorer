import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import HeroDetail from './pages/HeroDetail'
import NotFound from './pages/NotFound'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/hero/:id" element={<HeroDetail />} />
      
      {/* Catch-all route for 404s. MUST be the last route. */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
