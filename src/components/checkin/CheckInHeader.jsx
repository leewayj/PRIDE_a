function CheckInHeader({ onBack }) {
  return (
    <header className="check-in-header">
      <button
        className="check-in-header__back"
        type="button"
        onClick={onBack}
        aria-label="홈으로 돌아가기"
      >
        ←
      </button>

      <p className="check-in-header__eyebrow">CHECK - IN</p>
      <h1 className="check-in-header__title">
        홈케어 8주차입니다
        <br />
        그동안 뭐가 달라졌는지 볼 차례예요
      </h1>
      <p className="check-in-header__description">
        폰에 이미 있는 사진 5장이면 충분합니다.
      </p>
    </header>
  )
}

export default CheckInHeader
