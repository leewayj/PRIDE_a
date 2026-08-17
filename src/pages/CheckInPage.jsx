import CheckInActions from '../components/checkin/CheckInActions.jsx'
import CheckInHeader from '../components/checkin/CheckInHeader.jsx'
import CheckInInfo from '../components/checkin/CheckInInfo.jsx'
import CheckInNotice from '../components/checkin/CheckInNotice.jsx'
import TimelineCard from '../components/checkin/TimelineCard.jsx'
import '../styles/checkin.css'

function CheckInPage({ onBack }) {
  return (
    <main className="app-shell check-in-page">
      <CheckInHeader onBack={onBack} />
      <TimelineCard />
      <CheckInInfo />
      <CheckInNotice />
      <CheckInActions onLater={onBack} />
    </main>
  )
}

export default CheckInPage
