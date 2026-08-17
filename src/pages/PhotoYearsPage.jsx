import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import ActionButton from '../components/ui/ActionButton.jsx'
import usePhotoSelection from '../hooks/usePhotoSelection.js'

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
  const { analyzedPhotos, queueSelectedPhotos } = usePhotoSelection()
  const currentYear = new Date().getFullYear()
  const defaultYears = Array.from({ length: 8 }, (_, index) => currentYear - index)
  const analyzedYears = analyzedPhotos
    .map(({ takenYear }) => takenYear)
    .filter((year) => Number.isInteger(year))
  const years = [...new Set([...defaultYears, ...analyzedYears])].sort((a, b) => b - a)
  const photoCountByYear = analyzedPhotos.reduce((counts, { takenYear }) => {
    if (Number.isInteger(takenYear)) {
      counts.set(takenYear, (counts.get(takenYear) ?? 0) + 1)
    }
    return counts
  }, new Map())
  const unknownYearCount = analyzedPhotos.filter(({ takenYear }) => takenYear === null).length

  const getYearStatus = (count) => {
    if (count === 0) return { label: '아직 없음', modifier: 'empty' }
    if (count < 5) return { label: '사진 적음', modifier: 'low' }
    return { label: '사진 충분', modifier: 'enough' }
  }

  const handlePhotoSelection = (event) => {
    const input = event.currentTarget

    if (isProcessingRef.current || !input.files?.length) return

    try {
      const imageFiles = Array.from(input.files).filter((file) =>
        file.type.startsWith('image/'),
      )

      isProcessingRef.current = true
      const queuedCount = queueSelectedPhotos(imageFiles)

      if (queuedCount > 0) navigate('/photos/analyzing')
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
        {years.map((year) => {
          const count = photoCountByYear.get(year) ?? 0
          const status = getYearStatus(count)

          return (
            <li key={year}>
              <span>{year}</span>
              <span className="photo-years-page__summary">
                <span className="photo-years-page__count">{count}장</span>
                <span className={`photo-years-page__status photo-years-page__status--${status.modifier}`}>
                  {status.label}
                </span>
              </span>
            </li>
          )
        })}
      </ul>

      {unknownYearCount > 0 && (
        <div className="photo-years-page__other" role="status">
          <span>기타</span>
          <span className="photo-years-page__summary">
            <span className="photo-years-page__count">{unknownYearCount}장</span>
            <span className="photo-years-page__status photo-years-page__status--unknown">
              연도 미확인
            </span>
          </span>
        </div>
      )}

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
