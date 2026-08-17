import { BrowserRouter, Route, Routes } from 'react-router-dom'
import CheckInPage from './pages/CheckInPage.jsx'
import HomePage from './pages/HomePage.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/check-in" element={<CheckInPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
