import { useEffect, useState } from 'react'
import CheckInPage from './pages/CheckInPage.jsx'
import HomePage from './pages/HomePage.jsx'

function App() {
  const [route, setRoute] = useState(window.location.hash)

  useEffect(() => {
    const handleHashChange = () => setRoute(window.location.hash)

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const openCheckIn = () => {
    window.location.hash = '/check-in'
  }

  const goHome = () => {
    window.location.hash = '/'
  }

  if (route === '#/check-in') {
    return <CheckInPage onBack={goHome} />
  }

  return <HomePage onOpenCheckIn={openCheckIn} />
}

export default App
