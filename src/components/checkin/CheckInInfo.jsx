function CheckInInfo() {
  return (
    <section className="check-in-info" aria-label="체크인 날짜 정보">
      <dl>
        <div className="check-in-info__row">
          <dt>그래프가 멈춘 날</dt>
          <dd>2026.05.22</dd>
        </div>
        <div className="check-in-info__row">
          <dt>홈케어 시작</dt>
          <dd>2026.06.20</dd>
        </div>
        <div className="check-in-info__row">
          <dt>비어 있는 구간</dt>
          <dd className="is-muted">2개월 23일</dd>
        </div>
      </dl>
    </section>
  )
}

export default CheckInInfo
