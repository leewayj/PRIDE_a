import { BrowserRouter, Route, Routes } from 'react-router-dom'
import OnboardingLayout from './layouts/OnboardingLayout.jsx'
import ChangesPage from './pages/ChangesPage.jsx'
import CheckInPage from './pages/CheckInPage.jsx'
import HomePage from './pages/HomePage.jsx'
import PhotosPage from './pages/PhotosPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import OnboardingCompletePage from './pages/onboarding/OnboardingCompletePage.jsx'
import OnboardingGuidePage from './pages/onboarding/OnboardingGuidePage.jsx'
import OnboardingIntroPage from './pages/onboarding/OnboardingIntroPage.jsx'
import OnboardingPhotoGuidePage from './pages/onboarding/OnboardingPhotoGuidePage.jsx'
import OnboardingPhotoSelectPage from './pages/onboarding/OnboardingPhotoSelectPage.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/check-in" element={<CheckInPage />} />
        <Route path="/photos" element={<PhotosPage />} />
        <Route path="/changes" element={<ChangesPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/onboarding" element={<OnboardingLayout />}>
          <Route index element={<OnboardingIntroPage />} />
          <Route path="guide" element={<OnboardingGuidePage />} />
          <Route path="photos" element={<OnboardingPhotoGuidePage />} />
          <Route path="photos/select" element={<OnboardingPhotoSelectPage />} />
          <Route path="result" element={<OnboardingCompletePage />} />
          <Route path="complete" element={<OnboardingCompletePage completion />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
