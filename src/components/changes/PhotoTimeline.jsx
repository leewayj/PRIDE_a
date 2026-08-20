import { useEffect, useState } from 'react'
import ActionButton from '../ui/ActionButton.jsx'
import BaseCard from '../ui/BaseCard.jsx'
import { formatPhotoDate } from '../../utils/dateFormat.js'
import { buildImageDataUrl } from '../../utils/imageFormat.js'

function timelinePosition(date, startTime, timeRange) {
  if (timeRange === 0) return 50
  const timestamp = new Date(date).getTime()
  if (Number.isNaN(timestamp)) return 0
  return Math.min(100, Math.max(0, ((timestamp - startTime) / timeRange) * 100))
}

export function PhotoPreview({ photo }) {
  const [objectUrl] = useState(() => (!photo.imageBase64 && photo.file) ? URL.createObjectURL(photo.file) : '')
  const [hasImageError, setHasImageError] = useState(false)
  const previewUrl = photo.imageBase64 ? buildImageDataUrl(photo.imageBase64) : objectUrl

  useEffect(() => () => {
    if (objectUrl) URL.revokeObjectURL(objectUrl)
  }, [objectUrl])

  if (!previewUrl || hasImageError) {
    return (
      <div className="photo-timeline__preview-fallback" role="img" aria-label={`${photo.fileName ?? formatPhotoDate(photo.capturedAt)} 미리보기 없음`}>
        <svg viewBox="0 0 64 64" aria-hidden="true"><rect x="10" y="13" width="44" height="38" rx="5" /><circle cx="25" cy="27" r="5" /><path d="m14 45 11-11 8 8 6-6 11 9" /></svg>
        <span>저장된 사진 정보</span>
      </div>
    )
  }

  return <img src={previewUrl} alt={`${formatPhotoDate(photo.capturedAt)} 얼굴 사진`} onError={() => setHasImageError(true)} />
}

function PhotoTimeline({ photos, careMarkers, selectedPhotoId, onSelectPhoto, onCompare, onUpload }) {
  if (photos.length === 0) {
    return (
      <BaseCard className="photo-timeline__empty">
        <strong>타임라인에 표시할 사진이 없어요.</strong>
        <p>사진을 추가하면 촬영 날짜에 따라 변화 기록을 볼 수 있어요.</p>
        <ActionButton onClick={onUpload}>사진 추가하기</ActionButton>
      </BaseCard>
    )
  }

  const selectedIndex = Math.max(0, photos.findIndex(({ id }) => id === selectedPhotoId))
  const selectedPhoto = photos[selectedIndex]
  const startTime = new Date(photos[0].capturedAt).getTime()
  const endTime = new Date(photos[photos.length - 1].capturedAt).getTime()
  const timeRange = endTime - startTime
  const visibleMarkers = careMarkers.filter(({ date }) => {
    const timestamp = new Date(date).getTime()
    return !Number.isNaN(timestamp) && timestamp >= startTime && timestamp <= endTime
  })
  const markerLaneCounts = new Map()

  return (
    <section className="photo-timeline">
      <div className="changes-page__metric-section">
        <h2>얼굴 사진 흐름</h2>
        <p>촬영 시점을 선택해 사진을 확인해 보세요.</p>
      </div>

      <BaseCard className="photo-timeline__viewer">
        <div className="photo-timeline__date"><span>선택한 시점</span><time dateTime={selectedPhoto.capturedAt}>{formatPhotoDate(selectedPhoto.capturedAt)}</time></div>
        <div className="photo-timeline__preview" key={selectedPhoto.id}><PhotoPreview photo={selectedPhoto} /></div>
        {selectedPhoto.fileName && <p>{selectedPhoto.fileName}</p>}
      </BaseCard>

      <BaseCard className="photo-timeline__track-card">
        <div className="photo-timeline__track-heading"><strong>사진 분포</strong><span>{photos.length}장</span></div>
        <div className="photo-timeline__track" aria-label="촬영 날짜별 사진 타임라인">
          <span className="photo-timeline__rail" />
          {photos.map((photo) => {
            const position = timelinePosition(photo.capturedAt, startTime, timeRange)
            const isSelected = photo.id === selectedPhoto.id
            return (
              <button
                type="button"
                className={isSelected ? 'is-selected' : ''}
                style={{ left: `${position}%` }}
                aria-label={`${formatPhotoDate(photo.capturedAt)} 사진 선택`}
                aria-pressed={isSelected}
                onClick={() => onSelectPhoto(photo.id)}
                key={photo.id}
              ><span /></button>
            )
          })}
          {visibleMarkers.map((marker) => {
            const lane = markerLaneCounts.get(marker.date) ?? 0
            markerLaneCounts.set(marker.date, lane + 1)
            return (
              <span
                className="photo-timeline__care-marker"
                style={{ left: `${timelinePosition(marker.date, startTime, timeRange)}%`, top: `${39 + Math.min(lane, 2) * 7}px` }}
                title={`${marker.kind} · ${formatPhotoDate(marker.date)}`}
                key={marker.id}
              />
            )
          })}
        </div>
        <div className="photo-timeline__range"><time>{formatPhotoDate(photos[0].capturedAt)}</time><time>{formatPhotoDate(photos[photos.length - 1].capturedAt)}</time></div>
        <div className="photo-timeline__controls">
          <button type="button" disabled={selectedIndex === 0} onClick={() => onSelectPhoto(photos[selectedIndex - 1]?.id)} aria-label="이전 사진">←</button>
          <span>{selectedIndex + 1} / {photos.length}</span>
          <button type="button" disabled={selectedIndex === photos.length - 1} onClick={() => onSelectPhoto(photos[selectedIndex + 1]?.id)} aria-label="다음 사진">→</button>
        </div>
      </BaseCard>

      <ActionButton fullWidth onClick={() => onCompare(selectedPhoto.id)}>두 사진 비교하기</ActionButton>
    </section>
  )
}

export default PhotoTimeline
