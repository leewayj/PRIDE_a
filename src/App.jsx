import { BrowserRouter, Route, Routes } from 'react-router-dom'
import PhotoSelectionProvider from './context/PhotoSelectionProvider.jsx'
import OnboardingLayout from './layouts/OnboardingLayout.jsx'
import PhotosLayout from './layouts/PhotosLayout.jsx'
import ChangesPage from './pages/ChangesPage.jsx'
import CheckInPage from './pages/CheckInPage.jsx'
import HomePage from './pages/HomePage.jsx'
import PhotoAnalyzingPage from './pages/PhotoAnalyzingPage.jsx'
import PhotoOtherPage from './pages/PhotoOtherPage.jsx'
import PhotoStatusPage from './pages/PhotoStatusPage.jsx'
import PhotoYearDetailPage from './pages/PhotoYearDetailPage.jsx'
import PhotosPage from './pages/PhotosPage.jsx'
import PhotoYearsPage from './pages/PhotoYearsPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import OnboardingCompletePage from './pages/onboarding/OnboardingCompletePage.jsx'
import OnboardingGuidePage from './pages/onboarding/OnboardingGuidePage.jsx'
import OnboardingIntroPage from './pages/onboarding/OnboardingIntroPage.jsx'
import OnboardingPhotoGuidePage from './pages/onboarding/OnboardingPhotoGuidePage.jsx'
import OnboardingPhotoSelectPage from './pages/onboarding/OnboardingPhotoSelectPage.jsx'
import retraceRoutes from './routes/retraceRoutes.jsx'

function App() {
  return (
    <PhotoSelectionProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/check-in" element={<CheckInPage />} />
          <Route path="/photos" element={<PhotosLayout />}>
            <Route index element={<PhotoStatusPage />} />
            <Route path="upload" element={<PhotosPage />} />
            <Route path="analyzing" element={<PhotoAnalyzingPage />} />
            <Route path="other" element={<PhotoOtherPage />} />
            <Route path="years" element={<PhotoYearsPage />} />
            <Route path="years/:year" element={<PhotoYearDetailPage />} />
          </Route>
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
          {retraceRoutes}
        </Routes>
      </BrowserRouter>
    </PhotoSelectionProvider>
  )
}

export default App
