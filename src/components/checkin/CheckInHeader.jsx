function CheckInHeader({ onBack, title, description }) {
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
      <h1 className="check-in-header__title">{title}</h1>
      {description && <p className="check-in-header__description">{description}</p>}
    </header>
  )
}

export default CheckInHeader
