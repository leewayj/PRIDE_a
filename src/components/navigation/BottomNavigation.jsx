import { NavLink, useLocation } from 'react-router-dom'
import '../../styles/navigation.css'

function BottomNavigation() {
  const location = useLocation()
  const isCurveRoute = location.pathname === '/curve' || location.pathname.startsWith('/curve/')
  const isCareRoute = location.pathname.startsWith('/care-markers')
  const isMeasurementScopeRoute = location.pathname === '/onboarding/measurement-scope'
  return (
    <nav className="bottom-navigation" aria-label="주요 메뉴">
      <NavLink
        className={({ isActive }) =>
          `bottom-navigation__item${isActive ? ' is-active' : ''}`
        }
        to="/"
        end
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M3.5 10.5 12 3.8l8.5 6.7v9.2h-6v-5.8h-5v5.8h-6z" />
        </svg>
        <span>홈</span>
      </NavLink>

      <NavLink
        className={({ isActive }) =>
          `bottom-navigation__item${isActive ? ' is-active' : ''}`
        }
        to="/photos"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
          <circle cx="9" cy="9" r="1.5" />
          <path d="m5.5 17 4.2-4.2 3.1 3 2.2-2.2 3.5 3.4" />
        </svg>
        <span>사진 업로드</span>
      </NavLink>

      <NavLink
        className={({ isActive }) =>
          `bottom-navigation__item${isActive || isCurveRoute || isCareRoute || isMeasurementScopeRoute ? ' is-active' : ''}`
        }
        to="/changes"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 18.5h16M5.5 15l4-4 3.2 2.7L18.5 7" />
          <circle cx="5.5" cy="15" r="1" />
          <circle cx="9.5" cy="11" r="1" />
          <circle cx="12.7" cy="13.7" r="1" />
          <circle cx="18.5" cy="7" r="1" />
        </svg>
        <span>기록</span>
      </NavLink>

      <NavLink
        className={({ isActive }) =>
          `bottom-navigation__item${isActive && !isMeasurementScopeRoute ? ' is-active' : ''}`
        }
        to="/onboarding"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4.5 5.5c2.8-.7 5.3-.1 7.5 1.7v12c-2.2-1.8-4.7-2.4-7.5-1.7zM19.5 5.5c-2.8-.7-5.3-.1-7.5 1.7v12c2.2-1.8 4.7-2.4 7.5-1.7z" />
        </svg>
        <span>내 얼굴</span>
      </NavLink>

    </nav>
  )
}

export default BottomNavigation
