import BaseCard from '../ui/BaseCard.jsx'
import { formatPhotoDate } from '../../utils/dateFormat.js'

function TimelineCard({ daysRemaining, isCheckinTime, markerDate }) {
  return (
    <BaseCard className="timeline-card">
      <span className="timeline-card__status">{isCheckinTime ? '체크인 가능' : '다음 체크인'}</span>
      <strong className="timeline-card__dday">{isCheckinTime ? 'D-DAY' : `D-${daysRemaining}`}</strong>
      <p className="timeline-card__marker-date">관리 기록 {formatPhotoDate(markerDate)}</p>
    </BaseCard>
  )
}

export default TimelineCard
