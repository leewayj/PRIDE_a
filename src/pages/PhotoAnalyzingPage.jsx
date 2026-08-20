import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { extractIndicatorsBatch } from '../api/indicatorApi.js'
import ActionButton from '../components/ui/ActionButton.jsx'
import { validateIndicatorExtraction } from '../domain/indicatorExtraction.js'
import usePhotoSelection from '../hooks/usePhotoSelection.js'
import { analyzePhotos } from '../services/photoAnalysis.js'
import { getOrCreateUserId } from '../utils/userSession.js'

function waitForNextPaint() {
  return new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(resolve))
  })
}

function PhotoAnalyzingPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const startedRef = useRef(false)
  const isSubmittingRef = useRef(false)
  const isMountedRef = useRef(true)
  const { clearSelectedPhotos, photos, selectedFiles, selectedPhotoCount } = usePhotoSelection()
  const [completedCount, setCompletedCount] = useState(0)
  const [status, setStatus] = useState('사진 정보를 불러오는 중이에요')
  const [hasError, setHasError] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const progress = selectedPhotoCount === 0 ? 0 : Math.round((completedCount / selectedPhotoCount) * 100)

  const runAnalysis = useCallback(async () => {
    if (isSubmittingRef.current || selectedPhotoCount === 0) return
    isSubmittingRef.current = true
    setIsSubmitting(true)
    setHasError(false)
    setCompletedCount(0)

    try {
      setStatus('촬영 날짜를 확인하고 있어요')
      await waitForNextPaint()
      await analyzePhotos(selectedFiles, {
        existingPhotoIds: photos.map(({ id }) => id),
        onProgress: async ({ completed }) => {
          if (isMountedRef.current) setCompletedCount(completed)
          await waitForNextPaint()
        },
      })

      if (!isMountedRef.current) return
      setStatus('사진을 안전하게 전송하고 지표를 분석하고 있어요')
      const userId = await getOrCreateUserId()
      const extractionResponse = await extractIndicatorsBatch(userId, selectedFiles)
      const extractionResult = validateIndicatorExtraction(extractionResponse)
      if (!isMountedRef.current) return

      clearSelectedPhotos()
      navigate('/photos', { replace: true, state: { ...location.state, uploadCompleted: true, uploadIssues: extractionResult.issues } })
    } catch (error) {
      console.error('사진 지표 추출 및 저장에 실패했습니다.', error)
      if (isMountedRef.current) {
        setHasError(true)
        setStatus('사진을 분석하지 못했어요')
      }
    } finally {
      isSubmittingRef.current = false
      if (isMountedRef.current) setIsSubmitting(false)
    }
  }, [clearSelectedPhotos, location.state, navigate, photos, selectedFiles, selectedPhotoCount])

  useEffect(() => {
    isMountedRef.current = true
    if (selectedPhotoCount === 0) {
      navigate('/photos/years', { replace: true, state: location.state })
      return undefined
    }
    if (!startedRef.current) {
      startedRef.current = true
      queueMicrotask(runAnalysis)
    }
    return () => { isMountedRef.current = false }
  }, [location.state, navigate, runAnalysis, selectedPhotoCount])

  return (
    <section className="photo-analyzing-page" aria-live="polite">
      <div className="photo-analyzing-page__content">
        {!hasError && <div className="photo-analyzing-page__spinner" aria-hidden="true" />}
        <h1>{hasError ? '사진을 분석하지 못했어요' : '사진을 분석하고 있어요'}</h1>
        <p className="photo-analyzing-page__description">{hasError ? '선택한 사진은 그대로 유지됩니다. 잠시 후 다시 시도해 주세요.' : '촬영 날짜를 확인하고 지표를 추출해 저장하고 있습니다.'}</p>
        <div className="photo-analyzing-page__progress-summary"><span>전체 {selectedPhotoCount}장</span><span>확인 완료 {completedCount}장</span></div>
        <div className="photo-analyzing-page__progress" role="progressbar" aria-label="사진 분석 진행률" aria-valuemin="0" aria-valuemax="100" aria-valuenow={progress}><span style={{ width: `${progress}%` }} /></div>
        <strong className="photo-analyzing-page__percentage">{progress}%</strong>
        <p className="photo-analyzing-page__status">{status}</p>
        {hasError ? (
          <div className="photo-analyzing-page__actions"><ActionButton fullWidth disabled={isSubmitting} onClick={runAnalysis}>{isSubmitting ? '다시 분석 중...' : '다시 시도'}</ActionButton><ActionButton fullWidth variant="outline" disabled={isSubmitting} onClick={() => navigate('/photos/years', { state: location.state })}>사진 선택으로 돌아가기</ActionButton></div>
        ) : (
          <ol className="photo-analyzing-page__steps"><li className={completedCount > 0 ? 'is-complete' : 'is-active'}><span />촬영일 읽기</li><li className={progress >= 35 ? 'is-complete' : ''}><span />파일 확인</li><li className={progress >= 65 ? 'is-complete' : ''}><span />지표 추출</li><li className={progress === 100 ? 'is-complete' : ''}><span />원본 저장</li></ol>
        )}
      </div>
    </section>
  )
}

export default PhotoAnalyzingPage
