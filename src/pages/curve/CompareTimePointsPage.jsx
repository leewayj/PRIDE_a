import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { PhotoPreview } from '../../components/changes/PhotoTimeline.jsx'
import BottomNavigation from '../../components/navigation/BottomNavigation.jsx'
import ActionButton from '../../components/ui/ActionButton.jsx'
import BaseCard from '../../components/ui/BaseCard.jsx'
import usePhotoSelection from '../../hooks/usePhotoSelection.js'
import { fetchMetricCurve } from '../../services/retraceApi'
import { formatPhotoDate } from '../../utils/dateFormat.js'
import { groupPhotosByYear } from '../../utils/photoGrouping.js'
import '../../styles/photo-compare.css'

const METRICS = [
  { type: 'face-width', label: '얼굴폭', unit: '' },
  { type: 'jaw-angle', label: '턱선 각도', unit: '°' },
  { type: 'eyelid-height', label: '눈꺼풀 높이', unit: '' },
  { type: 'mouth-corner-angle', label: '입가 각도', unit: '°' },
]

function formatMetricValue(value, unit) {
  return typeof value === 'number' ? `${value.toFixed(1)}${unit}` : '데이터 없음'
}

function formatMetricDifference(leftValue, rightValue, unit) {
  if (typeof leftValue !== 'number' || typeof rightValue !== 'number') return '데이터 없음'
  const difference = rightValue - leftValue
  return `${difference > 0 ? '+' : ''}${difference.toFixed(1)}${unit}`
}

function CompareTimePointsPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { photos } = usePhotoSelection()
  const [metricPoints, setMetricPoints] = useState([])
  const eligiblePhotos = groupPhotosByYear(photos)
    .flatMap(({ photos: yearPhotos }) => yearPhotos)
    .reverse()
  const requestedPhotoId = location.state?.timelinePhotoId
  const requestedPhoto = eligiblePhotos.find(({ id }) => id === requestedPhotoId)
  const initialRightPhoto = requestedPhoto ?? eligiblePhotos[eligiblePhotos.length - 1]
  const initialLeftPhoto = eligiblePhotos.find(({ id }) => id !== initialRightPhoto?.id)
  const [leftPhotoId, setLeftPhotoId] = useState(initialLeftPhoto?.id ?? '')
  const [rightPhotoId, setRightPhotoId] = useState(initialRightPhoto?.id ?? '')
  const leftPhoto = eligiblePhotos.find(({ id }) => id === leftPhotoId)
  const rightPhoto = eligiblePhotos.find(({ id }) => id === rightPhotoId)
  const metricComparisons = useMemo(() => METRICS.map((metric) => {
    const leftPoint = metricPoints.find(({ photoId, metricType }) => photoId === leftPhotoId && metricType === metric.type)
    const rightPoint = metricPoints.find(({ photoId, metricType }) => photoId === rightPhotoId && metricType === metric.type)
    return { ...metric, leftValue: leftPoint?.value, rightValue: rightPoint?.value }
  }), [leftPhotoId, metricPoints, rightPhotoId])
  const hasConnectedMetric = metricComparisons.some(({ leftValue, rightValue }) => (
    typeof leftValue === 'number' || typeof rightValue === 'number'
  ))

  useEffect(() => {
    let isActive = true
    fetchMetricCurve()
      .then((result) => {
        if (isActive) setMetricPoints(Array.isArray(result?.metricPoints) ? result.metricPoints : [])
      })
      .catch(() => {})
    return () => { isActive = false }
  }, [])

  return (
    <main className="app-shell photo-compare-page">
      <header className="photo-compare-page__header">
        <button type="button" onClick={() => navigate(-1)} aria-label="이전 화면으로 돌아가기">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 5-7 7 7 7" /></svg>
        </button>
        <span>두 사진 비교</span>
      </header>

      {eligiblePhotos.length < 2 ? (
        <BaseCard className="photo-compare-page__empty">
          <strong>두 사진을 비교하려면<br />사용 가능한 사진이 2장 이상 필요해요.</strong>
          <p>{eligiblePhotos.length === 0 ? '아직 타임라인에 표시할 사진이 없어요.' : '사진을 한 장 더 추가해 주세요.'}</p>
          <ActionButton onClick={() => navigate('/photos/upload')}>사진 추가하기</ActionButton>
        </BaseCard>
      ) : (
        <>
          <section className="photo-compare-page__intro">
            <span>시점 비교</span>
            <h1>두 시점의 얼굴 사진을<br />나란히 확인해 보세요</h1>
            <p>변화의 좋고 나쁨을 판단하지 않고, 선택한 사진을 그대로 보여드려요.</p>
          </section>

          <section className="photo-compare-page__photos" aria-label="선택한 두 사진">
            <ComparePhotoCard label="사진 A" photo={leftPhoto} photos={eligiblePhotos} otherPhotoId={rightPhotoId} onChange={setLeftPhotoId} />
            <span className="photo-compare-page__versus" aria-hidden="true">VS</span>
            <ComparePhotoCard label="사진 B" photo={rightPhoto} photos={eligiblePhotos} otherPhotoId={leftPhotoId} onChange={setRightPhotoId} />
          </section>

          <BaseCard className="photo-compare-page__metrics">
            <span>지표 비교</span>
            {hasConnectedMetric ? (
              <ul>{metricComparisons.map((metric) => (
                <li key={metric.type}>
                  <strong>{metric.label}</strong>
                  <div><span>{formatMetricValue(metric.leftValue, metric.unit)}</span><i aria-hidden="true">→</i><span>{formatMetricValue(metric.rightValue, metric.unit)}</span></div>
                  <small>차이 {formatMetricDifference(metric.leftValue, metric.rightValue, metric.unit)}</small>
                </li>
              ))}</ul>
            ) : (
              <div className="photo-compare-page__metrics-empty"><h2>비교 지표 데이터가 아직 준비되지 않았어요.</h2><p>선택한 Photo ID와 연결된 MetricPoint가 없어 사진과 날짜만 표시합니다.</p></div>
            )}
          </BaseCard>

          <aside className="photo-compare-page__notice">사진은 각 시점의 기록을 비교하기 위해 나란히 표시됩니다. 사진만으로 변화의 이유를 단정하지 않아요.</aside>
        </>
      )}
      <BottomNavigation />
    </main>
  )
}

function ComparePhotoCard({ label, photo, photos, otherPhotoId, onChange }) {
  return (
    <BaseCard className="photo-compare-page__photo-card">
      <span>{label}</span>
      <time dateTime={photo.capturedAt}>{formatPhotoDate(photo.capturedAt)}</time>
      <div className="photo-compare-page__image" key={photo.id}><PhotoPreview photo={photo} /></div>
      <label>
        <span>비교할 사진 변경</span>
        <select value={photo.id} onChange={(event) => onChange(event.target.value)}>
          {photos.map((option) => (
            <option value={option.id} disabled={option.id === otherPhotoId} key={option.id}>{formatPhotoDate(option.capturedAt)}</option>
          ))}
        </select>
      </label>
    </BaseCard>
  )
}

export default CompareTimePointsPage
