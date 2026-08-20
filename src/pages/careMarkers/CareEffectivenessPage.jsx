import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import MetricCurveChart from '../../components/curve/MetricCurveChart.jsx'
import BottomNavigation from '../../components/navigation/BottomNavigation.jsx'
import ActionButton from '../../components/ui/ActionButton.jsx'
import BaseCard from '../../components/ui/BaseCard.jsx'
import { validateInterpretationCardText } from '../../domain/interpretationCardValidation'
import { fetchCareComparisonResult } from '../../services/retraceApi'
import { formatPhotoDate } from '../../utils/dateFormat.js'
import '../../styles/care-effectiveness.css'
import '../../styles/curve.css'

const METRIC_META = {
  'face-width': { label: '얼굴폭', unit: '' },
  'jaw-angle': { label: '턱선 각도', unit: '°' },
  'eyelid-height': { label: '눈꺼풀 높이', unit: '' },
  'mouth-corner-angle': { label: '입가 각도', unit: '°' },
}

const DESCRIPTION = '관리 기록 이후 실제 변화와 기존 흐름을 기준으로 한 예상 값 사이의 차이를 보여드려요.'

function safeText(text) {
  return validateInterpretationCardText(text).hasForbiddenExpression ? '' : text
}

function formatValue(value, unit) {
  return `${value.toFixed(1)}${unit}`
}

function formatDifference(value, unit) {
  return `${value > 0 ? '+' : ''}${value.toFixed(1)}${unit}`
}

function CareEffectivenessPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const selectedCareMarker = location.state?.careMarker ?? null
  const [comparisonResult, setComparisonResult] = useState(null)
  const [isLoading, setIsLoading] = useState(Boolean(selectedCareMarker))
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    if (!selectedCareMarker) return undefined
    let isActive = true
    fetchCareComparisonResult(selectedCareMarker.id)
      .then((result) => { if (isActive) setComparisonResult(result ?? null) })
      .catch(() => { if (isActive) setHasError(true) })
      .finally(() => { if (isActive) setIsLoading(false) })
    return () => { isActive = false }
  }, [selectedCareMarker])

  const metric = comparisonResult ? METRIC_META[comparisonResult.metricType] : null
  const isReady = comparisonResult?.status === 'ready'

  return (
    <main className="app-shell care-effectiveness-page">
      <header className="care-effectiveness-page__header">
        <button type="button" onClick={() => navigate(-1)} aria-label="이전 화면으로 돌아가기">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 5-7 7 7 7" /></svg>
        </button>
        <span>변화 비교</span>
      </header>

      {!selectedCareMarker ? (
        <BaseCard className="care-effectiveness-page__state">
          <strong>비교할 관리 기록을 선택해 주세요.</strong>
          <p>변화 해석에서 관리 기록을 고르면 여기에서 비교할 수 있어요.</p>
          <ActionButton variant="outline" onClick={() => navigate('/changes')}>기록으로 돌아가기</ActionButton>
        </BaseCard>
      ) : isLoading ? (
        <BaseCard className="care-effectiveness-page__state" aria-live="polite">비교 데이터를 불러오고 있어요.</BaseCard>
      ) : hasError ? (
        <BaseCard className="care-effectiveness-page__state" role="alert">
          <strong>비교 데이터를 불러오지 못했어요.</strong>
          <ActionButton variant="outline" onClick={() => navigate('/changes')}>기록으로 돌아가기</ActionButton>
        </BaseCard>
      ) : !comparisonResult ? (
        <BaseCard className="care-effectiveness-page__state"><strong>비교 결과가 아직 준비되지 않았어요.</strong><p>준비가 끝나면 이 화면에서 확인할 수 있어요.</p></BaseCard>
      ) : comparisonResult.status === 'insufficient' ? (
        <><MarkerIntro marker={selectedCareMarker} /><BaseCard className="care-effectiveness-page__state care-effectiveness-page__state--inline"><strong>비교할 데이터가 부족해요.</strong><p>사진이 더 쌓이면 실제 변화와 예상 흐름을 비교할 수 있어요.</p></BaseCard></>
      ) : comparisonResult.status === 'unavailable' ? (
        <><MarkerIntro marker={selectedCareMarker} /><BaseCard className="care-effectiveness-page__state care-effectiveness-page__state--inline"><strong>비교 데이터를 준비 중입니다.</strong></BaseCard></>
      ) : isReady ? (
        <>
          <section className="care-effectiveness-page__intro">
            <span>선택한 관리 기록</span><h1>관리 전 흐름과<br />지금을 비교했습니다</h1>
            <div><strong>{selectedCareMarker.kind}</strong><time dateTime={selectedCareMarker.date}>{formatPhotoDate(selectedCareMarker.date)}</time><p>{selectedCareMarker.rawText}</p></div>
          </section>
          <BaseCard className="care-effectiveness-page__chart-card">
            <div className="care-effectiveness-page__chart-heading"><span>변화 비교</span><h2>{metric.label}</h2></div>
            <MetricCurveChart points={comparisonResult.actualSeries} predictedPoints={comparisonResult.predictedSeries} careStartDate={comparisonResult.careStartedAt} metricLabel={metric.label} comparisonMode onSelectMarker={() => {}} />
            <div className="care-effectiveness-page__legend" aria-label="그래프 범례"><span><i />실제 변화</span><span><i />예상 흐름</span></div>
          </BaseCard>
          <section className="care-effectiveness-page__values" aria-label="실제와 예상 비교 값">
            <BaseCard><span>실제 변화</span><strong>{formatValue(comparisonResult.actual, metric.unit)}</strong></BaseCard>
            <BaseCard><span>예상 흐름</span><strong>{formatValue(comparisonResult.predicted, metric.unit)}</strong></BaseCard>
            <BaseCard><span>차이</span><strong>{formatDifference(comparisonResult.difference, metric.unit)}</strong></BaseCard>
          </section>
          <aside className="care-effectiveness-page__description"><strong>비교 결과를 이렇게 보세요</strong><p>{safeText(DESCRIPTION)}</p></aside>
        </>
      ) : null}
      <BottomNavigation />
    </main>
  )
}

function MarkerIntro({ marker }) {
  return <section className="care-effectiveness-page__intro"><span>선택한 관리 기록</span><h1>{marker.kind}</h1><p>{formatPhotoDate(marker.date)}</p></section>
}

export default CareEffectivenessPage
