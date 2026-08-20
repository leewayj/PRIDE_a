import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import ActionButton from '../../components/ui/ActionButton.jsx'
import BaseCard from '../../components/ui/BaseCard.jsx'
import SectionTitle from '../../components/ui/SectionTitle.jsx'
import { evaluateCurveEligibility } from '../../domain/curveEligibility'
import { DATA_INSUFFICIENT_PATH } from '../../navigation/paths'
import { fetchPhotoJudgement } from '../../services/retraceApi'
import { summarizeExcludedPhotos } from '../../utils/photoJudgement.js'

function JudgementSummaryPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const navigationStartedRef = useRef(false)
  const routePhotos = Array.isArray(location.state?.photos) ? location.state.photos : null
  const [photos, setPhotos] = useState(routePhotos ?? [])
  const [isLoading, setIsLoading] = useState(routePhotos === null)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    if (routePhotos !== null) return undefined

    let isActive = true

    fetchPhotoJudgement()
      .then((result) => {
        if (isActive) setPhotos(Array.isArray(result) ? result : [])
      })
      .catch(() => {
        if (isActive) setHasError(true)
      })
      .finally(() => {
        if (isActive) setIsLoading(false)
      })

    return () => {
      isActive = false
    }
  }, [routePhotos])

  const summary = useMemo(() => {
    const passCount = photos.filter(({ grade }) => grade === 'pass').length
    const conditionalCount = photos.filter(({ grade }) => grade === 'conditional').length
    const excludeCount = photos.filter(({ grade }) => grade === 'exclude').length

    return {
      totalCount: photos.length,
      passCount,
      conditionalCount,
      excludeCount,
      rejectionReasons: summarizeExcludedPhotos(photos),
    }
  }, [photos])

  const eligibility = useMemo(() => evaluateCurveEligibility(photos), [photos])

  const handleNext = () => {
    if (navigationStartedRef.current) return
    navigationStartedRef.current = true

    if (eligibility.eligible) {
      navigate('/curve', { state: { firstAnalysis: location.state?.firstAnalysis === true } })
      return
    }

    navigate(DATA_INSUFFICIENT_PATH, { state: { photos } })
  }

  if (isLoading) {
    return (
      <section className="judgement-summary-page judgement-summary-page--center" aria-live="polite">
        <p>판정 결과를 불러오고 있어요.</p>
      </section>
    )
  }

  if (hasError) {
    return (
      <section className="judgement-summary-page judgement-summary-page--center" role="alert">
        <p>판정 결과를 불러오지 못했어요.</p>
        <ActionButton onClick={() => navigate('/photos')}>사진 현황으로 돌아가기</ActionButton>
      </section>
    )
  }

  if (photos.length === 0) {
    return (
      <section className="judgement-summary-page judgement-summary-page--center">
        <h1>표시할 분석 결과가 없어요.</h1>
        <p>사진을 추가한 뒤 다시 분석해 주세요.</p>
        <ActionButton onClick={() => navigate('/photos/upload')}>사진 추가하기</ActionButton>
      </section>
    )
  }

  return (
    <section className="judgement-summary-page">
      <header className="judgement-summary-page__header">
        <span>사진 분석 완료</span>
        <h1>사진 판정 결과를<br />확인해 보세요.</h1>
      </header>

      <div className="judgement-summary-page__counts">
        <BaseCard className="judgement-summary-page__count judgement-summary-page__count--total">
          <span>전체 사진</span>
          <strong>{summary.totalCount}장</strong>
        </BaseCard>
        <BaseCard className="judgement-summary-page__count">
          <span>통과</span>
          <strong>{summary.passCount}장</strong>
        </BaseCard>
        <BaseCard className="judgement-summary-page__count judgement-summary-page__count--excluded">
          <span>제외</span>
          <strong>{summary.excludeCount}장</strong>
        </BaseCard>
      </div>

      {summary.conditionalCount > 0 && (
        <p className="judgement-summary-page__conditional">
          조건부 판정 사진 {summary.conditionalCount}장이 별도로 있어요.
        </p>
      )}

      <BaseCard className="judgement-summary-page__reasons">
        <SectionTitle>제외 사유</SectionTitle>
        {summary.rejectionReasons.length > 0 ? (
          <ul>
            {summary.rejectionReasons.map(({ reasonCode, label, count }) => (
              <li key={reasonCode}>
                <span>{label}</span>
                <strong>{count}장</strong>
              </li>
            ))}
          </ul>
        ) : (
          <p>제외된 사진이 없어요.</p>
        )}
      </BaseCard>

      <div className="judgement-summary-page__cta">
        <ActionButton fullWidth onClick={handleNext}>
          {eligibility.eligible ? '곡선 만들기' : '필요한 사진 확인하기'}
        </ActionButton>
      </div>
    </section>
  )
}

export default JudgementSummaryPage
