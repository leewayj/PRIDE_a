import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DeletePhotoDialog from '../components/photos/DeletePhotoDialog.jsx'
import PhotoCard, { PhotoPlaceholderIcon } from '../components/photos/PhotoCard.jsx'
import ActionButton from '../components/ui/ActionButton.jsx'
import { PHOTO_ANALYSIS_STATUS } from '../constants/photo.js'
import usePhotoSelection from '../hooks/usePhotoSelection.js'

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m15 5-7 7 7 7" />
    </svg>
  )
}

function PhotoOtherPage() {
  const navigate = useNavigate()
  const { selectedPhotoResults, removePhoto } = usePhotoSelection()
  const [pendingPhoto, setPendingPhoto] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const failedPhotos = selectedPhotoResults.filter(
    ({ analysisStatus }) => analysisStatus === PHOTO_ANALYSIS_STATUS.FAILED,
  )

  const confirmDelete = async () => {
    if (!pendingPhoto || deleting) return

    setDeleting(true)
    await new Promise((resolve) => requestAnimationFrame(resolve))
    removePhoto(pendingPhoto.id)
    setPendingPhoto(null)
    setDeleting(false)
  }

  return (
    <section className="photo-year-detail photo-other-page">
      <header className="photo-year-detail__header">
        <button type="button" onClick={() => navigate(-1)} aria-label="이전 화면으로 돌아가기">
          <BackIcon />
        </button>
      </header>

      <div className="photo-year-detail__summary">
        <h1>기타</h1>
        <div>
          <span>{failedPhotos.length}장</span>
          <span className="photo-years-page__status photo-years-page__status--unknown">
            {failedPhotos.length > 0 ? '확인 필요' : '아직 없음'}
          </span>
        </div>
      </div>

      {failedPhotos.length > 0 ? (
        <ul className="photo-year-detail__grid" aria-label="촬영 연도 확인이 필요한 사진 목록">
          {failedPhotos.map((photo) => (
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
          <h2>확인이 필요한 사진이 없어요</h2>
          <p>분석하지 못한 사진이 생기면 이곳에서 확인할 수 있습니다.</p>
          <ActionButton
            fullWidth
            className="photo-year-detail__empty-cta"
            onClick={() => navigate('/photos/years')}
          >
            연도별 현황으로 돌아가기
          </ActionButton>
        </div>
      )}

      {pendingPhoto && (
        <DeletePhotoDialog
          deleting={deleting}
          onCancel={() => setPendingPhoto(null)}
          onConfirm={confirmDelete}
        />
      )}
    </section>
  )
}

export default PhotoOtherPage
