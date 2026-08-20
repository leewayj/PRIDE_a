import { useLocation, useNavigate } from 'react-router-dom'
import ActionButton from '../components/ui/ActionButton.jsx'
import BaseCard from '../components/ui/BaseCard.jsx'
import SectionTitle from '../components/ui/SectionTitle.jsx'
import {
  CURVE_MIN_PASS_PHOTOS_PER_YEAR,
  CURVE_MIN_TOTAL_PASS_PHOTOS,
  findCurveEligibilityGap,
} from '../domain/curveEligibility'

function DataInsufficientPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const judgementPhotos = Array.isArray(location.state?.photos)
    ? location.state.photos
    : []
  const checkInState = location.state?.source === 'checkIn'
    ? {
        source: 'checkIn',
        markerId: location.state?.markerId,
        indicator: location.state?.indicator,
        scheduledAt: location.state?.scheduledAt,
      }
    : undefined
  const {
    totalPassCount,
    yearlyShortfalls,
    additionalTotalPassPhotosNeeded,
  } = findCurveEligibilityGap(judgementPhotos)

  return (
    <section className="data-insufficient-page">
      <header className="data-insufficient-page__header">
        <span className="data-insufficient-page__eyebrow">사진 분석 완료</span>
        <h1>변화를 그리기엔<br />사진이 조금 부족해요.</h1>
        <p>사진을 더 추가하면 시간에 따른 변화 곡선을 만들 수 있어요.</p>
      </header>

      <BaseCard className="data-insufficient-page__summary">
        <div>
          <span>현재 유효 사진</span>
          <strong>{totalPassCount}장</strong>
        </div>
        <div>
          <span>필요한 사진</span>
          <strong>{CURVE_MIN_TOTAL_PASS_PHOTOS}장</strong>
        </div>
        <div className="data-insufficient-page__remaining">
          <span>전체 기준까지</span>
          <strong>{additionalTotalPassPhotosNeeded}장 부족</strong>
        </div>
      </BaseCard>

      <BaseCard className="data-insufficient-page__yearly">
        <SectionTitle>연도별 부족 현황</SectionTitle>
        {totalPassCount === 0 ? (
          <p className="data-insufficient-page__yearly-complete">
            아직 연도별 통과 사진이 없어요. 사진을 추가해 주세요.
          </p>
        ) : yearlyShortfalls.length > 0 ? (
          <ul>
            {yearlyShortfalls.map(({ year, passCount, additionalPassPhotosNeeded }) => (
              <li key={year}>
                <div>
                  <strong>{year}</strong>
                  <span>현재 {passCount}장 / 필요 {CURVE_MIN_PASS_PHOTOS_PER_YEAR}장</span>
                </div>
                <span className="data-insufficient-page__badge">
                  {additionalPassPhotosNeeded}장 부족
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="data-insufficient-page__yearly-complete">
            연도별 최소 사진 수는 모두 채웠어요.
          </p>
        )}
      </BaseCard>

      <div className="data-insufficient-page__cta">
        <ActionButton
          fullWidth
          onClick={() => navigate('/photos/years', { state: checkInState })}
        >
          사진 더 추가하기
        </ActionButton>
      </div>
    </section>
  )
}

export default DataInsufficientPage
