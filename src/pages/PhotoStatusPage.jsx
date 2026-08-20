import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getPhotoUploadSummary } from '../api/photoApi.js'
import ActionButton from '../components/ui/ActionButton.jsx'
import BaseCard from '../components/ui/BaseCard.jsx'
import SectionTitle from '../components/ui/SectionTitle.jsx'
import { mapYearCounts } from '../domain/photoUploadSummary.js'
import { getOrCreateUserId } from '../utils/userSession.js'

function assertCount(value, fieldName) {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${fieldName} must be a non-negative integer`)
  }
}

function assertCountMap(value, fieldName) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${fieldName} must be an object`)
  }

  Object.values(value).forEach((count) => assertCount(count, fieldName))
}

function validateSummary(summary) {
  if (!summary || typeof summary !== 'object' || Array.isArray(summary)) {
    throw new Error('upload summary must be an object')
  }

  assertCountMap(summary.gradeCounts, 'gradeCounts')
  assertCountMap(summary.yearCounts, 'yearCounts')
  assertCount(summary.totalEvaluatedCount, 'totalEvaluatedCount')
  assertCount(summary.succeededCount, 'succeededCount')

  return summary
}

function findMinimumYear(yearlyCounts) {
  if (yearlyCounts.length === 0) return null

  return yearlyCounts.reduce(
    (min, entry) => (entry.count < min.count ? entry : min),
    yearlyCounts[0],
  )
}

function buildNoticeText(minimumYear) {
  if (!minimumYear) {
    return '아직 연도별 사진 기록이 없어요. 사진을 업로드해 주세요.'
  }

  return `${minimumYear.year}년 사진이 ${minimumYear.count}장으로 가장 적어요.`
}

function PhotoStatusPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const uploadIssues = Array.isArray(location.state?.uploadIssues) ? location.state.uploadIssues : []
  const [uploadSummary, setUploadSummary] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const requestIdRef = useRef(0)
  const isRequestingRef = useRef(false)

  const loadSummary = useCallback(async () => {
    if (isRequestingRef.current) return

    isRequestingRef.current = true
    const requestId = requestIdRef.current + 1
    requestIdRef.current = requestId
    setIsLoading(true)
    setHasError(false)
    setUploadSummary(null)

    try {
      const userId = await getOrCreateUserId()
      const result = validateSummary(await getPhotoUploadSummary(userId))
      if (requestIdRef.current === requestId) setUploadSummary(result)
    } catch (error) {
      console.error('사진 업로드 통계를 불러오지 못했습니다.', error)
      if (requestIdRef.current === requestId) setHasError(true)
    } finally {
      if (requestIdRef.current === requestId) {
        isRequestingRef.current = false
        setIsLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    let isActive = true
    queueMicrotask(() => {
      if (isActive) loadSummary()
    })

    return () => {
      isActive = false
      requestIdRef.current += 1
      isRequestingRef.current = false
    }
  }, [loadSummary])

  if (isLoading) {
    return (
      <section className="photo-status-page photo-status-page--empty" aria-live="polite">
        <header className="photo-status-page__header"><h1>Photo</h1></header>
        <BaseCard className="photo-status-page__empty-state">
          <h2>사진 기록을 불러오고 있어요.</h2>
        </BaseCard>
      </section>
    )
  }

  if (hasError || !uploadSummary) {
    return (
      <section className="photo-status-page photo-status-page--empty">
        <header className="photo-status-page__header"><h1>Photo</h1></header>
        <BaseCard className="photo-status-page__empty-state" role="alert">
          <h2>사진 기록을 불러오지 못했어요.</h2>
          <p>잠시 후 다시 시도해 주세요.</p>
          <ActionButton onClick={loadSummary}>다시 시도</ActionButton>
        </BaseCard>
      </section>
    )
  }

  const pass = uploadSummary.gradeCounts.pass ?? 0
  const conditional = uploadSummary.gradeCounts.conditional ?? 0
  const exclude = uploadSummary.gradeCounts.exclude ?? 0
  const totalUploaded = uploadSummary.totalEvaluatedCount
  const succeededCount = uploadSummary.succeededCount
  const totalJudged = pass + conditional + exclude || 1
  const storedYearCounts = mapYearCounts(uploadSummary.yearCounts)
  const maxYearlyCount = Math.max(...storedYearCounts.map(({ count }) => count), 1)
  const minimumYear = findMinimumYear(storedYearCounts)
  const noticeText = buildNoticeText(minimumYear)
  const yearRange = storedYearCounts.length > 0
    ? `${storedYearCounts[0].year} – ${storedYearCounts[storedYearCounts.length - 1].year}`
    : '연도 기록 없음'

  if (totalUploaded === 0) {
    return (
      <section className="photo-status-page photo-status-page--empty">
        <header className="photo-status-page__header">
          <h1>Photo</h1>
          <span>{yearRange}</span>
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

        <UploadIssues issues={uploadIssues} />

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
        <span>{yearRange}</span>
      </header>

      <BaseCard className="photo-status-page__total">
        <p className="photo-status-page__total-label">그래프에 들어간 사진</p>
        <strong className="photo-status-page__total-value">{succeededCount}장</strong>
        <p className="photo-status-page__total-description">판정한 사진 {totalUploaded}장 중 처리 완료</p>
      </BaseCard>

      <UploadIssues issues={uploadIssues} />

      <BaseCard className="photo-status-page__breakdown">
        <div
          className="photo-status-page__breakdown-bar"
          role="img"
          aria-label={`통과 ${pass}장, 참고용 ${conditional}장, 제외 ${exclude}장`}
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
            참고용 {conditional}장
          </li>
          <li>
            <span className="photo-status-page__legend-dot photo-status-page__legend-dot--exclude" aria-hidden="true" />
            제외 {exclude}장
          </li>
        </ul>
      </BaseCard>

      <BaseCard className="photo-status-page__yearly">
        <SectionTitle>연도별 사진</SectionTitle>

        {storedYearCounts.length === 0 ? (
          <div className="photo-status-page__empty" role="status"><strong>연도별 사진 0장</strong><p>서버에 집계된 연도별 사진이 없어요.</p></div>
        ) : (
          <div className="photo-status-page__chart" aria-label="연도별 사진 장수">
            {storedYearCounts.map(({ year, count }) => {
              const heightPercent = Math.max((count / maxYearlyCount) * 100, 6)
              const isMinimum = year === minimumYear?.year

              return (
                <div className="photo-status-page__bar" key={year}>
                  <span className="photo-status-page__bar-count">{count}</span>
                  <span
                    className={`photo-status-page__bar-fill${isMinimum ? ' is-minimum' : ''}`}
                    style={{ height: `${heightPercent}%` }}
                  />
                  <span className="photo-status-page__bar-year">{String(year).slice(-2)}'</span>
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

function UploadIssues({ issues }) {
  if (issues.length === 0) return null
  return <BaseCard className="photo-status-page__upload-issues" role="status"><h2>확인이 필요한 사진</h2><ul>{issues.map(({ filename, reason }, index) => <li key={`${filename}-${index}`}><strong>{filename}</strong><p>{reason}</p></li>)}</ul></BaseCard>
}

export default PhotoStatusPage
