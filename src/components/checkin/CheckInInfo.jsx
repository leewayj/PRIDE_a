import { formatPhotoDate } from '../../utils/dateFormat.js'

function CheckInInfo({ markerDate, daysSince, daysRemaining }) {
  return (
    <section className="check-in-info" aria-label="체크인 날짜 정보">
      <dl>
        <div className="check-in-info__row">
          <dt>관리 기록 날짜</dt>
          <dd>{formatPhotoDate(markerDate)}</dd>
        </div>
        <div className="check-in-info__row">
          <dt>관리 기록 후</dt>
          <dd>{daysSince}일</dd>
        </div>
        <div className="check-in-info__row">
          <dt>체크인까지</dt>
          <dd className="is-muted">{daysRemaining}일</dd>
        </div>
      </dl>
    </section>
  )
}

export default CheckInInfo
