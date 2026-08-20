import ManagementCard from './ManagementCard.jsx'

function HomeStatusGrid({ currentCare, status, onRetry, onAdd }) {
  return (
    <section className="home-status-grid" aria-label="홈케어 현황">
      <ManagementCard
        currentCare={currentCare}
        status={status}
        onRetry={onRetry}
        onAdd={onAdd}
      />
    </section>
  )
}

export default HomeStatusGrid
