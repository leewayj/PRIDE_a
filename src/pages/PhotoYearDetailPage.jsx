import { useEffect, useRef } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import PhotoPickerButton from '../components/photos/PhotoPickerButton.jsx'
import usePhotoSelection from '../hooks/usePhotoSelection.js'
import { getPhotoStatus } from '../utils/photoStatus.js'

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m15 5-7 7 7 7" />
    </svg>
  )
}

function PhotoPlaceholderIcon() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <rect x="7" y="9" width="34" height="30" rx="4" />
      <circle cx="18" cy="19" r="4" />
      <path d="m10 35 9-9 7 7 5-5 7 7" />
    </svg>
  )
}

function formatPhotoDate(value) {
  if (!value) return '촬영 날짜 확인 불가'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '촬영 날짜 확인 불가'

  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}. ${month}. ${day}.`
}

function PhotoThumbnail({ file, name }) {
  const imageRef = useRef(null)

  useEffect(() => {
    if (!file || !imageRef.current) return undefined

    const previewUrl = URL.createObjectURL(file)
    imageRef.current.src = previewUrl
    return () => URL.revokeObjectURL(previewUrl)
  }, [file])

  if (file) {
    return <img ref={imageRef} alt={name || '등록한 사진'} />
  }

  return (
    <div className="photo-year-detail__placeholder">
      <PhotoPlaceholderIcon />
      <span>원본 사진은<br />보관되지 않습니다.</span>
    </div>
  )
}

function PhotoYearDetailPage() {
  const navigate = useNavigate()
  const { year: yearParam } = useParams()
  const { analyzedPhotos, photoFiles } = usePhotoSelection()
  const year = Number(yearParam)
  const isValidYear = /^\d{1,4}$/.test(yearParam ?? '') && year >= 1 && year <= 9999

  if (!isValidYear) return <Navigate to="/photos/years" replace />

  const filesById = new Map(photoFiles.map(({ id, file }) => [id, file]))
  const photos = analyzedPhotos
    .filter(({ takenYear }) => takenYear === year)
    .sort((a, b) => {
      const firstDate = new Date(a.takenAt ?? 0).getTime()
      const secondDate = new Date(b.takenAt ?? 0).getTime()
      return secondDate - firstDate
    })
  const status = getPhotoStatus(photos.length)

  return (
    <section className="photo-year-detail">
      <header className="photo-year-detail__header">
        <button type="button" onClick={() => navigate(-1)} aria-label="이전 화면으로 돌아가기">
          <BackIcon />
        </button>
      </header>

      <div className="photo-year-detail__summary">
        <h1>{year}</h1>
        <div>
          <span>{photos.length}장</span>
          <span className={`photo-years-page__status photo-years-page__status--${status.modifier}`}>
            {status.label}
          </span>
        </div>
      </div>

      {photos.length > 0 ? (
        <ul className="photo-year-detail__grid" aria-label={`${year}년 사진 목록`}>
          {photos.map((photo) => (
            <li key={photo.id}>
              <div className="photo-year-detail__thumbnail">
                <PhotoThumbnail file={filesById.get(photo.id)} name={photo.name} />
              </div>
              <time dateTime={photo.takenAt ?? undefined}>{formatPhotoDate(photo.takenAt)}</time>
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
    </section>
  )
}

export default PhotoYearDetailPage
