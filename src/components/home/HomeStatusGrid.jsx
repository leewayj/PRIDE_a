import ManagementCard from './ManagementCard.jsx'
import NextCheckCard from './NextCheckCard.jsx'

function HomeStatusGrid() {
  return (
    <section className="home-status-grid" aria-label="홈케어 현황">
      <NextCheckCard />
      <ManagementCard />
    </section>
  )
}

export default HomeStatusGrid
