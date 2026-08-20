import { useNavigate } from 'react-router-dom'
import BottomNavigation from '../../components/navigation/BottomNavigation.jsx'
import ActionButton from '../../components/ui/ActionButton.jsx'
import BaseCard from '../../components/ui/BaseCard.jsx'
import '../../styles/measurement-scope.css'

const SUPPORTED_ITEMS = ['얼굴폭', '턱선 각도', '눈꺼풀 높이', '입가 각도']
const UNSUPPORTED_ITEMS = ['모공', '탄력', '색소', '주름 깊이']

function ScopeList({ items }) {
  return (
    <ul className="measurement-scope-page__list">
      {items.map((item) => (
        <li key={item}><span aria-hidden="true">✓</span>{item}</li>
      ))}
    </ul>
  )
}

function MeasurementScopeNoticePage() {
  const navigate = useNavigate()

  return (
    <main className="app-shell measurement-scope-page">
      <header className="measurement-scope-page__header">
        <button type="button" onClick={() => navigate(-1)} aria-label="이전 화면으로 돌아가기">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 5-7 7 7 7" /></svg>
        </button>
        <span>사진 분석 범위</span>
      </header>

      <section className="measurement-scope-page__intro">
        <span>분석 범위 안내</span>
        <h1>사진으로 확인할 수 있는 것과<br />확인하기 어려운 것이 있습니다</h1>
        <p>일반 사진의 변화 기록은 아래 범위 안에서 보여드려요.</p>
      </section>

      <BaseCard className="measurement-scope-page__card measurement-scope-page__card--supported">
        <p className="measurement-scope-page__label">사진으로 확인 가능한 영역</p>
        <h2>얼굴 형태의 변화를 기록해요</h2>
        <ScopeList items={SUPPORTED_ITEMS} />
      </BaseCard>

      <BaseCard className="measurement-scope-page__card measurement-scope-page__card--unsupported">
        <p className="measurement-scope-page__label">일반 사진만으로 정확하게 확인하기 어려운 영역</p>
        <ScopeList items={UNSUPPORTED_ITEMS} />
        <p className="measurement-scope-page__reason">일반 카메라 사진만으로는 정확하게 확인하기 어렵습니다.</p>
      </BaseCard>

      <aside className="measurement-scope-page__notice">
        <div aria-hidden="true">
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" /><path d="M12 8v5M12 16.5h.01" /></svg>
        </div>
        <section>
          <span>전문 측정 안내</span>
          <h2>전문 장비를 이용하면<br />추가적으로 확인할 수 있습니다</h2>
          <p>필요한 경우 전문 측정 기관에서 별도로 확인해 보세요.</p>
        </section>
      </aside>

      <ActionButton className="measurement-scope-page__cta" fullWidth onClick={() => navigate('/changes')}>확인했어요</ActionButton>
      <BottomNavigation />
    </main>
  )
}

export default MeasurementScopeNoticePage
