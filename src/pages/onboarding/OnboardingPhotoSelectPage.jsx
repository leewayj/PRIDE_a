import { useNavigate } from 'react-router-dom'
import PhotoRequirements from '../../components/onboarding/PhotoRequirements.jsx'
import PhotoSlot from '../../components/onboarding/PhotoSlot.jsx'
import ActionButton from '../../components/ui/ActionButton.jsx'
import '../../styles/onboarding.css'

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m15 5-7 7 7 7" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  )
}

function OnboardingPhotoSelectPage() {
  const navigate = useNavigate()

  return (
    <section className="photo-select-page">
      <header className="photo-select-page__header">
        <button
          className="photo-select-page__back"
          type="button"
          onClick={() => navigate('/onboarding/photos')}
          aria-label="이전 화면으로 돌아가기"
        >
          <BackIcon />
        </button>
      </header>

      <div className="photo-select-page__intro">
        <h1>과거 사진 3장을<br />골라주세요.</h1>
        <p>서로 다른 시기의 정면 사진을 선택해 주세요.</p>
      </div>

      <div className="photo-slot-grid">
        {[1, 2, 3].map((number) => <PhotoSlot number={number} key={number} />)}
      </div>

      <PhotoRequirements />

      <aside className="photo-select-page__notice">
        <span aria-hidden="true">!</span>
        <p><strong>사진은 기기 안에서만 사용돼요.</strong><br />선택한 사진은 지금 단계에서 업로드되지 않습니다.</p>
      </aside>

      <div className="photo-select-page__cta">
        <ActionButton fullWidth className="photo-select-page__button">
          사진 선택
        </ActionButton>
      </div>
    </section>
  )
}

export default OnboardingPhotoSelectPage
