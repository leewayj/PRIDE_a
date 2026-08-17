import CheckInHeader from '../components/checkin/CheckInHeader.jsx'
import '../styles/checkin.css'

function CheckInPage({ onBack }) {
  return (
    <main className="app-shell check-in-page">
      <CheckInHeader onBack={onBack} />
    </main>
  )
}

export default CheckInPage
