import { useNavigate } from 'react-router-dom'
import CheckInActions from '../components/checkin/CheckInActions.jsx'
import CheckInHeader from '../components/checkin/CheckInHeader.jsx'
import CheckInInfo from '../components/checkin/CheckInInfo.jsx'
import CheckInNotice from '../components/checkin/CheckInNotice.jsx'
import TimelineCard from '../components/checkin/TimelineCard.jsx'
import '../styles/checkin.css'

function CheckInPage() {
  const navigate = useNavigate()
  const goBack = () => navigate(-1)

  return (
    <main className="app-shell check-in-page">
      <CheckInHeader onBack={goBack} />
      <TimelineCard />
      <CheckInInfo />
      <CheckInNotice />
      <CheckInActions onLater={goBack} />
    </main>
  )
}

export default CheckInPage
