import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getPhotos } from '../api/photoApi.js'
import { getIndicatorCurve } from '../api/indicatorApi.js'
import { getMarkerList, registerMarker } from '../api/markerApi.js'
import MetricCurveChart from '../components/curve/MetricCurveChart.jsx'
import CareMarkerBottomSheet from '../components/careMarkers/CareMarkerBottomSheet.jsx'
import BottomNavigation from '../components/navigation/BottomNavigation.jsx'
import ActionButton from '../components/ui/ActionButton.jsx'
import BaseCard from '../components/ui/BaseCard.jsx'
import PhotoTimeline from '../components/changes/PhotoTimeline.jsx'
import { INDICATOR_OPTIONS, mapIndicatorCurveToChartData } from '../domain/indicatorCurve.js'
import { mapMarkerListToCareMarkers } from '../domain/marker.js'
import { formatPhotoDate } from '../utils/dateFormat.js'
import { getOrCreateUserId } from '../utils/userSession.js'
import '../styles/changes.css'

function ChangesPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const requestedTab = new URLSearchParams(location.search).get('tab')
  const [activeTab, setActiveTab] = useState(requestedTab === 'timeline' ? 'timeline' : 'curve')
  const [selectedMetric, setSelectedMetric] = useState('jaw-angle')
  const [metricPoints, setMetricPoints] = useState([])
  const [changePoints, setChangePoints] = useState([])
  const [careMarkers, setCareMarkers] = useState([])
  const [selectedMarker, setSelectedMarker] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false)
  const [areMarkersLoading, setAreMarkersLoading] = useState(true)
  const [hasMarkersError, setHasMarkersError] = useState(false)
  const [storedPhotos, setStoredPhotos] = useState([])
  const [arePhotosLoading, setArePhotosLoading] = useState(true)
  const [hasPhotosError, setHasPhotosError] = useState(false)
  const photoRequestIdRef = useRef(0)
  const isPhotoRequestingRef = useRef(false)
  const curveRequestIdRef = useRef(0)
  const markerRequestIdRef = useRef(0)

  const selectedIndicator = INDICATOR_OPTIONS.find(({ metricType }) => metricType === selectedMetric)

  const loadCurve = useCallback(async (option) => {
    const requestId = curveRequestIdRef.current + 1
    curveRequestIdRef.current = requestId
    setIsLoading(true)
    setHasError(false)
    setMetricPoints([])
    setChangePoints([])
    setSelectedMarker(null)

    try {
      const userId = await getOrCreateUserId()
      const response = await getIndicatorCurve(userId, option.indicator)
      const curve = mapIndicatorCurveToChartData(response, option)
      if (curveRequestIdRef.current !== requestId) return
      setMetricPoints(curve.metricPoints)
      setChangePoints(curve.changePoints)
    } catch (error) {
      console.error('변화 곡선을 불러오지 못했습니다.', error)
      if (curveRequestIdRef.current === requestId) setHasError(true)
    } finally {
      if (curveRequestIdRef.current === requestId) setIsLoading(false)
    }
  }, [])

  const loadStoredPhotos = useCallback(async () => {
    if (isPhotoRequestingRef.current) return

    isPhotoRequestingRef.current = true
    const requestId = photoRequestIdRef.current + 1
    photoRequestIdRef.current = requestId
    setArePhotosLoading(true)
    setHasPhotosError(false)

    try {
      const userId = await getOrCreateUserId()
      const result = await getPhotos(userId)
      if (!Array.isArray(result)) throw new Error('photos response must be an array')
      if (photoRequestIdRef.current === requestId) setStoredPhotos(result)
    } catch (error) {
      console.error('저장된 사진 목록을 불러오지 못했습니다.', error)
      if (photoRequestIdRef.current === requestId) setHasPhotosError(true)
    } finally {
      if (photoRequestIdRef.current === requestId) {
        isPhotoRequestingRef.current = false
        setArePhotosLoading(false)
      }
    }
  }, [])

  const loadMarkers = useCallback(async () => {
    const requestId = markerRequestIdRef.current + 1
    markerRequestIdRef.current = requestId
    setAreMarkersLoading(true)
    setHasMarkersError(false)

    try {
      const userId = await getOrCreateUserId()
      const response = await getMarkerList(userId)
      const markers = mapMarkerListToCareMarkers(response)
      if (markerRequestIdRef.current === requestId) setCareMarkers(markers)
    } catch (error) {
      console.error('관리 기록을 불러오지 못했습니다.', error)
      if (markerRequestIdRef.current === requestId) setHasMarkersError(true)
    } finally {
      if (markerRequestIdRef.current === requestId) setAreMarkersLoading(false)
    }
  }, [])

  const saveMarker = useCallback(async ({ date, note }) => {
    const userId = await getOrCreateUserId()
    await registerMarker(userId, date, note)
    await loadMarkers()
    setIsAddSheetOpen(false)
  }, [loadMarkers])

  useEffect(() => {
    let isActive = true

    queueMicrotask(() => {
      if (isActive) loadMarkers()
    })

    return () => {
      isActive = false
      markerRequestIdRef.current += 1
    }
  }, [loadMarkers])

  useEffect(() => {
    let isActive = true
    queueMicrotask(() => {
      if (isActive && selectedIndicator) loadCurve(selectedIndicator)
    })

    return () => {
      isActive = false
      curveRequestIdRef.current += 1
    }
  }, [loadCurve, selectedIndicator])

  useEffect(() => {
    let isActive = true
    queueMicrotask(() => {
      if (isActive) loadStoredPhotos()
    })

    return () => {
      isActive = false
      photoRequestIdRef.current += 1
      isPhotoRequestingRef.current = false
    }
  }, [loadStoredPhotos])

  const visiblePoints = useMemo(() => (
    metricPoints
      .filter(({ metricType }) => metricType === selectedMetric)
      .slice()
      .sort((first, second) => new Date(first.capturedAt) - new Date(second.capturedAt))
  ), [metricPoints, selectedMetric])

  const visibleChangePoints = useMemo(() => (
    changePoints.filter(({ metricType }) => metricType === selectedMetric)
  ), [changePoints, selectedMetric])

  const orderedCareMarkers = useMemo(() => (
    careMarkers
      .slice()
      .sort((first, second) => new Date(second.date) - new Date(first.date))
  ), [careMarkers])

  const metricLabel = selectedIndicator?.label ?? ''
  const selectedCareMarker = selectedMarker?.type === 'careMarker'
    ? careMarkers.find(({ id }) => `care-${id}` === selectedMarker.key) ?? null
    : null
  const interpretationPoint = selectedMarker?.type === 'changePoint'
    ? selectedMarker.item
    : visibleChangePoints[0]
  return (
    <main className="app-shell changes-page">
      <header className="changes-page__header"><h1>기록</h1></header>

      <div className="changes-page__tabs" role="tablist" aria-label="기록 보기 방식">
        <button type="button" role="tab" aria-selected={activeTab === 'curve'} className={activeTab === 'curve' ? 'is-active' : ''} onClick={() => { setActiveTab('curve'); navigate('/changes', { replace: true }) }}>곡선</button>
        <button type="button" role="tab" aria-selected={activeTab === 'timeline'} className={activeTab === 'timeline' ? 'is-active' : ''} onClick={() => { setActiveTab('timeline'); navigate('/changes?tab=timeline', { replace: true }) }}>타임라인</button>
      </div>

      {activeTab === 'curve' ? (
        <section className="changes-page__curve" role="tabpanel">
          <div className="changes-page__metric-section">
            <h2>변화 지표</h2>
            <div className="changes-page__metrics" aria-label="변화 지표 선택">
              {INDICATOR_OPTIONS.map(({ metricType, label }) => (
                <button type="button" className={selectedMetric === metricType ? 'is-active' : ''} aria-pressed={selectedMetric === metricType} onClick={() => { setSelectedMetric(metricType); setSelectedMarker(null) }} key={metricType}>{label}</button>
              ))}
            </div>
          </div>

          <BaseCard className="changes-page__chart-card">
            <div className="changes-page__chart-heading"><span>변화곡선</span><h2>{metricLabel}</h2></div>
            {isLoading ? (
              <div className="changes-page__chart-state" aria-live="polite">변화 데이터를 불러오고 있어요.</div>
            ) : hasError ? (
              <div className="changes-page__chart-state" role="alert">
                <div><strong>변화 기록을 불러오지 못했어요.</strong><p>잠시 후 다시 시도해 주세요.</p><ActionButton onClick={() => loadCurve(selectedIndicator)}>다시 시도</ActionButton></div>
              </div>
            ) : (
              <MetricCurveChart points={visiblePoints} changePoints={visibleChangePoints} careMarkers={careMarkers} selectedMarker={selectedMarker} metricLabel={metricLabel} onSelectMarker={(marker) => setSelectedMarker((current) => current?.key === marker.key ? null : marker)} />
            )}
            <button className="changes-page__detail-link" type="button" onClick={() => navigate('/curve')}>상세 변화 보기 <span aria-hidden="true">→</span></button>
          </BaseCard>

          {interpretationPoint && (
            <BaseCard className="changes-page__interpretation-card">
              <span>변화 해석</span>
              <h2>이 시점의 변화를 자세히 살펴보세요.</h2>
              <p>{formatPhotoDate(interpretationPoint.date)}에 확인된 실제 변화와 같은 시기의 관리 기록을 함께 볼 수 있어요.</p>
              <button type="button" onClick={() => navigate('/curve/interpretation', { state: { changePoint: interpretationPoint, careMarkers } })}>
                변화 해석 보기 <span aria-hidden="true">→</span>
              </button>
            </BaseCard>
          )}

          <section className="changes-page__records" aria-labelledby="care-records-title">
            <div className="changes-page__section-heading"><h2 id="care-records-title">관리 기록</h2><span>{careMarkers.length}</span></div>
            {areMarkersLoading ? (
              <BaseCard className="changes-page__records-empty" aria-live="polite">관리 기록을 불러오고 있어요.</BaseCard>
            ) : hasMarkersError ? (
              <BaseCard className="changes-page__records-empty" role="alert"><strong>관리 기록을 불러오지 못했어요.</strong><p>잠시 후 다시 시도해 주세요.</p><ActionButton onClick={loadMarkers}>다시 시도</ActionButton></BaseCard>
            ) : orderedCareMarkers.length > 0 ? (
              <BaseCard className="changes-page__record-list">
                <ul>
                  {orderedCareMarkers.map((marker) => (
                    <li className={selectedMarker?.key === `care-${marker.id}` ? 'is-selected' : ''} key={marker.id}>
                      <div className="changes-page__record-row">
                      <button
                        className="changes-page__record-select"
                        type="button"
                        aria-pressed={selectedMarker?.key === `care-${marker.id}`}
                        onClick={() => setSelectedMarker((current) => current?.key === `care-${marker.id}` ? null : { type: 'careMarker', key: `care-${marker.id}`, item: marker })}
                      >
                        <span className="changes-page__record-dot" aria-hidden="true" />
                        <span><strong>{marker.rawText}</strong></span>
                        <time dateTime={marker.date}>{formatPhotoDate(marker.date)}</time>
                      </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </BaseCard>
            ) : (
              <BaseCard className="changes-page__records-empty"><strong>아직 추가된 관리 기록이 없어요.</strong><p>관리를 기록하면 변화곡선과 함께 확인할 수 있어요.</p></BaseCard>
            )}
            {selectedCareMarker && (
              <BaseCard className="changes-page__selected-record" aria-live="polite">
                <div><span>선택한 관리 기록</span><time dateTime={selectedCareMarker.date}>{formatPhotoDate(selectedCareMarker.date)}</time></div>
                <strong>{selectedCareMarker.rawText}</strong>
              </BaseCard>
            )}
            <ActionButton fullWidth variant="outline" onClick={() => setIsAddSheetOpen(true)}>+ 기록 추가하기</ActionButton>
          </section>
        </section>
      ) : (
        <section className="changes-page__timeline" role="tabpanel">
          {arePhotosLoading ? (
            <BaseCard className="photo-timeline__empty" aria-live="polite">
              <strong>사진 기록을 불러오고 있어요.</strong>
            </BaseCard>
          ) : hasPhotosError ? (
            <BaseCard className="photo-timeline__empty" role="alert">
              <strong>사진 기록을 불러오지 못했어요.</strong>
              <p>잠시 후 다시 시도해 주세요.</p>
              <ActionButton onClick={loadStoredPhotos}>다시 시도</ActionButton>
            </BaseCard>
          ) : storedPhotos.length === 0 ? (
            <PhotoTimeline
              photos={[]}
              careMarkers={careMarkers}
              selectedPhotoId={null}
              onSelectPhoto={() => {}}
              onCompare={() => {}}
              onUpload={() => navigate('/photos/upload')}
            />
          ) : (
            <BaseCard className="photo-timeline__empty">
              <strong>저장된 사진 {storedPhotos.length}장을 불러왔어요.</strong>
              <p>사진 항목의 표시 필드가 확인되면 타임라인에서 볼 수 있어요.</p>
            </BaseCard>
          )}
          <CareRecords
            careMarkers={careMarkers}
            orderedCareMarkers={orderedCareMarkers}
            selectedMarker={selectedMarker}
            onSelectMarker={setSelectedMarker}
            onAdd={() => setIsAddSheetOpen(true)}
            isLoading={areMarkersLoading}
            hasError={hasMarkersError}
            onRetry={loadMarkers}
          />
        </section>
      )}

      <BottomNavigation />
      {isAddSheetOpen && (
        <CareMarkerBottomSheet
          onClose={() => setIsAddSheetOpen(false)}
          onSave={saveMarker}
        />
      )}
    </main>
  )
}

function CareRecords({ careMarkers, orderedCareMarkers, selectedMarker, onSelectMarker, onAdd, isLoading, hasError, onRetry }) {
  return (
    <section className="changes-page__records" aria-labelledby="timeline-care-records-title">
      <div className="changes-page__section-heading"><h2 id="timeline-care-records-title">관리 기록</h2><span>{careMarkers.length}</span></div>
      {isLoading ? (
        <BaseCard className="changes-page__records-empty" aria-live="polite">관리 기록을 불러오고 있어요.</BaseCard>
      ) : hasError ? (
        <BaseCard className="changes-page__records-empty" role="alert"><strong>관리 기록을 불러오지 못했어요.</strong><p>잠시 후 다시 시도해 주세요.</p><ActionButton onClick={onRetry}>다시 시도</ActionButton></BaseCard>
      ) : orderedCareMarkers.length > 0 ? (
        <BaseCard className="changes-page__record-list"><ul>{orderedCareMarkers.map((marker) => (
          <li className={selectedMarker?.key === `care-${marker.id}` ? 'is-selected' : ''} key={marker.id}>
            <div className="changes-page__record-row"><button className="changes-page__record-select" type="button" aria-pressed={selectedMarker?.key === `care-${marker.id}`} onClick={() => onSelectMarker((current) => current?.key === `care-${marker.id}` ? null : { type: 'careMarker', key: `care-${marker.id}`, item: marker })}>
              <span className="changes-page__record-dot" aria-hidden="true" /><span><strong>{marker.rawText}</strong></span><time dateTime={marker.date}>{formatPhotoDate(marker.date)}</time>
            </button></div>
          </li>
        ))}</ul></BaseCard>
      ) : (
        <BaseCard className="changes-page__records-empty"><strong>아직 추가된 관리 기록이 없어요.</strong><p>관리를 기록하면 타임라인에서 함께 확인할 수 있어요.</p></BaseCard>
      )}
      <ActionButton fullWidth variant="outline" onClick={onAdd}>+ 기록 추가하기</ActionButton>
    </section>
  )
}

export default ChangesPage
