import { Outlet } from 'react-router-dom'
import BottomNavigation from '../components/navigation/BottomNavigation.jsx'
import '../styles/photos.css'

function PhotosLayout() {
  return (
    <main className="app-shell photos-layout">
      <Outlet />
      <BottomNavigation />
    </main>
  )
}

export default PhotosLayout
