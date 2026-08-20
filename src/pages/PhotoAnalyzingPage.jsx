import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { extractIndicatorsBatch } from '../api/indicatorApi.js'
import ActionButton from '../components/ui/ActionButton.jsx'
import { isMissingExifResult, isSinglePhotoExtractionSuccess, validateIndicatorExtraction } from '../domain/indicatorExtraction.js'
import usePhotoSelection from '../hooks/usePhotoSelection.js'
import { analyzePhotos, createPhotoId } from '../services/photoAnalysis.js'
import { getOrCreateUserId } from '../utils/userSession.js'

const EXTRACTION_BATCH_SIZE = 2
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

function splitIntoBatches(files) {
  const batches = []
  for (let index = 0; index < files.length; index += EXTRACTION_BATCH_SIZE) batches.push(files.slice(index, index + EXTRACTION_BATCH_SIZE))
  return batches
}

function matchFilesToResults(files, results) {
  const availableFiles = new Map()
  files.forEach((file) => {
    const matches = availableFiles.get(file.name) ?? []
    matches.push(file)
    availableFiles.set(file.name, matches)
  })
  return results.map((result) => ({ result, file: availableFiles.get(result.filename)?.shift() ?? null }))
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
  const [needsDatePhotos, setNeedsDatePhotos] = useState([])
  const [skippedCount, setSkippedCount] = useState(0)
  const [failedCount, setFailedCount] = useState(0)
  const [failedFiles, setFailedFiles] = useState([])
  const [status, setStatus] = useState('선택한 사진을 확인하고 있어요')
  const [uploadIssues, setUploadIssues] = useState([])
  const progress = attemptTotalCount === 0 ? 0 : Math.round((processedCount / attemptTotalCount) * 100)
  const isAnalyzing = analysisState === 'analyzing'
  const isDateRetrying = analysisState === 'date-retrying'
  const hasFailure = analysisState === 'error' || analysisState === 'partial-success'
  const showsDateForm = needsDatePhotos.length > 0 && (analysisState === 'needs-date' || analysisState === 'partial-success')

  const goToStoredPhotos = useCallback((issues = uploadIssues) => {
    clearSelectedPhotos()
    navigate('/photos', { replace: true, state: { ...location.state, uploadCompleted: true, uploadIssues: issues } })
  }, [clearSelectedPhotos, location.state, navigate, uploadIssues])

  const runAnalysis = useCallback(async (filesOverride) => {
    const filesForAttempt = Array.isArray(filesOverride) ? [...filesOverride] : [...selectedFiles]
    if (isSubmittingRef.current || filesForAttempt.length === 0) return

    isSubmittingRef.current = true
    setAttemptTotalCount(filesForAttempt.length)
    setAnalysisState('analyzing')
    setProcessedCount(0)
    setSuccessCount(0)
    setNeedsDatePhotos([])
    setSkippedCount(0)
    setFailedCount(0)
    setFailedFiles([])
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
          return validateIndicatorExtraction(await extractIndicatorsBatch(userId, batchFiles))
        } finally {
          if (isMountedRef.current) setProcessedCount((count) => Math.min(filesForAttempt.length, count + batchFiles.length))
        }
      }))
      if (!isMountedRef.current) return

      const missingDate = []
      const processingFailures = []
      const issues = []
      let succeeded = 0
      let skipped = 0
      let failed = 0

      settled.forEach((outcome, batchIndex) => {
        const batchFiles = batches[batchIndex]
        if (outcome.status === 'rejected') {
          failed += batchFiles.length
          processingFailures.push(...batchFiles)
          issues.push(...batchFiles.map(({ name }) => ({ filename: name, status: 'request_failed', reason: '서버에서 이 사진 묶음을 처리하지 못했어요.' })))
          return
        }

        const result = outcome.value
        succeeded += result.succeeded_count
        failed += result.failed_count
        issues.push(...result.issues)
        let missingInBatch = 0
        matchFilesToResults(batchFiles, result.results).forEach(({ file, result: photoResult }) => {
          if (isMissingExifResult(photoResult) && file) {
            missingInBatch += 1
            missingDate.push({ file, key: createPhotoId(file), filename: photoResult.filename, reason: photoResult.reason, capturedAt: '', retryError: '' })
          } else if ((photoResult.status === 'failed' || photoResult.status === 'skipped') && file) {
            processingFailures.push(file)
          }
        })
        skipped += Math.max(0, result.skipped_count - missingInBatch)
      })

      const unresolvedFiles = [...missingDate.map(({ file }) => file), ...processingFailures]
      setSuccessCount(succeeded)
      setNeedsDatePhotos(missingDate)
      setSkippedCount(skipped)
      setFailedCount(failed)
      setFailedFiles(processingFailures)
      setUploadIssues(issues)
      replaceSelectedPhotos(unresolvedFiles)

      if (unresolvedFiles.length === 0 && skipped === 0 && failed === 0) {
        setAnalysisState('success')
        goToStoredPhotos(issues)
      } else if (missingDate.length > 0 && succeeded === 0 && skipped === 0 && failed === 0) {
        setAnalysisState('needs-date')
        setStatus(`${missingDate.length}장의 촬영 날짜를 확인할 수 없어요.`)
      } else if (succeeded > 0 || missingDate.length > 0) {
        setAnalysisState('partial-success')
        setStatus('날짜가 필요한 사진과 처리하지 못한 사진을 확인해 주세요.')
      } else {
        setAnalysisState('error')
        setStatus('사진 분석 요청에 실패했어요.')
      }
    } catch (error) {
      console.error('사진 지표 추출 및 저장에 실패했습니다.', error)
      if (isMountedRef.current) {
        setFailedCount(filesForAttempt.length)
        setFailedFiles(filesForAttempt)
        setProcessedCount(filesForAttempt.length)
        setAnalysisState('error')
        setStatus('사진 분석 요청에 실패했어요.')
      }
    } finally {
      isSubmittingRef.current = false
    }
  }, [goToStoredPhotos, photos, replaceSelectedPhotos, selectedFiles])

  const updateCapturedAt = (key, capturedAt) => {
    setNeedsDatePhotos((current) => current.map((photo) => photo.key === key ? { ...photo, capturedAt, retryError: '' } : photo))
  }

  const retryWithDates = async () => {
    if (isSubmittingRef.current || needsDatePhotos.length === 0 || needsDatePhotos.some(({ capturedAt }) => !DATE_PATTERN.test(capturedAt))) return

    isSubmittingRef.current = true
    setAnalysisState('date-retrying')
    setStatus('입력한 촬영 날짜로 다시 분석하고 있어요.')

    try {
      const userId = await getOrCreateUserId()
      const settled = await Promise.allSettled(needsDatePhotos.map(async (photo) => ({
        photo,
        result: validateIndicatorExtraction(await extractIndicatorsBatch(userId, [photo.file], photo.capturedAt)),
      })))
      if (!isMountedRef.current) return

      const stillRetryable = []
      const newFailures = [...failedFiles]
      const newIssues = [...uploadIssues]
      let newlySucceeded = 0
      let newlySkipped = 0
      let newlyFailed = 0

      settled.forEach((outcome, index) => {
        const photo = needsDatePhotos[index]
        if (outcome.status === 'rejected') {
          stillRetryable.push({ ...photo, retryError: '요청에 실패했어요. 입력한 날짜로 다시 시도할 수 있어요.' })
          return
        }

        const { result } = outcome.value
        newIssues.push(...result.issues)
        if (isSinglePhotoExtractionSuccess(result)) {
          newlySucceeded += 1
        } else {
          newlySkipped += result.skipped_count
          newlyFailed += result.failed_count
          newFailures.push(photo.file)
        }
      })

      const remainingFiles = [...stillRetryable.map(({ file }) => file), ...newFailures]
      const totalSucceeded = successCount + newlySucceeded
      const totalSkipped = skippedCount + newlySkipped
      const totalFailed = failedCount + newlyFailed
      setSuccessCount(totalSucceeded)
      setNeedsDatePhotos(stillRetryable)
      setSkippedCount(totalSkipped)
      setFailedCount(totalFailed)
      setFailedFiles(newFailures)
      setUploadIssues(newIssues)
      replaceSelectedPhotos(remainingFiles)

      if (remainingFiles.length === 0 && totalSkipped === 0 && totalFailed === 0) {
        setAnalysisState('success')
        goToStoredPhotos(newIssues)
      } else {
        setAnalysisState(totalSucceeded > 0 || stillRetryable.length > 0 ? 'partial-success' : 'error')
        setStatus(stillRetryable.length > 0 ? '일부 요청이 실패했어요. 입력한 날짜로 다시 시도할 수 있어요.' : '날짜 재분석 결과를 확인해 주세요.')
      }
    } finally {
      isSubmittingRef.current = false
    }
  }

  useEffect(() => {
    isMountedRef.current = true
    if (selectedPhotoCount === 0 && analysisState !== 'success') {
      navigate('/photos/years', { replace: true, state: location.state })
      return undefined
    }
    if (!startedRef.current) {
      startedRef.current = true
      queueMicrotask(() => runAnalysis())
    }
    return () => { isMountedRef.current = false }
  }, [analysisState, location.state, navigate, runAnalysis, selectedPhotoCount])

  return (
    <section className="photo-analyzing-page" aria-live="polite">
      <div className="photo-analyzing-page__content">
        {(isAnalyzing || isDateRetrying) && <div className="photo-analyzing-page__spinner" aria-hidden="true" />}
        <h1>{showsDateForm ? '촬영 날짜를 확인할 수 없는 사진이 있어요' : analysisState === 'error' ? '사진 분석 요청에 실패했어요' : analysisState === 'partial-success' ? '일부 사진을 처리했어요' : '사진을 분석하고 있어요'}</h1>
        <p className="photo-analyzing-page__description">{showsDateForm ? '사진마다 촬영 날짜를 선택하면 계속 분석할 수 있어요.' : hasFailure ? '선택한 사진은 그대로 유지됩니다.' : '선택한 사진을 분석해 저장하고 있습니다.'}</p>
        <div className="photo-analyzing-page__progress-summary"><span>전체 {attemptTotalCount}장</span><span>처리 완료 {processedCount}장</span></div>
        <div className="photo-analyzing-page__progress" role="progressbar" aria-label="사진 분석 요청 진행률" aria-valuemin="0" aria-valuemax="100" aria-valuenow={progress}><span style={{ width: `${progress}%` }} /></div>
        <strong className="photo-analyzing-page__percentage">{progress}%</strong>
        {!isAnalyzing && <div className="photo-analyzing-page__result-counts"><span>성공 {successCount}장</span><span>촬영 날짜 필요 {needsDatePhotos.length}장</span><span>스킵 {skippedCount}장</span><span>실패 {failedCount}장</span></div>}
        <p className="photo-analyzing-page__status">{status}</p>

        {showsDateForm && <div className="photo-analyzing-page__date-list">{needsDatePhotos.map((photo) => <label key={photo.key}><strong>{photo.filename}</strong><span>촬영 날짜</span><input type="date" value={photo.capturedAt} disabled={isDateRetrying} onChange={(event) => updateCapturedAt(photo.key, event.target.value)} />{photo.retryError && <small role="alert">{photo.retryError}</small>}</label>)}</div>}

        {(showsDateForm || hasFailure) && <div className="photo-analyzing-page__actions">
          {showsDateForm && <ActionButton fullWidth disabled={isDateRetrying || needsDatePhotos.some(({ capturedAt }) => !DATE_PATTERN.test(capturedAt))} onClick={retryWithDates}>{isDateRetrying ? '다시 분석 중...' : '날짜 입력 후 다시 분석'}</ActionButton>}
          {failedFiles.length > 0 && !isDateRetrying && <ActionButton fullWidth onClick={() => runAnalysis(failedFiles)}>처리 실패 사진 다시 시도</ActionButton>}
          {successCount > 0 && <ActionButton fullWidth variant="outline" onClick={() => goToStoredPhotos()}>저장된 사진 확인하기</ActionButton>}
          <ActionButton fullWidth variant="outline" disabled={isDateRetrying} onClick={() => navigate('/photos/years', { state: location.state })}>사진 선택으로 돌아가기</ActionButton>
        </div>}
      </div>
    </section>
  )
}

export default PhotoAnalyzingPage
