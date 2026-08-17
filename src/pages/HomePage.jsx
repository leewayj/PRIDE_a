import ChangeSummaryCard from '../components/home/ChangeSummaryCard.jsx'
import HomeHeader from '../components/home/HomeHeader.jsx'
import '../styles/home.css'

function HomePage() {
  return (
    <main className="app-shell home-page">
      <HomeHeader />
      <ChangeSummaryCard />
    </main>
  )
}

export default HomePage
