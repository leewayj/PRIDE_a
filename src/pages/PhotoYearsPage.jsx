import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getPhotos } from '../api/photoApi.js'
import PhotoPickerButton from '../components/photos/PhotoPickerButton.jsx'
import { PHOTO_ANALYSIS_STATUS } from '../constants/photo.js'
import { validateStoredPhotos } from '../domain/photoStorage.js'
import usePhotoSelection from '../hooks/usePhotoSelection.js'
import { groupStoredPhotosByYear } from '../utils/photoGrouping.js'
import { getYearPhotoStatus, getYearPhotoStatusLabel } from '../utils/photoStatus.js'
import { YEAR_UPLOAD_MIN_COUNT } from '../utils/uploadConstraints.js'
import { getOrCreateUserId } from '../utils/userSession.js'

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m15 5-7 7 7 7" />
    </svg>
  )
}

function PhotoYearsPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { photos: pendingPhotos } = usePhotoSelection()
  const [storedPhotos, setStoredPhotos] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const requestIdRef = useRef(0)
  const currentYear = new Date().getFullYear()
  const defaultYears = Array.from({ length: 8 }, (_, index) => currentYear - index)

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

  const groupedPhotos = groupStoredPhotosByYear(storedPhotos)
  const photosByYear = new Map(groupedPhotos.map((group) => [group.year, group.photos]))
  const years = [...new Set([...defaultYears, ...groupedPhotos.map(({ year }) => year)])]
    .sort((a, b) => b - a)
  const failedPhotoCount = pendingPhotos.filter(
    ({ analysisStatus }) => analysisStatus === PHOTO_ANALYSIS_STATUS.FAILED,
  ).length

  return (
    <section className="photo-years-page">
      <header className="photo-years-page__header">
        <button type="button" onClick={() => navigate(-1)} aria-label="이전 화면으로 돌아가기">
          <BackIcon />
        </button>
        <span>연도별로 넣기</span>
      </header>

      <div className="photo-years-page__intro">
        <h1>한 해씩 골라 넣으세요.</h1>
        <p>한 해에 사진 {YEAR_UPLOAD_MIN_COUNT}장쯤이면 그 해의 그래프가 확실히 생깁니다.</p>
      </div>

      {hasError && (
        <p className="photo-years-page__error" role="alert">
          저장된 사진 현황을 불러오지 못했어요. 화면을 새로고침해 주세요.
        </p>
      )}

      <ul className="photo-years-page__list" aria-label="연도별 사진 현황">
        {years.map((year) => {
          const count = isLoading ? 0 : photosByYear.get(year)?.length ?? 0
          const status = getYearPhotoStatus(count)

          return (
            <li key={year}>
              <button type="button" onClick={() => navigate(`/photos/years/${year}`, { state: location.state })}>
                <span>{year}</span>
                <span className="photo-years-page__summary">
                  <span className="photo-years-page__count">{isLoading ? '...' : `${count}장`}</span>
                  <span className={`photo-years-page__status photo-years-page__status--${status}`}>
                    {getYearPhotoStatusLabel(status)}
                  </span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>

      <button
        className="photo-years-page__other"
        type="button"
        onClick={() => navigate('/photos/other', { state: location.state })}
      >
          <span>기타</span>
          <span className={`photo-years-page__other-status${failedPhotoCount > 0 ? ' is-needed' : ''}`}>
            {failedPhotoCount > 0 ? `${failedPhotoCount}장 · 확인 필요` : '아직 없음'}
          </span>
      </button>

      <PhotoPickerButton className="photo-years-page__cta" />
    </section>
  )
}

export default PhotoYearsPage
