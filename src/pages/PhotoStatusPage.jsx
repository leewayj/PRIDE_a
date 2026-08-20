import { useNavigate } from 'react-router-dom'
import ActionButton from '../components/ui/ActionButton.jsx'
import BaseCard from '../components/ui/BaseCard.jsx'
import SectionTitle from '../components/ui/SectionTitle.jsx'
import { CURVE_MIN_PASS_PHOTOS_PER_YEAR, evaluateCurveEligibility } from '../domain/curveEligibility'
import { judgmentResultPhotos, judgmentResultSummary } from '../mocks/judgmentResultScenario'
import usePhotoSelection from '../hooks/usePhotoSelection.js'

function buildNoticeText(yearlyPassCounts) {
  if (yearlyPassCounts.length === 0) {
    return '아직 연도별 통과 사진이 없어요. 사진을 업로드해 주세요.'
  }

  const minYearEntry = yearlyPassCounts.reduce(
    (min, entry) => (entry.passCount < min.passCount ? entry : min),
    yearlyPassCounts[0],
  )

  return `${minYearEntry.year}년이 ${minYearEntry.passCount}장으로 최소치입니다. `
    + `연도당 최소 ${CURVE_MIN_PASS_PHOTOS_PER_YEAR}장이 필요해요.`
}

function PhotoStatusPage() {
  const navigate = useNavigate()
  const { photos } = usePhotoSelection()
  const { pass, conditional, exclude } = judgmentResultSummary
  const totalJudged = pass + conditional + exclude || 1

  const { yearlyPassCounts } = evaluateCurveEligibility(judgmentResultPhotos)
  const maxYearlyPassCount = Math.max(...yearlyPassCounts.map(({ passCount }) => passCount), 1)
  const noticeText = buildNoticeText(yearlyPassCounts)

  if (photos.length === 0) {
    return (
      <section className="photo-status-page photo-status-page--empty">
        <header className="photo-status-page__header">
          <h1>Photo</h1>
          <span>2019 – {new Date().getFullYear()}</span>
        </header>

        <BaseCard className="photo-status-page__empty-state">
          <div className="photo-status-page__empty-icon" aria-hidden="true">
            <svg viewBox="0 0 64 64">
              <rect x="10" y="13" width="44" height="38" rx="5" />
              <circle cx="25" cy="27" r="5" />
              <path d="m14 45 11-11 8 8 6-6 11 9" />
            </svg>
          </div>
          <h2>아직 등록된 사진이 없어요</h2>
          <p>사진을 추가하면 시간에 따른 변화 기록을 시작할 수 있어요.</p>
        </BaseCard>

        <div className="photo-status-page__cta">
          <ActionButton fullWidth onClick={() => navigate('/photos/upload')}>
            사진 추가하기
          </ActionButton>
        </div>
      </section>
    )
  }

  return (
    <section className="photo-status-page">
      <header className="photo-status-page__header">
        <h1>Photo</h1>
        <span>2019 – {new Date().getFullYear()}</span>
      </header>

      <BaseCard className="photo-status-page__total">
        <p className="photo-status-page__total-label">그래프에 들어간 사진</p>
        <strong className="photo-status-page__total-value">{pass}장</strong>
      </BaseCard>

      <BaseCard className="photo-status-page__breakdown">
        <div
          className="photo-status-page__breakdown-bar"
          role="img"
          aria-label={`통과 ${pass}장, 조건부 ${conditional}장, 제외 ${exclude}장`}
        >
          <span
            className="photo-status-page__breakdown-segment photo-status-page__breakdown-segment--pass"
            style={{ flexBasis: `${(pass / totalJudged) * 100}%` }}
          />
          <span
            className="photo-status-page__breakdown-segment photo-status-page__breakdown-segment--conditional"
            style={{ flexBasis: `${(conditional / totalJudged) * 100}%` }}
          />
          <span
            className="photo-status-page__breakdown-segment photo-status-page__breakdown-segment--exclude"
            style={{ flexBasis: `${(exclude / totalJudged) * 100}%` }}
          />
        </div>

        <ul className="photo-status-page__breakdown-legend">
          <li>
            <span className="photo-status-page__legend-dot photo-status-page__legend-dot--pass" aria-hidden="true" />
            통과 {pass}장
          </li>
          <li>
            <span className="photo-status-page__legend-dot photo-status-page__legend-dot--conditional" aria-hidden="true" />
            조건부 {conditional}장
          </li>
          <li>
            <span className="photo-status-page__legend-dot photo-status-page__legend-dot--exclude" aria-hidden="true" />
            제외 {exclude}장
          </li>
        </ul>
      </BaseCard>

      <BaseCard className="photo-status-page__yearly">
        <SectionTitle>연도별 통과 사진</SectionTitle>

        {yearlyPassCounts.length === 0 ? (
          <p className="photo-status-page__empty">아직 표시할 연도별 데이터가 없어요.</p>
        ) : (
          <div className="photo-status-page__chart" aria-label="연도별 통과 사진 장수">
            {yearlyPassCounts.map(({ year, passCount }) => {
              const heightPercent = Math.max((passCount / maxYearlyPassCount) * 100, 6)
              const isLow = passCount < CURVE_MIN_PASS_PHOTOS_PER_YEAR

              return (
                <div className="photo-status-page__bar" key={year}>
                  <span className="photo-status-page__bar-count">{passCount}</span>
                  <span
                    className={`photo-status-page__bar-fill${isLow ? ' is-low' : ''}`}
                    style={{ height: `${heightPercent}%` }}
                  />
                  <span className="photo-status-page__bar-year">{year}</span>
                </div>
              )
            })}
          </div>
        )}
      </BaseCard>

      <p className="photo-status-page__notice">{noticeText}</p>

      <div className="photo-status-page__cta">
        <ActionButton fullWidth onClick={() => navigate('/photos/upload')}>
          사진 업로드 하기
        </ActionButton>
      </div>
    </section>
  )
}

export default PhotoStatusPage
