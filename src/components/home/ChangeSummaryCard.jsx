import BaseCard from '../ui/BaseCard.jsx'

function ChangeSummaryCard() {
  return (
    <BaseCard className="change-summary-card">
      <p className="change-summary-card__label">
        턱선 각도 · 홈케어 시작 대비
      </p>
      <strong className="change-summary-card__value">+1.5°</strong>

      <div className="change-summary-card__period">
        <span>홈케어 이후</span>
        <p>8주 전 130.2° → 오늘 131.7°</p>
      </div>

      <div className="change-summary-card__chart">
        <svg viewBox="0 0 320 116" aria-hidden="true">
          <line
            className="change-summary-card__start-line"
            x1="76"
            y1="24"
            x2="76"
            y2="101"
          />
          <text className="change-summary-card__start-label" x="82" y="18">
            관리 시작
          </text>
          <path
            className="change-summary-card__trend-line"
            d="M14 88 C38 87 57 89 78 86 C108 83 126 85 150 77 C176 68 194 62 218 56 C248 48 271 39 304 29"
          />
          <circle
            className="change-summary-card__end-point"
            cx="304"
            cy="29"
            r="5"
          />
        </svg>
      </div>

      <p className="change-summary-card__note">
        3주차부터 8주 내내 변화가 지속되고 있습니다
      </p>
    </BaseCard>
  )
}

export default ChangeSummaryCard
