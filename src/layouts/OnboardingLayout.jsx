import { Outlet } from 'react-router-dom'
import BottomNavigation from '../components/navigation/BottomNavigation.jsx'

function OnboardingLayout() {
  return (
    <main className="app-shell onboarding-layout">
      <Outlet />
      <BottomNavigation />
    </main>
  )
}

export default OnboardingLayout
