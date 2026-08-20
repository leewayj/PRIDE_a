import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ActionButton from '../../components/ui/ActionButton.jsx'
import '../../styles/onboarding.css'

const FACE_STATUS = {
  LOADING: 'loading',
  UNREGISTERED: 'unregistered',
  REGISTERED: 'registered',
  ERROR: 'error',
}

function EyeIllustration() {
  return (
    <svg viewBox="0 0 148 96" aria-hidden="true">
      <path
        d="M13 48c15-23 36-35 61-35s46 12 61 35c-15 23-36 35-61 35S28 71 13 48Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="5"
      />
      <circle cx="74" cy="48" r="19" fill="none" stroke="currentColor" strokeWidth="5" />
      <circle cx="74" cy="48" r="7" fill="currentColor" />
    </svg>
  )
}

function FaceIllustration() {
  return (
    <svg viewBox="0 0 148 148" aria-hidden="true">
      <rect x="17" y="17" width="114" height="114" rx="24" fill="none" stroke="currentColor" strokeWidth="5" />
      <circle cx="74" cy="63" r="25" fill="none" stroke="currentColor" strokeWidth="5" />
      <path d="M40 119c7-20 19-30 34-30s27 10 34 30" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="5" />
      <path d="M54 61h1M93 61h1" stroke="currentColor" strokeLinecap="round" strokeWidth="7" />
      <path d="M65 73c5 4 13 4 18 0" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="4" />
    </svg>
  )
}

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m15 5-7 7 7 7" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  )
}

function OnboardingIntroSlide({ illustration, title, description, buttonLabel, showBack, onBack, onNext }) {
  return (
    <section className="onboarding-intro" aria-live="polite">
      <header className="onboarding-intro__header">
        {showBack ? (
          <button className="onboarding-intro__back" type="button" onClick={onBack} aria-label="이전 화면으로 돌아가기">
            <BackIcon />
          </button>
        ) : null}
      </header>

      <div className="onboarding-intro__content">
        <div className="onboarding-intro__illustration">{illustration}</div>
        <h1 className="onboarding-intro__title">{title}</h1>
        <p className="onboarding-intro__description">{description}</p>
      </div>

      <div className="onboarding-intro__cta">
        <ActionButton fullWidth className="onboarding-intro__button" onClick={onNext}>
          {buttonLabel}
        </ActionButton>
      </div>
    </section>
  )
}

function FaceLoadingState() {
  return (
    <section className="face-status-page" aria-live="polite" aria-busy="true">
      <div className="face-status-page__content">
        <div className="face-status-page__indicator" aria-hidden="true" />
        <h1>내 얼굴</h1>
        <p>얼굴 등록 상태를 확인하고 있어요.</p>
      </div>
    </section>
  )
}

function FaceRegisteredState({ onRegisterAgain }) {
  return (
    <section className="face-status-page">
      <div className="face-status-page__content">
        <div className="face-status-page__badge" role="status">
          <span aria-hidden="true">✓</span>
          등록 완료
        </div>
        <h1>내 얼굴</h1>
        <p>얼굴 등록이 완료되었어요.</p>
        <small>등록한 얼굴 정보를 기준으로<br />사진을 확인할 수 있어요.</small>
      </div>

      <div className="face-status-page__cta">
        <ActionButton fullWidth variant="outline" onClick={onRegisterAgain}>
          다시 등록하기
        </ActionButton>
      </div>
    </section>
  )
}

function FaceErrorState() {
  return (
    <section className="face-status-page" role="alert">
      <div className="face-status-page__content">
        <div className="face-status-page__error-icon" aria-hidden="true">!</div>
        <h1>내 얼굴</h1>
        <p>얼굴 등록 상태를 확인하지 못했어요.</p>
        <small>잠시 후 다시 시도해 주세요.</small>
      </div>
    </section>
  )
}

const slides = [
  {
    illustration: <EyeIllustration />,
    title: <>거울은 기억하지 못하지만<br />사진은 기억합니다</>,
    description: <>매일 마주하는 얼굴의 작은 변화를<br />RETRACE와 함께 기록해 보세요.</>,
    buttonLabel: '시작하기',
  },
  {
    illustration: <FaceIllustration />,
    title: <>같은 얼굴도<br />매일 조금씩 달라집니다</>,
    description: <>같은 각도와 표정으로 사진을 남기면<br />변화를 더 선명하게 발견할 수 있어요.</>,
    buttonLabel: '다음',
  },
]

function OnboardingIntroPage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  // TODO: 얼굴 등록 상태 조회 API가 확정되면 이 상태를 서버 응답과 연결한다.
  const [faceStatus] = useState(FACE_STATUS.UNREGISTERED)
  const navigate = useNavigate()
  const slide = slides[currentSlide]

  const handleNext = () => {
    if (currentSlide === 0) {
      setCurrentSlide(1)
      return
    }

    navigate('/onboarding/guide')
  }

  if (faceStatus === FACE_STATUS.LOADING) {
    return <FaceLoadingState />
  }

  if (faceStatus === FACE_STATUS.ERROR) {
    return <FaceErrorState />
  }

  if (faceStatus === FACE_STATUS.REGISTERED) {
    return <FaceRegisteredState onRegisterAgain={() => navigate('/onboarding/guide')} />
  }

  return (
    <OnboardingIntroSlide
      {...slide}
      showBack={currentSlide === 1}
      onBack={() => setCurrentSlide(0)}
      onNext={handleNext}
    />
  )
}

export default OnboardingIntroPage
