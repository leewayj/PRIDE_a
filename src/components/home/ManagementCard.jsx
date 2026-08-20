import BaseCard from '../ui/BaseCard.jsx'
import ActionButton from '../ui/ActionButton.jsx'
import { formatPhotoDate } from '../../utils/dateFormat.js'

function ManagementCard({ currentCare, status, onRetry, onAdd }) {
  return (
    <BaseCard className="status-card management-card">
      <p className="status-card__title">지금 하고 있는 관리</p>

      {status === 'loading' ? (
        <p className="management-card__state" aria-live="polite">관리 목록을 불러오고 있어요.</p>
      ) : status === 'error' ? (
        <div className="management-card__state" role="alert">
          <p>관리 목록을 불러오지 못했어요.</p>
          <ActionButton onClick={onRetry}>다시 시도</ActionButton>
        </div>
      ) : currentCare.length === 0 ? (
        <p className="management-card__state">아직 등록한 관리가 없어요.</p>
      ) : (
        <ul className="management-card__list">
          {currentCare.map((care) => (
            <li key={`${care.note}-${care.latestDate}`}>
              <strong>{care.note}</strong>
              <span>{care.count}회 · 최근 {formatPhotoDate(care.latestDate)}</span>
            </li>
          ))}
        </ul>
      )}

      <button className="management-card__add" type="button" onClick={onAdd}>
        관리 추가
      </button>
    </BaseCard>
  )
}

export default ManagementCard
