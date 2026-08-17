import BaseCard from '../ui/BaseCard.jsx'

function TimelineCard() {
  return (
    <BaseCard className="timeline-card">
      <div className="timeline-card__graphic" aria-hidden="true">
        <svg viewBox="0 0 320 94" role="presentation">
          <path
            className="timeline-card__ticks"
            d="M14 28v10 M36 31v7 M58 28v10 M80 31v7 M102 28v10 M124 31v7 M146 28v10 M168 31v7 M190 28v10 M212 31v7 M234 28v10 M256 31v7 M278 28v10 M306 25v13"
          />
          <line
            className="timeline-card__axis"
            x1="14"
            y1="38"
            x2="306"
            y2="38"
          />
          <line
            className="timeline-card__care-line"
            x1="176"
            y1="13"
            x2="176"
            y2="66"
          />
          <circle
            className="timeline-card__care-point"
            cx="176"
            cy="38"
            r="4.5"
          />
          <circle
            className="timeline-card__today-point"
            cx="306"
            cy="38"
            r="5"
          />
          <text className="timeline-card__care-label" x="184" y="15">
            홈케어 시작
          </text>
        </svg>
      </div>

      <div className="timeline-card__dates">
        <span>2026.03</span>
        <span>5.22</span>
        <span>오늘 9.11</span>
      </div>

      <p className="timeline-card__prompt">이 구간을 채워주세요</p>
    </BaseCard>
  )
}

export default TimelineCard
