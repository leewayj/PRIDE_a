import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getInterpretationCard } from '../../api/interpretationApi.js'
import BottomNavigation from '../../components/navigation/BottomNavigation.jsx'
import ActionButton from '../../components/ui/ActionButton.jsx'
import BaseCard from '../../components/ui/BaseCard.jsx'
import { mapInterpretationCard } from '../../domain/markerAnalysis.js'
import { formatPhotoDate } from '../../utils/dateFormat.js'
import { getOrCreateUserId } from '../../utils/userSession.js'
import '../../styles/change-interpretation.css'

const SECTION_LABELS = {
  noticedChange: '관찰된 변화',
  timingReason: '관리 시점과 변화',
  nextStep: '다음 단계',
}

function ChangeInterpretationPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const query = new URLSearchParams(location.search)
  const marker = location.state?.careMarker ?? null
  const markerId = marker?.id ?? query.get('markerId') ?? ''
  const indicator = location.state?.indicator ?? query.get('indicator') ?? ''
  const [sections, setSections] = useState([])
  const [isLoading, setIsLoading] = useState(Boolean(markerId && indicator))
  const [hasError, setHasError] = useState(false)
  const requestIdRef = useRef(0)
  const isRequestingRef = useRef(false)

  const loadInterpretation = useCallback(async () => {
    if (!markerId || !indicator || isRequestingRef.current) return
    isRequestingRef.current = true
    const requestId = requestIdRef.current + 1
    requestIdRef.current = requestId
    setSections([])
    setIsLoading(true)
    setHasError(false)
    try {
      const userId = await getOrCreateUserId()
      const result = mapInterpretationCard(await getInterpretationCard(userId, indicator, markerId))
      if (requestIdRef.current === requestId) setSections(result)
    } catch (error) {
      console.error('변화 해석을 불러오지 못했습니다.', error)
      if (requestIdRef.current === requestId) setHasError(true)
    } finally {
      if (requestIdRef.current === requestId) { isRequestingRef.current = false; setIsLoading(false) }
    }
  }, [indicator, markerId])

  useEffect(() => {
    let isActive = true
    queueMicrotask(() => { if (isActive) loadInterpretation() })
    return () => { isActive = false; requestIdRef.current += 1; isRequestingRef.current = false }
  }, [loadInterpretation])

  return (
    <main className="app-shell change-interpretation-page">
      <header className="change-interpretation-page__header"><button type="button" onClick={() => navigate(-1)} aria-label="이전 화면으로 돌아가기"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 5-7 7 7 7" /></svg></button><span>변화 해석</span></header>
      {!markerId || !indicator ? (
        <BaseCard className="change-interpretation-page__state"><strong>해석할 관리 기록을 선택해 주세요.</strong><p>기록 화면에서 관리 기록과 지표를 선택하면 실제 변화 해석을 확인할 수 있어요.</p><ActionButton variant="outline" onClick={() => navigate('/changes')}>기록으로 돌아가기</ActionButton></BaseCard>
      ) : isLoading ? (
        <BaseCard className="change-interpretation-page__state" aria-live="polite">변화를 해석하고 있어요.</BaseCard>
      ) : hasError ? (
        <BaseCard className="change-interpretation-page__state" role="alert"><strong>변화 해석을 불러오지 못했어요.</strong><p>잠시 후 다시 시도해 주세요.</p><ActionButton variant="outline" onClick={loadInterpretation}>다시 시도</ActionButton></BaseCard>
      ) : sections.length === 0 ? (
        <BaseCard className="change-interpretation-page__state"><strong>표시할 변화 해석이 없어요.</strong></BaseCard>
      ) : (
        <>
          <section className="change-interpretation-page__intro"><span>선택한 관리 기록</span><h1>{marker?.rawText ?? '관리 기록'}</h1>{marker && <p>{formatPhotoDate(marker.date)}</p>}</section>
          {sections.map((section) => <BaseCard className="change-interpretation-page__observation" key={section.key}><span>{SECTION_LABELS[section.key]}</span><h2>{section.title}</h2><p>{section.description}</p></BaseCard>)}
        </>
      )}
      <BottomNavigation />
    </main>
  )
}

export default ChangeInterpretationPage
