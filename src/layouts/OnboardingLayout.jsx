import { Outlet } from 'react-router-dom'

function OnboardingLayout() {
  return (
    <main className="app-shell onboarding-layout">
      <Outlet />
    </main>
  )
}

export default OnboardingLayout
