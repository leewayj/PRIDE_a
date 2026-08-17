import { useNavigate } from 'react-router-dom'
import ActionButton from '../../components/ui/ActionButton.jsx'
import '../../styles/onboarding.css'

const metrics = [
  { label: '눈썹 높이', value: '1.8', unit: 'mm' },
  { label: '눈꼬리 각도', value: '2.1', unit: '°' },
  { label: '입꼬리 높이', value: '0.9', unit: 'mm' },
  { label: '얼굴 균형', value: '3.6', unit: '%' },
]

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m15 5-7 7 7 7" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  )
}

function FaceImagePlaceholder() {
  return (
    <div className="compare-card__portrait" role="img" aria-label="얼굴 사진 예시">
      <svg viewBox="0 0 132 160" aria-hidden="true">
        <path d="M16 160c2-34 21-52 50-52s48 18 50 52" fill="#aa7d68" />
        <ellipse cx="66" cy="70" rx="40" ry="50" fill="#efcdb7" />
        <path d="M25 68C19 31 39 12 68 12c25 0 44 18 40 57-9-25-28-31-49-29-13 1-25 11-34 28Z" fill="#5c433a" />
        <path d="M44 69h1M87 69h1" stroke="#49372f" strokeLinecap="round" strokeWidth="5" />
        <path d="M57 89c6 4 13 4 19 0" fill="none" stroke="#b47568" strokeLinecap="round" strokeWidth="3" />
      </svg>
      <span>과거 사진</span>
    </div>
  )
}

function ExampleCompareCard() {
  return (
    <div className="compare-card">
      <FaceImagePlaceholder />

      <div className="compare-card__arrow" aria-hidden="true">→</div>

      <dl className="compare-card__metrics" aria-label="변화 지표 예시">
        {metrics.map((metric) => (
          <div className="compare-card__metric" key={metric.label}>
            <dt>{metric.label}</dt>
            <dd><strong>{metric.value}</strong> {metric.unit}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

function OnboardingGuidePage() {
  const navigate = useNavigate()

  return (
    <section className="photo-compare-guide">
      <header className="photo-compare-guide__header">
        <button
          className="photo-compare-guide__back"
          type="button"
          onClick={() => navigate(-1)}
          aria-label="이전 화면으로 돌아가기"
        >
          <BackIcon />
        </button>
      </header>

      <div className="photo-compare-guide__intro">
        <h1>지난 사진과 오늘을<br />나란히 놓습니다</h1>
        <p>작은 변화가 눈에 보이도록, 같은 조건으로 비교해 드립니다.</p>
      </div>

      <ExampleCompareCard />

      <aside className="photo-compare-guide__notice">
        <strong>같은 머리와 같은 표정이 좋아요.</strong>
        <span>더 정확한 비교를 위해 비슷한 환경에서 촬영해 주세요.</span>
      </aside>

      <div className="photo-compare-guide__cta">
        <ActionButton fullWidth className="photo-compare-guide__button" onClick={() => navigate('/onboarding/photos')}>
          확인했어요
        </ActionButton>
      </div>
    </section>
  )
}

export default OnboardingGuidePage
