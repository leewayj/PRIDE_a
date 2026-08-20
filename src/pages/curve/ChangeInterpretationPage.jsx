import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import MetricCurveChart from '../../components/curve/MetricCurveChart.jsx'
import BottomNavigation from '../../components/navigation/BottomNavigation.jsx'
import ActionButton from '../../components/ui/ActionButton.jsx'
import BaseCard from '../../components/ui/BaseCard.jsx'
import { validateInterpretationCardText } from '../../domain/interpretationCardValidation'
import { fetchCareMarkers, fetchMetricCurve } from '../../services/retraceApi'
import { formatPhotoDate } from '../../utils/dateFormat.js'
import '../../styles/change-interpretation.css'
import '../../styles/curve.css'

const METRIC_LABELS = {
  'face-width': '얼굴폭',
  'jaw-angle': '턱선 각도',
  'eyelid-height': '눈꺼풀 높이',
  'mouth-corner-angle': '입가 각도',
}

const OBSERVATION_TEXT = '선택한 시점부터 실제 측정 흐름이 이전 구간과 달라졌어요.'
const RECORD_NOTICE_TEXT = '같은 시기의 관리 기록을 함께 살펴볼 수 있어요. 관리 기록만으로 변화의 이유를 단정하지 않아요.'

function safeText(text) {
  return validateInterpretationCardText(text).hasForbiddenExpression ? '' : text
}

function ChangeInterpretationPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const requestedChangePoint = location.state?.changePoint
  const requestedCareMarkers = location.state?.careMarkers
  const [metricPoints, setMetricPoints] = useState([])
  const [changePoints, setChangePoints] = useState([])
  const [careMarkers, setCareMarkers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    let isActive = true

    Promise.allSettled([fetchMetricCurve(), fetchCareMarkers()])
      .then(([curveResponse, markerResponse]) => {
        if (!isActive) return

        if (curveResponse.status === 'fulfilled') {
          setMetricPoints(Array.isArray(curveResponse.value?.metricPoints) ? curveResponse.value.metricPoints : [])
          setChangePoints(Array.isArray(curveResponse.value?.changePoints) ? curveResponse.value.changePoints : [])
        } else {
          setHasError(true)
        }

        setCareMarkers(
          Array.isArray(requestedCareMarkers)
            ? requestedCareMarkers
            : markerResponse.status === 'fulfilled' && Array.isArray(markerResponse.value)
              ? markerResponse.value
              : [],
        )
      })
      .finally(() => {
        if (isActive) setIsLoading(false)
      })

    return () => {
      isActive = false
    }
  }, [requestedCareMarkers])

  const selectedChangePoint = useMemo(() => {
    if (changePoints.length === 0) return null
    if (!requestedChangePoint) return changePoints[0]

    return changePoints.find(({ date, metricType }) => (
      date === requestedChangePoint.date && metricType === requestedChangePoint.metricType
    )) ?? changePoints[0]
  }, [changePoints, requestedChangePoint])

  const visiblePoints = useMemo(() => {
    if (!selectedChangePoint) return []
    return metricPoints
      .filter(({ metricType }) => metricType === selectedChangePoint.metricType)
      .slice()
      .sort((first, second) => new Date(first.capturedAt) - new Date(second.capturedAt))
  }, [metricPoints, selectedChangePoint])

  const visibleChangePoints = useMemo(() => {
    if (!selectedChangePoint) return []
    return changePoints.filter(({ metricType }) => metricType === selectedChangePoint.metricType)
  }, [changePoints, selectedChangePoint])

  const surroundingCareMarkers = useMemo(() => {
    if (!selectedChangePoint) return []
    const selectedYear = new Date(selectedChangePoint.date).getUTCFullYear()
    return careMarkers
      .filter(({ date }) => new Date(date).getUTCFullYear() === selectedYear)
      .slice()
      .sort((first, second) => new Date(first.date) - new Date(second.date))
  }, [careMarkers, selectedChangePoint])

  const metricLabel = selectedChangePoint ? METRIC_LABELS[selectedChangePoint.metricType] : ''
  const selectedMarker = selectedChangePoint ? {
    type: 'changePoint',
    key: `change-${selectedChangePoint.metricType}-${selectedChangePoint.date}`,
    item: selectedChangePoint,
  } : null
  const signedMagnitude = selectedChangePoint
    ? `${selectedChangePoint.direction === 'increase' ? '+' : '-'}${selectedChangePoint.magnitude}`
    : ''

  return (
    <main className="app-shell change-interpretation-page">
      <header className="change-interpretation-page__header">
        <button type="button" onClick={() => navigate(-1)} aria-label="이전 화면으로 돌아가기">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 5-7 7 7 7" /></svg>
        </button>
        <span>변화 해석</span>
      </header>

      {isLoading ? (
        <BaseCard className="change-interpretation-page__state" aria-live="polite">변화 데이터를 불러오고 있어요.</BaseCard>
      ) : hasError ? (
        <BaseCard className="change-interpretation-page__state" role="alert">
          <strong>변화 데이터를 불러오지 못했어요.</strong>
          <ActionButton variant="outline" onClick={() => navigate('/changes')}>기록으로 돌아가기</ActionButton>
        </BaseCard>
      ) : !selectedChangePoint ? (
        <BaseCard className="change-interpretation-page__state">
          <strong>아직 해석할 변화 시점이 없어요.</strong>
          <p>사진이 쌓여 변화 시점이 확인되면 여기에서 자세히 볼 수 있어요.</p>
          <ActionButton variant="outline" onClick={() => navigate('/changes')}>기록으로 돌아가기</ActionButton>
        </BaseCard>
      ) : (
        <>
          <section className="change-interpretation-page__intro">
            <span>변화가 나타난 시점</span>
            <h1>{formatPhotoDate(selectedChangePoint.date)}</h1>
            <p>{metricLabel}의 측정 흐름에서 변화가 확인된 시점이에요.</p>
          </section>

          <BaseCard className="change-interpretation-page__chart-card">
            <div className="change-interpretation-page__chart-heading">
              <div><span>실제 변화 흐름</span><h2>{metricLabel}</h2></div>
              <strong>{signedMagnitude}</strong>
            </div>
            <MetricCurveChart
              points={visiblePoints}
              changePoints={visibleChangePoints}
              careMarkers={careMarkers}
              selectedMarker={selectedMarker}
              metricLabel={metricLabel}
              onSelectMarker={() => {}}
            />
          </BaseCard>

          <BaseCard className="change-interpretation-page__observation">
            <span>관찰 가능한 변화</span>
            <h2>{selectedChangePoint.direction === 'increase' ? '측정값이 증가한 시점이에요.' : '측정값이 감소한 시점이에요.'}</h2>
            <p>{safeText(OBSERVATION_TEXT)}</p>
          </BaseCard>

          <section className="change-interpretation-page__records" aria-labelledby="surrounding-records-title">
            <div>
              <h2 id="surrounding-records-title">같은 시기의 관리 기록</h2>
              <span>{surroundingCareMarkers.length}</span>
            </div>
            <p>{safeText(RECORD_NOTICE_TEXT)}</p>
            {surroundingCareMarkers.length > 0 ? (
              <ul>
                {surroundingCareMarkers.map((marker) => (
                  <li key={marker.id}>
                    <BaseCard>
                      <div><strong>{marker.kind}</strong><time dateTime={marker.date}>{formatPhotoDate(marker.date)}</time></div>
                      <p>{marker.rawText}</p>
                      <button
                        className="change-interpretation-page__compare-record"
                        type="button"
                        onClick={() => navigate('/care-markers/effectiveness', { state: { careMarker: marker } })}
                      >
                        이 기록과 비교하기
                      </button>
                    </BaseCard>
                  </li>
                ))}
              </ul>
            ) : (
              <BaseCard className="change-interpretation-page__records-empty">같은 시기에 등록된 관리 기록이 없어요.</BaseCard>
            )}
          </section>

        </>
      )}

      <BottomNavigation />
    </main>
  )
}

export default ChangeInterpretationPage
