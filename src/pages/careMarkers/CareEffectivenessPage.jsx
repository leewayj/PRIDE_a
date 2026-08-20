import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { judgeEffect } from '../../api/effectApi.js'
import { getInterpretationCard } from '../../api/interpretationApi.js'
import { getMarkerList } from '../../api/markerApi.js'
import BottomNavigation from '../../components/navigation/BottomNavigation.jsx'
import ActionButton from '../../components/ui/ActionButton.jsx'
import BaseCard from '../../components/ui/BaseCard.jsx'
import { INDICATOR_OPTIONS } from '../../domain/indicatorCurve.js'
import { mapMarkerListToCareMarkers } from '../../domain/marker.js'
import { mapEffectResult, mapInterpretationCard } from '../../domain/markerAnalysis.js'
import { formatPhotoDate } from '../../utils/dateFormat.js'
import { getOrCreateUserId } from '../../utils/userSession.js'
import '../../styles/care-effectiveness.css'

const EFFECT_COPY = {
  observed: '관리 이후 이전 흐름과 다른 변화가 관찰됐어요.',
  not_observed: '현재 기록에서는 이전 흐름과 다른 변화가 관찰되지 않았어요.',
  pending: '효과를 확인하기 위한 기록이 아직 부족해요.',
}

function CareEffectivenessPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const query = new URLSearchParams(location.search)
  const routedMarker = location.state?.careMarker ?? null
  const markerId = routedMarker?.id ?? query.get('markerId') ?? ''
  const requestedIndicator = location.state?.indicator ?? query.get('indicator') ?? ''
  const [selectedIndicator, setSelectedIndicator] = useState(() => (
    INDICATOR_OPTIONS.some(({ indicator }) => indicator === requestedIndicator) ? requestedIndicator : ''
  ))
  const [selectedMarker, setSelectedMarker] = useState(routedMarker)
  const [effectResult, setEffectResult] = useState(null)
  const [interpretation, setInterpretation] = useState(null)
  const [isEffectLoading, setIsEffectLoading] = useState(false)
  const [isInterpretationLoading, setIsInterpretationLoading] = useState(false)
  const [hasEffectError, setHasEffectError] = useState(false)
  const [hasInterpretationError, setHasInterpretationError] = useState(false)
  const requestIdRef = useRef(0)

  const loadMarker = useCallback(async () => {
    if (!markerId || selectedMarker?.id === markerId) return
    if (routedMarker?.id === markerId) {
      setSelectedMarker(routedMarker)
      return
    }
    try {
      const userId = await getOrCreateUserId()
      const response = await getMarkerList(userId)
      setSelectedMarker(mapMarkerListToCareMarkers(response).find(({ id }) => id === markerId) ?? null)
    } catch (error) {
      console.error('선택한 관리 기록을 불러오지 못했습니다.', error)
    }
  }, [markerId, routedMarker, selectedMarker])

  const loadAnalysis = useCallback(async () => {
    if (!markerId || !selectedIndicator) return
    const requestId = requestIdRef.current + 1
    requestIdRef.current = requestId
    setEffectResult(null)
    setInterpretation(null)
    setIsEffectLoading(true)
    setIsInterpretationLoading(true)
    setHasEffectError(false)
    setHasInterpretationError(false)

    try {
      const userId = await getOrCreateUserId()
      const [effectResponse, interpretationResponse] = await Promise.allSettled([
        judgeEffect(userId, selectedIndicator, markerId),
        getInterpretationCard(userId, selectedIndicator, markerId),
      ])
      if (requestIdRef.current !== requestId) return

      if (effectResponse.status === 'fulfilled') {
        try { setEffectResult(mapEffectResult(effectResponse.value, selectedIndicator, markerId)) } catch (error) { console.error('관리 효과 응답을 해석하지 못했습니다.', error); setHasEffectError(true) }
      } else {
        console.error('관리 효과를 불러오지 못했습니다.', effectResponse.reason)
        setHasEffectError(true)
      }

      if (interpretationResponse.status === 'fulfilled') {
        try { setInterpretation(mapInterpretationCard(interpretationResponse.value)) } catch (error) { console.error('변화 해석 응답을 해석하지 못했습니다.', error); setHasInterpretationError(true) }
      } else {
        console.error('변화 해석을 불러오지 못했습니다.', interpretationResponse.reason)
        setHasInterpretationError(true)
      }
    } catch (error) {
      console.error('관리 분석을 불러오지 못했습니다.', error)
      if (requestIdRef.current === requestId) { setHasEffectError(true); setHasInterpretationError(true) }
    } finally {
      if (requestIdRef.current === requestId) { setIsEffectLoading(false); setIsInterpretationLoading(false) }
    }
  }, [markerId, selectedIndicator])

  useEffect(() => {
    let isActive = true
    queueMicrotask(() => { if (isActive) loadMarker() })
    return () => { isActive = false }
  }, [loadMarker])

  useEffect(() => {
    let isActive = true
    queueMicrotask(() => { if (isActive) loadAnalysis() })
    return () => { isActive = false; requestIdRef.current += 1 }
  }, [loadAnalysis])

  const chooseIndicator = (indicator) => {
    setSelectedIndicator(indicator)
    navigate(`/care-markers/effectiveness?markerId=${encodeURIComponent(markerId)}&indicator=${encodeURIComponent(indicator)}`, { replace: true, state: { careMarker: selectedMarker, indicator } })
  }

  return (
    <main className="app-shell care-effectiveness-page">
      <header className="care-effectiveness-page__header"><button type="button" onClick={() => navigate(-1)} aria-label="이전 화면으로 돌아가기"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 5-7 7 7 7" /></svg></button><span>관리 효과와 변화 해석</span></header>
      {!markerId ? (
        <BaseCard className="care-effectiveness-page__state"><strong>확인할 관리 기록을 선택해 주세요.</strong><ActionButton variant="outline" onClick={() => navigate('/changes')}>기록으로 돌아가기</ActionButton></BaseCard>
      ) : !selectedIndicator ? (
        <BaseCard className="care-effectiveness-page__state"><strong>확인할 변화 지표를 선택해 주세요.</strong><IndicatorSelector selectedIndicator={selectedIndicator} onSelect={chooseIndicator} /></BaseCard>
      ) : (
        <>
          <section className="care-effectiveness-page__intro"><span>선택한 관리 기록</span><h1>{selectedMarker?.rawText ?? '관리 기록'}</h1>{selectedMarker && <p>{formatPhotoDate(selectedMarker.date)}</p>}</section>
          <IndicatorSelector selectedIndicator={selectedIndicator} onSelect={chooseIndicator} />
          <BaseCard className="care-effectiveness-page__analysis-card"><span>관리 효과</span>{isEffectLoading ? <p aria-live="polite">관리 효과를 확인하고 있어요.</p> : hasEffectError ? <AnalysisError message="관리 효과를 확인하지 못했어요." onRetry={loadAnalysis} /> : effectResult ? <><h2>{EFFECT_COPY[effectResult.verdict]}</h2>{effectResult.reasons.length > 0 && <ul>{effectResult.reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul>}</> : <p>표시할 관리 효과가 없어요.</p>}</BaseCard>
          <section className="care-effectiveness-page__interpretation" aria-labelledby="interpretation-title"><h2 id="interpretation-title">변화 해석</h2>{isInterpretationLoading ? <BaseCard aria-live="polite">변화를 해석하고 있어요.</BaseCard> : hasInterpretationError ? <BaseCard><AnalysisError message="변화 해석을 불러오지 못했어요." onRetry={loadAnalysis} /></BaseCard> : interpretation ? interpretation.map((section) => <BaseCard key={section.key}><h3>{section.title}</h3><p>{section.description}</p></BaseCard>) : <BaseCard>표시할 변화 해석이 없어요.</BaseCard>}</section>
        </>
      )}
      <BottomNavigation />
    </main>
  )
}

function IndicatorSelector({ selectedIndicator, onSelect }) {
  return <div className="care-effectiveness-page__indicators" aria-label="변화 지표 선택">{INDICATOR_OPTIONS.map(({ indicator, label }) => <button type="button" className={selectedIndicator === indicator ? 'is-selected' : ''} aria-pressed={selectedIndicator === indicator} onClick={() => onSelect(indicator)} key={indicator}>{label}</button>)}</div>
}

function AnalysisError({ message, onRetry }) {
  return <div role="alert"><strong>{message}</strong><p>잠시 후 다시 시도해 주세요.</p><ActionButton variant="outline" onClick={onRetry}>다시 시도</ActionButton></div>
}

export default CareEffectivenessPage
