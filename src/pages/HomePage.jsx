import ChangeSummaryCard from '../components/home/ChangeSummaryCard.jsx'
import HowItWorks from '../components/home/HowItWorks.jsx'
import HomeHeader from '../components/home/HomeHeader.jsx'
import HomeStatusGrid from '../components/home/HomeStatusGrid.jsx'
import BottomNavigation from '../components/navigation/BottomNavigation.jsx'
import '../styles/home.css'

function HomePage({ onOpenCheckIn }) {
  return (
    <main className="app-shell home-page">
      <HomeHeader />
      <ChangeSummaryCard />
      <HomeStatusGrid />
      <HowItWorks onUpload={onOpenCheckIn} />
      <BottomNavigation />
    </main>
  )
}

export default HomePage
