import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getPhotos } from '../api/photoApi.js'
import MetricCurveChart from '../components/curve/MetricCurveChart.jsx'
import CareMarkerBottomSheet from '../components/careMarkers/CareMarkerBottomSheet.jsx'
import DeleteCareMarkerDialog from '../components/careMarkers/DeleteCareMarkerDialog.jsx'
import BottomNavigation from '../components/navigation/BottomNavigation.jsx'
import ActionButton from '../components/ui/ActionButton.jsx'
import BaseCard from '../components/ui/BaseCard.jsx'
import PhotoTimeline from '../components/changes/PhotoTimeline.jsx'
import { fetchCareMarkers, fetchMetricCurve } from '../services/retraceApi'
import { formatPhotoDate } from '../utils/dateFormat.js'
import { getOrCreateUserId } from '../utils/userSession.js'
import '../styles/changes.css'

const METRICS = [
  { type: 'face-width', label: '얼굴폭' },
  { type: 'jaw-angle', label: '턱선 각도' },
  { type: 'eyelid-height', label: '눈꺼풀 높이' },
  { type: 'mouth-corner-angle', label: '입가 각도' },
]

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
  const [editingCareMarker, setEditingCareMarker] = useState(null)
  const [deletingCareMarker, setDeletingCareMarker] = useState(null)
  const [openRecordMenuId, setOpenRecordMenuId] = useState(null)
  const [storedPhotos, setStoredPhotos] = useState([])
  const [arePhotosLoading, setArePhotosLoading] = useState(true)
  const [hasPhotosError, setHasPhotosError] = useState(false)
  const photoRequestIdRef = useRef(0)
  const isPhotoRequestingRef = useRef(false)

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
          markerResponse.status === 'fulfilled' && Array.isArray(markerResponse.value)
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
  }, [])

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

  const metricLabel = METRICS.find(({ type }) => type === selectedMetric)?.label ?? ''
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
              {METRICS.map(({ type, label }) => (
                <button type="button" className={selectedMetric === type ? 'is-active' : ''} aria-pressed={selectedMetric === type} onClick={() => { setSelectedMetric(type); setSelectedMarker(null) }} key={type}>{label}</button>
              ))}
            </div>
          </div>

          <BaseCard className="changes-page__chart-card">
            <div className="changes-page__chart-heading"><span>변화곡선</span><h2>{metricLabel}</h2></div>
            {isLoading ? (
              <div className="changes-page__chart-state" aria-live="polite">변화 데이터를 불러오고 있어요.</div>
            ) : hasError ? (
              <div className="changes-page__chart-state" role="alert">변화 데이터를 불러오지 못했어요.</div>
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
            {isLoading ? (
              <BaseCard className="changes-page__records-empty" aria-live="polite">관리 기록을 불러오고 있어요.</BaseCard>
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
                        <span><strong>{marker.kind}</strong><small>{marker.rawText}</small></span>
                        <time dateTime={marker.date}>{formatPhotoDate(marker.date)}</time>
                      </button>
                      <RecordMenu
                        marker={marker}
                        isOpen={openRecordMenuId === marker.id}
                        onToggle={() => setOpenRecordMenuId((current) => current === marker.id ? null : marker.id)}
                        onEdit={() => { setEditingCareMarker(marker); setIsAddSheetOpen(true); setOpenRecordMenuId(null) }}
                        onDelete={() => { setDeletingCareMarker(marker); setOpenRecordMenuId(null) }}
                      />
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
                <strong>{selectedCareMarker.kind}</strong>
                <p>{selectedCareMarker.rawText}</p>
              </BaseCard>
            )}
            <ActionButton fullWidth variant="outline" onClick={() => { setEditingCareMarker(null); setIsAddSheetOpen(true) }}>+ 기록 추가하기</ActionButton>
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
            openRecordMenuId={openRecordMenuId}
            onToggleMenu={(markerId) => setOpenRecordMenuId((current) => current === markerId ? null : markerId)}
            onEdit={(marker) => { setEditingCareMarker(marker); setIsAddSheetOpen(true); setOpenRecordMenuId(null) }}
            onDelete={(marker) => { setDeletingCareMarker(marker); setOpenRecordMenuId(null) }}
            onAdd={() => { setEditingCareMarker(null); setIsAddSheetOpen(true) }}
            isLoading={isLoading}
          />
        </section>
      )}

      <BottomNavigation />
      {isAddSheetOpen && (
        <CareMarkerBottomSheet
          careMarker={editingCareMarker}
          onClose={() => { setIsAddSheetOpen(false); setEditingCareMarker(null) }}
          onSave={(marker) => {
            setCareMarkers((current) => editingCareMarker
              ? current.map((existingMarker) => existingMarker.id === marker.id ? marker : existingMarker)
              : [...current, marker])
            setIsAddSheetOpen(false)
            setEditingCareMarker(null)
          }}
        />
      )}
      {deletingCareMarker && (
        <DeleteCareMarkerDialog
          careMarker={deletingCareMarker}
          onCancel={() => setDeletingCareMarker(null)}
          onConfirm={() => {
            const targetId = deletingCareMarker.id
            setCareMarkers((current) => current.filter(({ id }) => id !== targetId))
            setSelectedMarker((current) => current?.key === `care-${targetId}` ? null : current)
            setDeletingCareMarker(null)
          }}
        />
      )}
    </main>
  )
}

function RecordMenu({ marker, isOpen, onToggle, onEdit, onDelete }) {
  return (
    <div className="changes-page__record-menu">
      <button className="changes-page__record-menu-trigger" type="button" aria-label={`${marker.kind} 메뉴`} aria-expanded={isOpen} onClick={onToggle}>⋯</button>
      {isOpen && (
        <div className="changes-page__record-menu-popover">
          <button type="button" onClick={onEdit}>수정</button>
          <button className="is-destructive" type="button" onClick={onDelete}>삭제</button>
        </div>
      )}
    </div>
  )
}

function CareRecords({ careMarkers, orderedCareMarkers, selectedMarker, onSelectMarker, openRecordMenuId, onToggleMenu, onEdit, onDelete, onAdd, isLoading }) {
  return (
    <section className="changes-page__records" aria-labelledby="timeline-care-records-title">
      <div className="changes-page__section-heading"><h2 id="timeline-care-records-title">관리 기록</h2><span>{careMarkers.length}</span></div>
      {isLoading ? (
        <BaseCard className="changes-page__records-empty" aria-live="polite">관리 기록을 불러오고 있어요.</BaseCard>
      ) : orderedCareMarkers.length > 0 ? (
        <BaseCard className="changes-page__record-list"><ul>{orderedCareMarkers.map((marker) => (
          <li className={selectedMarker?.key === `care-${marker.id}` ? 'is-selected' : ''} key={marker.id}>
            <div className="changes-page__record-row"><button className="changes-page__record-select" type="button" aria-pressed={selectedMarker?.key === `care-${marker.id}`} onClick={() => onSelectMarker((current) => current?.key === `care-${marker.id}` ? null : { type: 'careMarker', key: `care-${marker.id}`, item: marker })}>
              <span className="changes-page__record-dot" aria-hidden="true" /><span><strong>{marker.kind}</strong><small>{marker.rawText}</small></span><time dateTime={marker.date}>{formatPhotoDate(marker.date)}</time>
            </button><RecordMenu marker={marker} isOpen={openRecordMenuId === marker.id} onToggle={() => onToggleMenu(marker.id)} onEdit={() => onEdit(marker)} onDelete={() => onDelete(marker)} /></div>
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
