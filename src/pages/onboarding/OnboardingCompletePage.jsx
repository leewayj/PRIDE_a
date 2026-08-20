import { useEffect, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import ActionButton from '../../components/ui/ActionButton.jsx'
import { ONBOARDING_RESULT_STATUS } from '../../constants/onboarding.js'
import '../../styles/onboarding.css'

function SuccessIllustration() {
  return (
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <path d="M26 43V29a3 3 0 0 1 3-3h14M77 26h14a3 3 0 0 1 3 3v14M94 77v14a3 3 0 0 1-3 3H77M43 94H29a3 3 0 0 1-3-3V77" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="4" />
      <circle cx="60" cy="57" r="22" fill="none" stroke="currentColor" strokeWidth="4" />
      <path d="M45 82c4-10 9-14 15-14s11 4 15 14M49 54h1M70 54h1M53 63c4 3 10 3 14 0" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="4" />
      <circle cx="91" cy="88" r="16" fill="var(--rose-900)" />
      <path d="m84 88 5 5 9-11" fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5" />
    </svg>
  )
}

function ResultPreview({ previewUrl, number, isProblem }) {
  return (
    <div className={`result-preview${isProblem ? ' result-preview--problem' : ''}`}>
      {previewUrl ? (
        <img src={previewUrl} alt={`${number}번째 선택 사진`} />
      ) : (
        <div className="result-preview__placeholder" role="img" aria-label={`${number}번째 사진 예시`}>
          <span />
        </div>
      )}
      <span className="result-preview__badge">{isProblem ? '확인 필요' : number}</span>
    </div>
  )
}

function ErrorResult({ result, previewUrls, onRetry, onContinue }) {
  const isFaceNotFound = result === ONBOARDING_RESULT_STATUS.FACE_NOT_FOUND

  return (
    <section className="photo-result photo-result--error">
      <header className="photo-result__error-header">
        <span aria-hidden="true">!</span>
        <div>
          <h1>{isFaceNotFound ? <>세 번째 사진에서<br />얼굴을 못 찾았어요</> : <>세 장이 같은 사람이<br />아닌 것 같아요</>}</h1>
          <p>{isFaceNotFound ? '얼굴이 선명하게 나온 다른 사진을 골라주세요.' : '사진을 다시 확인하고 같은 사람의 사진으로 골라주세요.'}</p>
        </div>
      </header>

      <div className="photo-result__previews">
        {[0, 1, 2].map((index) => (
          <ResultPreview
            previewUrl={previewUrls[index]}
            number={index + 1}
            isProblem={index === 2}
            key={index}
          />
        ))}
      </div>

      <aside className="photo-result__notice">
        {isFaceNotFound
          ? '정면을 바라보고 얼굴 전체가 가려지지 않은 사진이 좋아요.'
          : '빛, 각도, 표정에 따라 다르게 보일 수 있어요. 세 번째 사진을 먼저 확인해 주세요.'}
      </aside>

      <div className="photo-result__actions">
        <ActionButton fullWidth onClick={onRetry}>다른 사진 고르기</ActionButton>
        {isFaceNotFound && onContinue ? (
          <ActionButton fullWidth variant="outline" onClick={onContinue}>그냥 계속하기</ActionButton>
        ) : null}
      </div>
    </section>
  )
}

function GenericErrorResult({ onRetry }) {
  return (
    <section className="photo-result photo-result--error">
      <header className="photo-result__error-header">
        <span aria-hidden="true">!</span>
        <div>
          <h1>사진을 처리하지<br />못했어요</h1>
          <p>잠시 후 다시 시도해 주세요.</p>
        </div>
      </header>

      <aside className="photo-result__notice">
        서버 오류와 사진 판정 결과는 서로 다를 수 있어요. 사진을 다시 확인해 주세요.
      </aside>

      <div className="photo-result__actions">
        <ActionButton fullWidth onClick={onRetry}>사진 다시 선택하기</ActionButton>
      </div>
    </section>
  )
}

function OnboardingCompletePage({ completion = false }) {
  const navigate = useNavigate()
  const location = useLocation()
  const photos = Array.isArray(location.state?.photos)
    ? location.state.photos.filter((photo) => photo instanceof Blob)
    : []
  const resultStatus = location.state?.resultStatus
  const [previewUrls] = useState(() => (
    photos.slice(0, 3).map((file) => URL.createObjectURL(file))
  ))

  useEffect(() => () => {
    previewUrls.forEach((previewUrl) => URL.revokeObjectURL(previewUrl))
  }, [previewUrls])

  if (!Object.values(ONBOARDING_RESULT_STATUS).includes(resultStatus)) {
    return <Navigate to="/onboarding/photos/select" replace />
  }

  if (resultStatus === ONBOARDING_RESULT_STATUS.ERROR) {
    return <GenericErrorResult onRetry={() => navigate('/onboarding/photos/select', { state: { photos } })} />
  }

  if (
    resultStatus === ONBOARDING_RESULT_STATUS.FACE_NOT_FOUND ||
    resultStatus === ONBOARDING_RESULT_STATUS.IDENTITY_MISMATCH
  ) {
    return (
      <ErrorResult
        result={resultStatus}
        previewUrls={previewUrls}
        onRetry={() => navigate('/onboarding/photos/select', { state: { photos } })}
      />
    )
  }

  if (!completion) {
    return <Navigate to="/onboarding/complete" replace state={location.state} />
  }

  return (
    <section className="photo-result photo-result--success">
      <div className="photo-result__success-content">
        <div className="photo-result__illustration"><SuccessIllustration /></div>
        <h1>이제 당신을<br />알아볼 수 있어요</h1>
        <p>세 장의 사진을 모두 확인했어요.<br />앞으로의 변화를 함께 기록해 볼게요.</p>
      </div>

      <div className="photo-result__actions">
        <ActionButton fullWidth onClick={() => navigate('/')}>사진 남기러 가기</ActionButton>
      </div>
    </section>
  )
}

export default OnboardingCompletePage
