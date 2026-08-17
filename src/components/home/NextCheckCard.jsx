import BaseCard from '../ui/BaseCard.jsx'

function NextCheckCard() {
  return (
    <BaseCard className="status-card next-check-card">
      <p className="status-card__title">다음 체크인</p>
      <strong className="next-check-card__count">D-28</strong>
      <p className="next-check-card__date">9월 11일 · 12주차</p>

      <div className="next-check-card__progress" aria-hidden="true">
        <span className="is-filled" />
        <span className="is-filled" />
        <span className="is-filled" />
        <span className="is-filled" />
        <span className="is-filled" />
        <span className="is-filled" />
        <span className="is-filled" />
        <span />
        <span />
        <span />
      </div>

      <p className="next-check-card__message">
        사진을 업로드해야
        <br />
        변화를 알 수 있어요
      </p>
    </BaseCard>
  )
}

export default NextCheckCard
