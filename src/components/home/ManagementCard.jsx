import BaseCard from '../ui/BaseCard.jsx'

function ManagementCard() {
  return (
    <BaseCard className="status-card management-card">
      <p className="status-card__title">지금 하고 있는 관리</p>

      <ul className="management-card__list">
        <li>식단 조절</li>
        <li>리프팅 시술</li>
        <li>보톡스 시술</li>
      </ul>

      <button className="management-card__add" type="button">
        관리 추가
      </button>
    </BaseCard>
  )
}

export default ManagementCard
