import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import ActionButton from '../../components/ui/ActionButton.jsx'
import BaseCard from '../../components/ui/BaseCard.jsx'
import BottomNavigation from '../../components/navigation/BottomNavigation.jsx'
import MetricCurveChart from '../../components/curve/MetricCurveChart.jsx'
import { formatPhotoDate } from '../../utils/dateFormat.js'
import { fetchCareMarkers, fetchMetricCurve } from '../../services/retraceApi'
import { validateInterpretationCardText } from '../../domain/interpretationCardValidation'
import '../../styles/curve.css'

const CARE_OBSERVATION_TEXT = '관리 기록과 같은 시기의 실제 변화 흐름을 함께 확인할 수 있어요.'
const CARE_COMPARISON_EMPTY_TEXT = '아직 기존 흐름을 기준으로 한 예측 결과가 준비되지 않았어요.'

function safeInterpretationText(text) {
  return validateInterpretationCardText(text).hasForbiddenExpression ? '' : text
}

function MetricCurvePage() {
  const location = useLocation()
  const navigate = useNavigate()
  const isFirstAnalysis = location.state?.firstAnalysis === true
  const [metricPoints, setMetricPoints] = useState([])
  const [changePoints, setChangePoints] = useState([])
  const [careMarkers, setCareMarkers] = useState([])
  const [selectedMarker, setSelectedMarker] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    let isActive = true

    Promise.allSettled([fetchMetricCurve(), fetchCareMarkers()])
      .then(([curveResponse, markerResponse]) => {
        if (!isActive) return
        if (curveResponse.status === 'rejected') {
          setHasError(true)
          return
        }

        const curveResult = curveResponse.value
        const markerResult = markerResponse.status === 'fulfilled' ? markerResponse.value : []
        setMetricPoints(Array.isArray(curveResult?.metricPoints) ? curveResult.metricPoints : [])
        setChangePoints(Array.isArray(curveResult?.changePoints) ? curveResult.changePoints : [])
        setCareMarkers(Array.isArray(markerResult) ? markerResult : [])
      })
      .finally(() => {
        if (isActive) setIsLoading(false)
      })

    return () => {
      isActive = false
    }
  }, [])

  const visiblePoints = useMemo(() => (
    metricPoints
      .filter(({ metricType }) => metricType === 'jaw-angle')
      .slice()
      .sort((first, second) => (
        new Date(first.capturedAt).getTime() - new Date(second.capturedAt).getTime()
      ))
  ), [metricPoints])

  const firstPoint = visiblePoints[0]
  const currentPoint = visiblePoints[visiblePoints.length - 1]
  const analyzedPhotoCount = new Set(metricPoints.map(({ photoId }) => photoId)).size
  const visibleChangePoints = changePoints.filter(({ metricType }) => metricType === 'jaw-angle')
  const periodLabel = firstPoint && currentPoint
    ? `${new Date(firstPoint.capturedAt).getUTCFullYear()} – ${new Date(currentPoint.capturedAt).getUTCFullYear()}`
    : '표시할 기간 없음'

  return (
    <main className="app-shell metric-curve-page">
      <header className="metric-curve-page__header">
        <span>분석 결과</span>
        <h1>시간에 따른<br />변화를 확인해 보세요.</h1>
      </header>

      <BaseCard className="metric-curve-page__summary">
        <div>
          <span>분석된 사진</span>
          <strong>{analyzedPhotoCount}장</strong>
        </div>
        <div>
          <span>분석 기간</span>
          <strong>{periodLabel}</strong>
        </div>
        {currentPoint && (
          <div className="metric-curve-page__current">
            <span>현재 턱선 각도</span>
            <strong>{currentPoint.value.toFixed(1)}°</strong>
          </div>
        )}
      </BaseCard>

      <BaseCard className="metric-curve-page__chart-card">
        <div className="metric-curve-page__chart-header">
          <div>
            <span>변화곡선</span>
            <h2>턱선 각도</h2>
          </div>
          <span>{periodLabel}</span>
        </div>

        {isLoading ? (
          <div className="metric-curve-page__loading" aria-live="polite">변화 데이터를 불러오고 있어요.</div>
        ) : hasError ? (
          <div className="metric-curve-page__loading" role="alert">변화 데이터를 불러오지 못했어요.</div>
        ) : (
          <MetricCurveChart
            points={visiblePoints}
            changePoints={visibleChangePoints}
            careMarkers={careMarkers}
            selectedMarker={selectedMarker}
            onSelectMarker={(marker) => {
              setSelectedMarker((current) => current?.key === marker.key ? null : marker)
            }}
          />
        )}
      </BaseCard>

      {selectedMarker && (
        <BaseCard className="metric-curve-page__marker-card" aria-live="polite">
          <div>
            <span>{selectedMarker.type === 'changePoint' ? '변화 시점' : '관리 기록'}</span>
            <time dateTime={selectedMarker.item.date}>{formatPhotoDate(selectedMarker.item.date)}</time>
          </div>
          {selectedMarker.type === 'changePoint' ? (
            <>
              <strong>{selectedMarker.item.direction === 'increase' ? '증가' : '감소'}</strong>
              <p>변화폭 {selectedMarker.item.magnitude}</p>
              <div className="metric-curve-page__marker-note">
                연결된 관리 기록 정보가 없어 변화 시점 정보만 표시합니다.
              </div>
            </>
          ) : (
            <>
              <strong>{selectedMarker.item.kind}</strong>
              <p>{selectedMarker.item.rawText}</p>
              <section className="metric-curve-page__comparison" aria-label="실제값과 예측값 비교">
                <h3>예측과 실제 비교</h3>
                <div className="metric-curve-page__comparison-empty">
                  <strong>비교 데이터 준비 중</strong>
                  <p>{safeInterpretationText(CARE_COMPARISON_EMPTY_TEXT)}</p>
                </div>
              </section>
              <div className="metric-curve-page__observation">
                <strong>관찰 정보</strong>
                <p>{safeInterpretationText(CARE_OBSERVATION_TEXT)}</p>
              </div>
            </>
          )}
        </BaseCard>
      )}

      <aside className="metric-curve-page__description">
        <strong>그래프는 이렇게 읽어보세요</strong>
        <p>같은 지표를 촬영 시점 순서로 이어 시간에 따른 흐름을 보여줍니다.</p>
      </aside>

      <div className="metric-curve-page__actions">
        {!isLoading && (hasError || visiblePoints.length === 0) ? (
          <ActionButton fullWidth onClick={() => navigate('/photos/upload')}>
            사진 추가하기
          </ActionButton>
        ) : isFirstAnalysis ? (
          <ActionButton fullWidth onClick={() => navigate('/photos/analysis-complete', { replace: true })}>
            분석 완료하기
          </ActionButton>
        ) : (
          <>
            <ActionButton fullWidth onClick={() => navigate('/curve/rewind')}>시점별로 살펴보기</ActionButton>
            <ActionButton fullWidth variant="outline" onClick={() => navigate('/curve/compare')}>두 시점 비교하기</ActionButton>
          </>
        )}
      </div>

      <BottomNavigation />
    </main>
  )
}

export default MetricCurvePage
