import { useNavigate } from 'react-router-dom'
import BaseCard from '../components/ui/BaseCard.jsx'
import { CHECK_IN_PATH, JUDGEMENT_SUMMARY_PATH } from '../navigation/paths'

const HUB_ACTIONS = [
  {
    title: '분석 결과 보기',
    description: '통과한 사진과 제외 사유를 확인해요.',
    path: JUDGEMENT_SUMMARY_PATH,
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 19V9M10 19V5M16 19v-7M22 19H2" />
      </svg>
    ),
  },
  {
    title: '사진 더 넣기',
    description: '연도별 사진을 더 추가해 기록을 채워요.',
    path: '/photos/upload',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M12 8v8M8 12h8" />
      </svg>
    ),
  },
  {
    title: '체크인 확인하기',
    description: '다음 기록 시점과 체크인 일정을 확인해요.',
    path: CHECK_IN_PATH,
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 3v3M18 3v3M4 9h16M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />
        <path d="m8 15 2 2 5-5" />
      </svg>
    ),
  },
]

function FirstAnalysisCompletePage() {
  const navigate = useNavigate()

  return (
    <section className="first-analysis-complete-page">
      <header className="first-analysis-complete-page__header">
        <div className="first-analysis-complete-page__icon" aria-hidden="true">
          <svg viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="25" />
            <path d="m20 32 8 8 17-18" />
          </svg>
        </div>
        <span>첫 사진 분석 완료</span>
        <h1>첫 번째 변화 기록이<br />준비되었어요.</h1>
        <p>분석 결과를 확인하거나 다음 기록을 이어가 보세요.</p>
      </header>

      <div className="first-analysis-complete-page__actions" aria-label="다음 할 일">
        {HUB_ACTIONS.map(({ title, description, path, icon }) => (
          <BaseCard className="first-analysis-complete-page__card" key={title}>
            <button type="button" onClick={() => navigate(path)}>
              <span className="first-analysis-complete-page__card-icon">{icon}</span>
              <span className="first-analysis-complete-page__card-copy">
                <strong>{title}</strong>
                <span>{description}</span>
              </span>
              <svg className="first-analysis-complete-page__chevron" viewBox="0 0 24 24" aria-hidden="true">
                <path d="m9 5 7 7-7 7" />
              </svg>
            </button>
          </BaseCard>
        ))}
      </div>
    </section>
  )
}

export default FirstAnalysisCompletePage
