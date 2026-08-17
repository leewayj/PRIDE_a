import { useNavigate } from 'react-router-dom'
import ActionButton from '../../components/ui/ActionButton.jsx'
import '../../styles/onboarding.css'

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m15 5-7 7 7 7" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  )
}

function OnboardingPhotoGuidePage() {
  const navigate = useNavigate()

  return (
    <section className="photo-guide-page">
      <header className="photo-guide-page__header">
        <button className="photo-guide-page__back" type="button" onClick={() => navigate(-1)} aria-label="이전 화면으로 돌아가기">
          <BackIcon />
        </button>
      </header>

      <div className="photo-guide-page__intro">
        <h1>정면 사진 3장을<br />골라주세요.</h1>
        <p>서로 다른 시기의 사진일수록 변화를 더 잘 확인할 수 있어요.</p>
      </div>

      <div className="photo-guide-page__examples" aria-label="사진 세 장 선택 예시">
        {[1, 2, 3].map((number) => (
          <div key={number}>
            <span aria-hidden="true">+</span>
            <small>사진 {number}</small>
          </div>
        ))}
      </div>

      <ul className="photo-guide-page__requirements">
        <li>얼굴을 정면으로 바라봐 주세요.</li>
        <li>얼굴 전체가 선명한 사진이 좋아요.</li>
        <li>선글라스나 마스크는 벗어주세요.</li>
      </ul>

      <aside className="photo-guide-page__notice">
        사진은 기기 안에서만 사용되며 서버로 전송되지 않아요.
      </aside>

      <div className="photo-guide-page__cta">
        <ActionButton fullWidth onClick={() => navigate('/onboarding/photos/select')}>사진 선택</ActionButton>
      </div>
    </section>
  )
}

export default OnboardingPhotoGuidePage
