import BaseCard from '../ui/BaseCard.jsx'
import ActionButton from '../ui/ActionButton.jsx'

function ChangeSummaryCard({ summary, status, onRetry }) {
  if (status === 'loading') {
    return (
      <BaseCard className="change-summary-card home-data-state" aria-live="polite">
        <p>최근 변화 정보를 불러오고 있어요.</p>
      </BaseCard>
    )
  }

  if (status === 'error') {
    return (
      <BaseCard className="change-summary-card home-data-state" role="alert">
        <strong>최근 변화 정보를 불러오지 못했어요.</strong>
        <p>잠시 후 다시 시도해 주세요.</p>
        <ActionButton onClick={onRetry}>다시 시도</ActionButton>
      </BaseCard>
    )
  }

  if (!summary?.eligible) {
    const reasons = summary?.reasons ?? []
    return (
      <BaseCard className="change-summary-card home-data-state">
        <p className="change-summary-card__label">턱선 각도 · 최근 변화</p>
        <strong>아직 변화 요약을 만들 수 없어요.</strong>
        {reasons.length > 0 && (
          <ul>
            {reasons.map((reason) => <li key={reason}>{reason}</li>)}
          </ul>
        )}
      </BaseCard>
    )
  }

  return (
    <BaseCard className="change-summary-card home-data-state">
      <p className="change-summary-card__label">턱선 각도 · 최근 변화</p>
      <strong>변화 요약이 준비되었어요.</strong>
      <p>기록에서 시간에 따른 변화 흐름을 자세히 확인해 보세요.</p>
    </BaseCard>
  )
}

export default ChangeSummaryCard
