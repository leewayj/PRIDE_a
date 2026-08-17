import '../../styles/navigation.css'

function BottomNavigation() {
  return (
    <nav className="bottom-navigation" aria-label="주요 메뉴">
      <button
        className="bottom-navigation__item is-active"
        type="button"
        aria-current="page"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M3.5 10.5 12 3.8l8.5 6.7v9.2h-6v-5.8h-5v5.8h-6z" />
        </svg>
        <span>홈</span>
      </button>

      <button className="bottom-navigation__item" type="button">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
          <circle cx="9" cy="9" r="1.5" />
          <path d="m5.5 17 4.2-4.2 3.1 3 2.2-2.2 3.5 3.4" />
        </svg>
        <span>사진</span>
      </button>

      <button className="bottom-navigation__item" type="button">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 18.5h16M5.5 15l4-4 3.2 2.7L18.5 7" />
          <circle cx="5.5" cy="15" r="1" />
          <circle cx="9.5" cy="11" r="1" />
          <circle cx="12.7" cy="13.7" r="1" />
          <circle cx="18.5" cy="7" r="1" />
        </svg>
        <span>변화</span>
      </button>

      <button className="bottom-navigation__item" type="button">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="8" r="3.5" />
          <path d="M5.5 20c.5-4 2.8-6.2 6.5-6.2s6 2.2 6.5 6.2" />
        </svg>
        <span>나</span>
      </button>
    </nav>
  )
}

export default BottomNavigation
