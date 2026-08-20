import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { judgeEffect } from '../../api/effectApi.js'
import ActionButton from '../../components/ui/ActionButton.jsx'
import BaseCard from '../../components/ui/BaseCard.jsx'
import SectionTitle from '../../components/ui/SectionTitle.jsx'
import { evaluateCurveEligibility } from '../../domain/curveEligibility'
import { mapEffectResult } from '../../domain/markerAnalysis.js'
import { DATA_INSUFFICIENT_PATH } from '../../navigation/paths'
import { getOrCreateUserId } from '../../utils/userSession.js'
import { summarizePhotoJudgement } from '../../utils/photoJudgement.js'

function JudgementSummaryPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const navigationStartedRef = useRef(false)
  const routePhotos = Array.isArray(location.state?.photos) ? location.state.photos : null
  const photos = useMemo(() => routePhotos ?? [], [routePhotos])
  const markerId = typeof location.state?.markerId === 'string' ? location.state.markerId : ''
  const indicator = typeof location.state?.indicator === 'string' ? location.state.indicator : ''
  const [effectResult, setEffectResult] = useState(null)
  const [isEffectLoading, setIsEffectLoading] = useState(Boolean(markerId && indicator))
  const [hasEffectError, setHasEffectError] = useState(false)
  const effectRequestIdRef = useRef(0)
  const checkInState = location.state?.source === 'checkIn'
    ? {
        source: 'checkIn',
        markerId: location.state?.markerId,
        indicator: location.state?.indicator,
        scheduledAt: location.state?.scheduledAt,
      }
    : {}

  const loadEffect = useCallback(async () => {
    if (!markerId || !indicator) return
    const requestId = effectRequestIdRef.current + 1
    effectRequestIdRef.current = requestId
    setIsEffectLoading(true)
    setHasEffectError(false)
    setEffectResult(null)
    try {
      const userId = await getOrCreateUserId()
      const result = mapEffectResult(await judgeEffect(userId, indicator, markerId), indicator, markerId)
      if (effectRequestIdRef.current === requestId) setEffectResult(result)
    } catch (error) {
      console.error('관리 효과를 확인하지 못했습니다.', error)
      if (effectRequestIdRef.current === requestId) setHasEffectError(true)
    } finally {
      if (effectRequestIdRef.current === requestId) setIsEffectLoading(false)
    }
  }, [indicator, markerId])

  useEffect(() => {
    let isActive = true
    queueMicrotask(() => { if (isActive) loadEffect() })
    return () => { isActive = false; effectRequestIdRef.current += 1 }
  }, [loadEffect])

  const summary = useMemo(() => summarizePhotoJudgement(photos), [photos])

  const eligibility = useMemo(() => evaluateCurveEligibility(photos), [photos])

  const handleNext = () => {
    if (navigationStartedRef.current) return
    navigationStartedRef.current = true

    if (eligibility.eligible) {
      navigate('/curve', {
        state: {
          ...checkInState,
          firstAnalysis: location.state?.firstAnalysis === true,
        },
      })
      return
    }

    navigate(DATA_INSUFFICIENT_PATH, {
      state: {
        ...checkInState,
        photos,
      },
    })
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

      {markerId && indicator && (
        <BaseCard className="judgement-summary-page__reasons">
          <SectionTitle>관리 효과 판정</SectionTitle>
          {isEffectLoading ? <p aria-live="polite">관리 효과를 확인하고 있어요.</p> : hasEffectError ? <div role="alert"><p>관리 효과를 확인하지 못했어요.</p><ActionButton onClick={loadEffect}>다시 시도</ActionButton></div> : effectResult ? <><p>{effectResult.verdict === 'pending' ? '효과를 확인하기 위한 기록이 아직 부족해요.' : effectResult.verdict === 'observed' ? '관리 이후 이전 흐름과 다른 변화가 관찰됐어요.' : '현재 기록에서는 이전 흐름과 다른 변화가 관찰되지 않았어요.'}</p>{effectResult.reasons.length > 0 && <ul>{effectResult.reasons.map((reason) => <li key={reason}><span>{reason}</span></li>)}</ul>}</> : null}
        </BaseCard>
      )}

      <div className="judgement-summary-page__cta">
        <ActionButton fullWidth onClick={handleNext}>
          {eligibility.eligible ? '곡선 만들기' : '필요한 사진 확인하기'}
        </ActionButton>
      </div>
    </section>
  )
}

export default JudgementSummaryPage
