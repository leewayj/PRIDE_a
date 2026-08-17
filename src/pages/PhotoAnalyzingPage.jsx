import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import usePhotoSelection from '../hooks/usePhotoSelection.js'
import { getPhotoTakenAt } from '../utils/photoDate.js'

const nextFrame = () => new Promise((resolve) => requestAnimationFrame(resolve))

function PhotoAnalyzingPage() {
  const navigate = useNavigate()
  const startedRef = useRef(false)
  const { selectedPhotos, selectedPhotoCount, saveAnalysisResults } = usePhotoSelection()
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

    const analyzePhotos = async () => {
      const results = []

      setStatus('사진 정보를 불러오는 중이에요')
      await nextFrame()

      for (let index = 0; index < selectedPhotos.length; index += 1) {
        const { file } = selectedPhotos[index]

        setStatus('촬영 날짜를 확인하고 있어요')
        const takenAt = await getPhotoTakenAt(file).catch(() => null)

        results.push({ file, takenAt })
        setCompletedCount(index + 1)
        await nextFrame()
      }

      setStatus('연도별로 정리하고 있어요')
      await nextFrame()
      await nextFrame()
      saveAnalysisResults(results)
      setStatus('분석이 완료되었습니다')
      await nextFrame()
      await nextFrame()
      navigate('/photos/years', { replace: true })
    }

    analyzePhotos()
  }, [navigate, saveAnalysisResults, selectedPhotoCount, selectedPhotos])

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
