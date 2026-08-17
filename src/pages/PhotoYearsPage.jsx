import { useNavigate } from 'react-router-dom'
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

function PhotoYearsPage() {
  const navigate = useNavigate()
  const { analyzedPhotos } = usePhotoSelection()
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
          const status = getPhotoStatus(count)

          return (
            <li key={year}>
              <button type="button" onClick={() => navigate(`/photos/years/${year}`)}>
                <span>{year}</span>
                <span className="photo-years-page__summary">
                  <span className="photo-years-page__count">{count}장</span>
                  <span className={`photo-years-page__status photo-years-page__status--${status.modifier}`}>
                    {status.label}
                  </span>
                </span>
              </button>
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

      <PhotoPickerButton className="photo-years-page__cta" />
    </section>
  )
}

export default PhotoYearsPage
