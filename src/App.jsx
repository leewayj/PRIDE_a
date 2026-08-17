import { BrowserRouter, Route, Routes } from 'react-router-dom'
import ChangesPage from './pages/ChangesPage.jsx'
import CheckInPage from './pages/CheckInPage.jsx'
import HomePage from './pages/HomePage.jsx'
import PhotosPage from './pages/PhotosPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/check-in" element={<CheckInPage />} />
        <Route path="/photos" element={<PhotosPage />} />
        <Route path="/changes" element={<ChangesPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
