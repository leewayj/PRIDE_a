import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import usePhotoSelection from '../hooks/usePhotoSelection.js'
import { analyzePhotos } from '../services/photoAnalysis.js'

const MINIMUM_DISPLAY_TIME = 1000

function waitForNextPaint() {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(resolve)
    })
  })
}

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

function PhotoAnalyzingPage() {
  const navigate = useNavigate()
  const startedRef = useRef(false)
  const { photos, selectedFiles, selectedPhotoCount, saveAnalysisResults } = usePhotoSelection()
  const [completedCount, setCompletedCount] = useState(0)
  const [status, setStatus] = useState('사진 정보를 불러오는 중이에요')
  const progress = selectedPhotoCount === 0
    ? 0
    : Math.round((completedCount / selectedPhotoCount) * 100)

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true

    if (selectedPhotoCount === 0) {
      navigate('/photos/years', { replace: true })
      return
    }

    const runAnalysis = async () => {
      const displayStartedAt = performance.now()

      setStatus('사진 정보를 불러오는 중이에요')
      await waitForNextPaint()

      setStatus('촬영 날짜를 확인하고 있어요')
      const result = await analyzePhotos(selectedFiles, {
        existingPhotoIds: photos.map(({ id }) => id),
        onProgress: async ({ completed }) => {
          setCompletedCount(completed)
          await waitForNextPaint()
        },
      })

      setStatus('연도별로 정리하고 있어요')
      await waitForNextPaint()
      saveAnalysisResults([...result.successfulPhotos, ...result.failedPhotos])
      setStatus('분석이 완료되었습니다')
      await waitForNextPaint()

      const elapsedTime = performance.now() - displayStartedAt
      const remainingTime = Math.max(0, MINIMUM_DISPLAY_TIME - elapsedTime)

      if (remainingTime > 0) await wait(remainingTime)

      navigate('/photos/years', { replace: true })
    }

    runAnalysis()
  }, [navigate, photos, saveAnalysisResults, selectedFiles, selectedPhotoCount])

  return (
    <section className="photo-analyzing-page" aria-live="polite">
      <div className="photo-analyzing-page__content">
        <div className="photo-analyzing-page__spinner" aria-hidden="true" />
        <h1>사진을 분석하고 있어요</h1>
        <p className="photo-analyzing-page__description">
          촬영 날짜를 확인하고 연도별로 정리하고 있습니다.
        </p>

        <div className="photo-analyzing-page__progress-summary">
          <span>전체 {selectedPhotoCount}장</span>
          <span>분석 완료 {completedCount}장</span>
        </div>
        <div
          className="photo-analyzing-page__progress"
          role="progressbar"
          aria-label="사진 분석 진행률"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow={progress}
        >
          <span style={{ width: `${progress}%` }} />
        </div>
        <strong className="photo-analyzing-page__percentage">{progress}%</strong>
        <p className="photo-analyzing-page__status">{status}</p>
      </div>
    </section>
  )
}

export default PhotoAnalyzingPage
