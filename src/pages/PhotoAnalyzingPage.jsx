import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { extractIndicatorsBatch } from '../api/indicatorApi.js'
import ActionButton from '../components/ui/ActionButton.jsx'
import { validateIndicatorExtraction } from '../domain/indicatorExtraction.js'
import usePhotoSelection from '../hooks/usePhotoSelection.js'
import { analyzePhotos } from '../services/photoAnalysis.js'
import { getOrCreateUserId } from '../utils/userSession.js'

const EXTRACTION_BATCH_SIZE = 2

function splitIntoBatches(files) {
  const batches = []
  for (let index = 0; index < files.length; index += EXTRACTION_BATCH_SIZE) batches.push(files.slice(index, index + EXTRACTION_BATCH_SIZE))
  return batches
}

function waitForNextPaint() {
  return new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
}

function PhotoAnalyzingPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const startedRef = useRef(false)
  const isSubmittingRef = useRef(false)
  const isMountedRef = useRef(true)
  const { clearSelectedPhotos, photos, replaceSelectedPhotos, selectedFiles, selectedPhotoCount } = usePhotoSelection()
  const [analysisState, setAnalysisState] = useState('selected')
  const [attemptTotalCount, setAttemptTotalCount] = useState(selectedPhotoCount)
  const [processedCount, setProcessedCount] = useState(0)
  const [successCount, setSuccessCount] = useState(0)
  const [failedCount, setFailedCount] = useState(0)
  const [status, setStatus] = useState('선택한 사진을 확인하고 있어요')
  const [uploadIssues, setUploadIssues] = useState([])
  const progress = attemptTotalCount === 0 ? 0 : Math.round((processedCount / attemptTotalCount) * 100)

  const finishUpload = useCallback(() => {
    clearSelectedPhotos()
    navigate('/photos', { replace: true, state: { ...location.state, uploadCompleted: true, uploadIssues } })
  }, [clearSelectedPhotos, location.state, navigate, uploadIssues])

  const runAnalysis = useCallback(async () => {
    if (isSubmittingRef.current || selectedPhotoCount === 0) return
    const filesForAttempt = [...selectedFiles]
    isSubmittingRef.current = true
    setAttemptTotalCount(filesForAttempt.length)
    setAnalysisState('analyzing')
    setProcessedCount(0)
    setSuccessCount(0)
    setFailedCount(0)
    setUploadIssues([])

    try {
      setStatus('촬영 날짜와 파일 정보를 확인하고 있어요')
      await waitForNextPaint()
      await analyzePhotos(filesForAttempt, { existingPhotoIds: photos.map(({ id }) => id) })
      if (!isMountedRef.current) return

      setStatus('사진을 전송하고 지표를 분석하고 있어요')
      const userId = await getOrCreateUserId()
      const batches = splitIntoBatches(filesForAttempt)
      const settled = await Promise.allSettled(batches.map(async (batchFiles) => {
        try {
          const result = validateIndicatorExtraction(await extractIndicatorsBatch(userId, batchFiles))
          return { batchFiles, result }
        } finally {
          if (isMountedRef.current) setProcessedCount((count) => Math.min(filesForAttempt.length, count + batchFiles.length))
        }
      }))
      if (!isMountedRef.current) return

      const retryFiles = []
      const issues = []
      let succeeded = 0
      settled.forEach((outcome, batchIndex) => {
        const batchFiles = batches[batchIndex]
        if (outcome.status === 'rejected') {
          retryFiles.push(...batchFiles)
          issues.push(...batchFiles.map(({ name }) => ({ filename: name, reason: '서버에서 이 사진 묶음을 처리하지 못했어요.' })))
          return
        }

        const { result } = outcome.value
        succeeded += result.succeeded_count
        issues.push(...result.issues)
        const issueNames = new Set(result.issues.map(({ filename }) => filename))
        const unresolvedCount = result.skipped_count + result.failed_count
        const identifiedRetryFiles = batchFiles.filter(({ name }) => issueNames.has(name))
        retryFiles.push(...(identifiedRetryFiles.length >= unresolvedCount ? identifiedRetryFiles : batchFiles))
      })

      const failed = filesForAttempt.length - succeeded
      setSuccessCount(succeeded)
      setFailedCount(failed)
      setUploadIssues(issues)

      if (succeeded === filesForAttempt.length) {
        setAnalysisState('success')
        clearSelectedPhotos()
        navigate('/photos', { replace: true, state: { ...location.state, uploadCompleted: true, uploadIssues: issues } })
      } else if (succeeded > 0) {
        replaceSelectedPhotos(retryFiles)
        setAnalysisState('partial-success')
        setStatus(`${succeeded}장은 저장했고 ${failed}장은 다시 시도할 수 있어요.`)
      } else {
        setAnalysisState('error')
        setStatus('선택한 사진의 분석 요청이 모두 실패했어요.')
      }
    } catch (error) {
      console.error('사진 지표 추출 및 저장에 실패했습니다.', error)
      if (isMountedRef.current) {
        setFailedCount(filesForAttempt.length)
        setAnalysisState('error')
        setStatus('선택한 사진의 분석 요청이 모두 실패했어요.')
      }
    } finally {
      isSubmittingRef.current = false
    }
  }, [clearSelectedPhotos, location.state, navigate, photos, replaceSelectedPhotos, selectedFiles, selectedPhotoCount])

  useEffect(() => {
    isMountedRef.current = true
    if (selectedPhotoCount === 0 && analysisState !== 'success') {
      navigate('/photos/years', { replace: true, state: location.state })
      return undefined
    }
    if (!startedRef.current) { startedRef.current = true; queueMicrotask(runAnalysis) }
    return () => { isMountedRef.current = false }
  }, [analysisState, location.state, navigate, runAnalysis, selectedPhotoCount])

  const isAnalyzing = analysisState === 'analyzing'
  const hasFailure = analysisState === 'error' || analysisState === 'partial-success'

  return (
    <section className="photo-analyzing-page" aria-live="polite">
      <div className="photo-analyzing-page__content">
        {isAnalyzing && <div className="photo-analyzing-page__spinner" aria-hidden="true" />}
        <h1>{analysisState === 'partial-success' ? '일부 사진을 저장했어요' : analysisState === 'error' ? '사진 분석 요청이 실패했어요' : '사진을 분석하고 있어요'}</h1>
        <p className="photo-analyzing-page__description">{hasFailure ? '사진 선택은 정상적으로 유지되었습니다. 실패한 사진만 다시 분석할 수 있어요.' : '선택한 사진을 묶음별로 분석해 저장하고 있습니다.'}</p>
        <div className="photo-analyzing-page__progress-summary"><span>전체 {attemptTotalCount}장</span><span>처리 완료 {processedCount}장</span></div>
        <div className="photo-analyzing-page__progress" role="progressbar" aria-label="사진 분석 요청 진행률" aria-valuemin="0" aria-valuemax="100" aria-valuenow={progress}><span style={{ width: `${progress}%` }} /></div>
        <strong className="photo-analyzing-page__percentage">{progress}%</strong>
        {(analysisState === 'partial-success' || analysisState === 'error') && <div className="photo-analyzing-page__result-counts"><span>성공 {successCount}장</span><span>실패 {failedCount}장</span></div>}
        <p className="photo-analyzing-page__status">{status}</p>
        {hasFailure ? (
          <div className="photo-analyzing-page__actions"><ActionButton fullWidth onClick={runAnalysis}>실패한 사진 다시 시도</ActionButton>{analysisState === 'partial-success' && <ActionButton fullWidth variant="outline" onClick={finishUpload}>저장된 사진 확인하기</ActionButton>}<ActionButton fullWidth variant="outline" onClick={() => navigate('/photos/years', { state: location.state })}>사진 선택으로 돌아가기</ActionButton></div>
        ) : (
          <ol className="photo-analyzing-page__steps"><li className={processedCount > 0 ? 'is-complete' : 'is-active'}><span />파일 확인</li><li className={progress >= 35 ? 'is-complete' : ''}><span />사진 전송</li><li className={progress >= 65 ? 'is-complete' : ''}><span />지표 추출</li><li className={progress === 100 ? 'is-complete' : ''}><span />원본 저장</li></ol>
        )}
      </div>
    </section>
  )
}

export default PhotoAnalyzingPage
