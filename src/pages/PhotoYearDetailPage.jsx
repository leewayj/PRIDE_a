import { useState } from 'react'
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import DeletePhotoDialog from '../components/photos/DeletePhotoDialog.jsx'
import PhotoCard, { PhotoPlaceholderIcon } from '../components/photos/PhotoCard.jsx'
import PhotoPickerButton from '../components/photos/PhotoPickerButton.jsx'
import usePhotoSelection from '../hooks/usePhotoSelection.js'
import { groupPhotosByYear } from '../utils/photoGrouping.js'
import { getYearPhotoStatus, getYearPhotoStatusLabel } from '../utils/photoStatus.js'
import { YEAR_UPLOAD_MAX_COUNT, YEAR_UPLOAD_MIN_COUNT } from '../utils/uploadConstraints.js'

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
  const { photos: allPhotos, removePhoto } = usePhotoSelection()
  const [pendingPhoto, setPendingPhoto] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const year = Number(yearParam)
  const currentYear = new Date().getFullYear()
  const defaultYears = Array.from({ length: 8 }, (_, index) => currentYear - index)
  const groupedPhotos = groupPhotosByYear(allPhotos)
  const supportedYears = new Set([...defaultYears, ...groupedPhotos.map((group) => group.year)])
  const isValidYear = /^\d{4}$/.test(yearParam ?? '') && supportedYears.has(year)

  if (!isValidYear) return <Navigate to="/photos/years" replace state={location.state} />

  const photos = groupedPhotos.find((group) => group.year === year)?.photos ?? []
  const status = getYearPhotoStatus(photos.length)

  const confirmDelete = async () => {
    if (!pendingPhoto || deleting) return

    setDeleting(true)
    await new Promise((resolve) => requestAnimationFrame(resolve))
    removePhoto(pendingPhoto.id)
    setPendingPhoto(null)
    setDeleting(false)
  }

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
          <span>{photos.length}장</span>
          <span className={`photo-years-page__status photo-years-page__status--${status}`}>
            {getYearPhotoStatusLabel(status)}
          </span>
        </div>
      </div>

      {photos.length > 0 ? (
        <ul className="photo-year-detail__grid" aria-label={`${year}년 사진 목록`}>
          {photos.map((photo) => (
            <li key={photo.id}>
              <PhotoCard
                photo={photo}
                file={photo.file}
                deleting={pendingPhoto?.id === photo.id}
                onDelete={setPendingPhoto}
              />
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

      {pendingPhoto && (
        <DeletePhotoDialog
          deleting={deleting}
          onCancel={() => setPendingPhoto(null)}
          onConfirm={confirmDelete}
        />
      )}

      {photos.length > 0 && (
        <PhotoPickerButton className="photo-year-detail__cta">사진 더 선택하기</PhotoPickerButton>
      )}
    </section>
  )
}

export default PhotoYearDetailPage
