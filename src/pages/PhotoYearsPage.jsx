import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import ActionButton from '../components/ui/ActionButton.jsx'
import usePhotoSelection from '../hooks/usePhotoSelection.js'
import { getPhotoTakenAt } from '../utils/photoDate.js'

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m15 5-7 7 7 7" />
    </svg>
  )
}

function PhotoYearsPage() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const isProcessingRef = useRef(false)
  const { setSelectedPhotos } = usePhotoSelection()
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 8 }, (_, index) => currentYear - index)

  const handlePhotoSelection = async (event) => {
    const input = event.currentTarget

    if (isProcessingRef.current || !input.files?.length) return

    isProcessingRef.current = true

    try {
      const imageFiles = Array.from(input.files).filter((file) =>
        file.type.startsWith('image/'),
      )
      const photos = await Promise.all(
        imageFiles.map(async (file) => ({
          file,
          takenAt: await getPhotoTakenAt(file),
        })),
      )

      setSelectedPhotos(photos)
    } finally {
      input.value = ''
      isProcessingRef.current = false
    }
  }

  return (
    <section className="photo-years-page">
      <header className="photo-years-page__header">
        <button type="button" onClick={() => navigate(-1)} aria-label="이전 화면으로 돌아가기">
          <BackIcon />
        </button>
      </header>

      <div className="photo-years-page__intro">
        <h1>한 해씩 골라 넣으세요.</h1>
      </div>

      <ul className="photo-years-page__list" aria-label="연도별 사진 현황">
        {years.map((year) => (
          <li key={year}>
            <span>{year}</span>
            <span className="photo-years-page__empty">아직 없음</span>
          </li>
        ))}
      </ul>

      <div className="photo-years-page__cta">
        <input
          ref={fileInputRef}
          className="photo-years-page__file-input"
          type="file"
          accept="image/*"
          multiple
          onChange={handlePhotoSelection}
        />
        <ActionButton fullWidth onClick={() => fileInputRef.current?.click()}>
          사진 선택하기
        </ActionButton>
      </div>
    </section>
  )
}

export default PhotoYearsPage
