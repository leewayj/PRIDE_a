import { useNavigate } from 'react-router-dom'
import ActionButton from '../components/ui/ActionButton.jsx'

function PhotosPage() {
  const navigate = useNavigate()

  return (
    <section className="photos-upload-page">
      <div className="photos-upload-page__content">
        <div className="photos-upload-page__icon" aria-hidden="true">
          <svg viewBox="0 0 64 64">
            <rect x="10" y="13" width="44" height="38" rx="5" />
            <circle cx="25" cy="27" r="5" />
            <path d="m14 45 11-11 8 8 6-6 11 9" />
          </svg>
        </div>
        <h1>사진을 모아<br />변화를 확인하세요.</h1>
        <p>해마다 사진을 한 장씩 골라 넣으면<br />시간에 따른 변화를 볼 수 있어요.</p>
      </div>

      <div className="photos-upload-page__cta">
        <ActionButton fullWidth onClick={() => navigate('/photos/years')}>
          사진 업로드
        </ActionButton>
      </div>
    </section>
  )
}

export default PhotosPage
