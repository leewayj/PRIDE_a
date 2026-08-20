import { useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import CheckInActions from '../components/checkin/CheckInActions.jsx'
import CheckInHeader from '../components/checkin/CheckInHeader.jsx'
import CheckInInfo from '../components/checkin/CheckInInfo.jsx'
import CheckInNotice from '../components/checkin/CheckInNotice.jsx'
import TimelineCard from '../components/checkin/TimelineCard.jsx'
import '../styles/checkin.css'

function CheckInPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const navigationStartedRef = useRef(false)
  const goBack = () => navigate(-1)
  const addPhotos = () => {
    if (navigationStartedRef.current) return
    navigationStartedRef.current = true

    const markerId = location.state?.marker?.id ?? location.state?.checkIn?.markerId
    const scheduledAt = location.state?.checkIn?.scheduledAt

    navigate('/photos/years', {
      state: {
        source: 'checkIn',
        ...(markerId ? { markerId } : {}),
        ...(scheduledAt ? { scheduledAt } : {}),
      },
    })
  }

  return (
    <main className="app-shell check-in-page">
      <CheckInHeader onBack={goBack} />
      <TimelineCard />
      <CheckInInfo />
      <CheckInNotice />
      <CheckInActions onAddPhotos={addPhotos} onLater={goBack} />
    </main>
  )
}

export default CheckInPage
