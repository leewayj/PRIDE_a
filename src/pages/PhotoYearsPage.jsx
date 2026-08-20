import { useLocation, useNavigate } from 'react-router-dom'
import PhotoPickerButton from '../components/photos/PhotoPickerButton.jsx'
import { PHOTO_ANALYSIS_STATUS } from '../constants/photo.js'
import usePhotoSelection from '../hooks/usePhotoSelection.js'
import { groupPhotosByYear } from '../utils/photoGrouping.js'
import { getYearPhotoStatus, getYearPhotoStatusLabel } from '../utils/photoStatus.js'
import { YEAR_UPLOAD_MIN_COUNT } from '../utils/uploadConstraints.js'

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
  const { selectedPhotoResults } = usePhotoSelection()
  const currentYear = new Date().getFullYear()
  const defaultYears = Array.from({ length: 8 }, (_, index) => currentYear - index)
  const groupedSelectedPhotos = groupPhotosByYear(selectedPhotoResults)
  const selectedYearCounts = new Map(groupedSelectedPhotos.map((group) => [group.year, group.photos.length]))
  const years = [...new Set([...defaultYears, ...groupedSelectedPhotos.map(({ year }) => year)])]
    .sort((a, b) => b - a)
  const failedPhotoCount = selectedPhotoResults.filter(
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
        <h1>선택한 사진의 연도별 분포</h1>
        <p>한 해에 사진 {YEAR_UPLOAD_MIN_COUNT}장쯤이면 그 해의 그래프가 확실히 생깁니다.</p>
      </div>

      <ul className="photo-years-page__list" aria-label="선택한 사진의 연도별 현황">
        {years.map((year) => {
          const count = selectedYearCounts.get(year) ?? 0
          const status = getYearPhotoStatus(count)

          return (
            <li key={year}>
              <button type="button" onClick={() => navigate(`/photos/years/${year}`, { state: location.state })}>
                <span>{year}</span>
                <span className="photo-years-page__summary">
                  <span className="photo-years-page__count">{count}장</span>
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
