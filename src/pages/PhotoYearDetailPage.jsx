import { useCallback, useEffect, useRef, useState } from 'react'
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import { getPhotos } from '../api/photoApi.js'
import PhotoCard, { PhotoPlaceholderIcon } from '../components/photos/PhotoCard.jsx'
import PhotoPickerButton from '../components/photos/PhotoPickerButton.jsx'
import BaseCard from '../components/ui/BaseCard.jsx'
import { validateStoredPhotos } from '../domain/photoStorage.js'
import { groupStoredPhotosByYear } from '../utils/photoGrouping.js'
import { getYearPhotoStatus, getYearPhotoStatusLabel } from '../utils/photoStatus.js'
import { YEAR_UPLOAD_MAX_COUNT, YEAR_UPLOAD_MIN_COUNT } from '../utils/uploadConstraints.js'
import { getOrCreateUserId } from '../utils/userSession.js'

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m15 5-7 7 7 7" />
    </svg>
  )
}

function PhotoYearDetailPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { year: yearParam } = useParams()
  const [storedPhotos, setStoredPhotos] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const requestIdRef = useRef(0)
  const year = Number(yearParam)
  const currentYear = new Date().getFullYear()
  const defaultYears = Array.from({ length: 8 }, (_, index) => currentYear - index)
  const isValidYear = /^\d{4}$/.test(yearParam ?? '') && (defaultYears.includes(year) || year <= currentYear)

  const loadStoredPhotos = useCallback(async () => {
    const requestId = requestIdRef.current + 1
    requestIdRef.current = requestId
    setIsLoading(true)
    setHasError(false)

    try {
      const userId = await getOrCreateUserId()
      const result = validateStoredPhotos(await getPhotos(userId))
      if (requestIdRef.current === requestId) setStoredPhotos(result)
    } catch (error) {
      console.error('저장된 사진 목록을 불러오지 못했습니다.', error)
      if (requestIdRef.current === requestId) setHasError(true)
    } finally {
      if (requestIdRef.current === requestId) setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    let isActive = true
    queueMicrotask(() => { if (isActive) loadStoredPhotos() })
    return () => { isActive = false; requestIdRef.current += 1 }
  }, [loadStoredPhotos])

  if (!isValidYear) return <Navigate to="/photos/years" replace state={location.state} />

  const groupedPhotos = groupStoredPhotosByYear(storedPhotos)
  const photos = groupedPhotos.find((group) => group.year === year)?.photos ?? []
  const status = getYearPhotoStatus(photos.length)

  return (
    <section className="photo-year-detail">
      <header className="photo-year-detail__header">
        <button type="button" onClick={() => navigate(-1)} aria-label="이전 화면으로 돌아가기">
          <BackIcon />
        </button>
        <strong>{year}</strong>
      </header>

      <div className="photo-year-detail__summary">
        <div className="photo-year-detail__range">
          <span>최소 {YEAR_UPLOAD_MIN_COUNT}장</span>
          <span>최대 {YEAR_UPLOAD_MAX_COUNT}장</span>
        </div>
        <div>
          <span>{isLoading ? '...' : `${photos.length}장`}</span>
          <span className={`photo-years-page__status photo-years-page__status--${status}`}>
            {getYearPhotoStatusLabel(status)}
          </span>
        </div>
      </div>

      {isLoading ? (
        <BaseCard className="photo-year-detail__empty" aria-live="polite">
          사진을 불러오고 있어요.
        </BaseCard>
      ) : hasError ? (
        <BaseCard className="photo-year-detail__empty" role="alert">
          <strong>사진을 불러오지 못했어요.</strong>
          <p>잠시 후 다시 시도해 주세요.</p>
        </BaseCard>
      ) : photos.length > 0 ? (
        <ul className="photo-year-detail__grid" aria-label={`${year}년 사진 목록`}>
          {photos.map((photo) => (
            <li key={photo.id}>
              <PhotoCard photo={photo} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="photo-year-detail__empty">
          <PhotoPlaceholderIcon />
          <h2>아직 등록된 사진이 없어요</h2>
          <p>사진을 추가하면 촬영 날짜에 따라 자동으로 분류됩니다.</p>
          <PhotoPickerButton className="photo-year-detail__empty-cta" />
        </div>
      )}

      {photos.length > 0 && (
        <PhotoPickerButton className="photo-year-detail__cta">사진 더 선택하기</PhotoPickerButton>
      )}
    </section>
  )
}

export default PhotoYearDetailPage
