import { useNavigate } from 'react-router-dom'
import ActionButton from '../components/ui/ActionButton.jsx'
import { YEAR_UPLOAD_MIN_COUNT } from '../utils/uploadConstraints.js'

function PhotosPage() {
  const navigate = useNavigate()

  return (
    <section className="photos-upload-page">
      <header className="photos-upload-page__header">
        <span>변화 시점</span>
      </header>

      <div className="photos-upload-page__content">
        <h1>지난 몇 년치 사진을<br />골라 넣어주세요.</h1>
        <p className="photos-upload-page__lead">이제 얼굴이 어떻게<br />달라졌는지 볼 차례예요.</p>
        <p>준비가 끝났습니다. 아래와 같이 사용해보세요.</p>

        <div className="photos-upload-page__chart" aria-label="변화 그래프 예시">
          <span>턱선 각도 2015 - 2026</span>
          <svg viewBox="0 0 300 92" aria-hidden="true">
            <path d="M8 65 C38 67 54 60 82 63 S130 60 154 64 S204 58 230 48 S265 38 292 30" />
            <line x1="218" y1="14" x2="218" y2="78" />
            <circle cx="292" cy="30" r="4" />
          </svg>
        </div>

        <ol className="photos-upload-page__steps">
          <li><span>1</span><div><strong>연도별로 골라 넣기</strong><p>한 해에 사진을 {YEAR_UPLOAD_MIN_COUNT}장쯤 골라 주세요.</p></div></li>
          <li><span>2</span><div><strong>본인 사진만 담기</strong><p>다른 사람 얼굴과 각도는 알아서 걸러냅니다.</p></div></li>
          <li><span>3</span><div><strong>시간축에 이어 곡선 그리기</strong><p>연도별 최소 {YEAR_UPLOAD_MIN_COUNT}장씩 이어집니다.</p></div></li>
        </ol>

        <aside>갤러리 전체를 열어보지 않습니다. 직접 고르신 사진만 확인합니다.</aside>
      </div>

      <div className="photos-upload-page__cta">
        <ActionButton fullWidth onClick={() => navigate('/photos/years')}>
          시작하기
        </ActionButton>
      </div>
    </section>
  )
}

export default PhotosPage
