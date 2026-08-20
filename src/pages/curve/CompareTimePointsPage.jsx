import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { comparePhotos, getPhotos } from '../../api/photoApi.js'
import BottomNavigation from '../../components/navigation/BottomNavigation.jsx'
import ActionButton from '../../components/ui/ActionButton.jsx'
import BaseCard from '../../components/ui/BaseCard.jsx'
import { validatePhotoComparison } from '../../domain/photoComparison.js'
import { INDICATOR_OPTIONS } from '../../domain/indicatorCurve.js'
import { getOrCreateUserId } from '../../utils/userSession.js'
import '../../styles/photo-compare.css'

const INDICATOR_META = new Map(INDICATOR_OPTIONS.map(({ indicator, label }) => [indicator, {
  label,
  unit: indicator.endsWith('_deg') ? '°' : '',
}]))

function CompareTimePointsPage() {
  const navigate = useNavigate()
  const [storedPhotoCount, setStoredPhotoCount] = useState(0)
  const [arePhotosLoading, setArePhotosLoading] = useState(true)
  const [hasPhotosError, setHasPhotosError] = useState(false)
  const [date1, setDate1] = useState('')
  const [date2, setDate2] = useState('')
  const [validationMessage, setValidationMessage] = useState('')
  const [comparison, setComparison] = useState(null)
  const [isComparing, setIsComparing] = useState(false)
  const [hasCompareError, setHasCompareError] = useState(false)
  const photoRequestIdRef = useRef(0)
  const compareRequestIdRef = useRef(0)
  const isComparingRef = useRef(false)

  const loadPhotos = useCallback(async () => {
    const requestId = photoRequestIdRef.current + 1
    photoRequestIdRef.current = requestId
    setArePhotosLoading(true)
    setHasPhotosError(false)
    try {
      const userId = await getOrCreateUserId()
      const result = await getPhotos(userId)
      if (!Array.isArray(result)) throw new Error('photos response must be an array')
      if (photoRequestIdRef.current === requestId) setStoredPhotoCount(result.length)
    } catch (error) {
      console.error('저장된 사진 목록을 불러오지 못했습니다.', error)
      if (photoRequestIdRef.current === requestId) setHasPhotosError(true)
    } finally {
      if (photoRequestIdRef.current === requestId) setArePhotosLoading(false)
    }
  }, [])

  const runComparison = useCallback(async () => {
    if (isComparingRef.current) return
    if (!date1 || !date2) { setValidationMessage('비교할 두 날짜를 모두 선택해 주세요.'); return }
    if (date1 === date2) { setValidationMessage('서로 다른 날짜를 선택해 주세요.'); return }

    isComparingRef.current = true
    const requestId = compareRequestIdRef.current + 1
    compareRequestIdRef.current = requestId
    setValidationMessage('')
    setComparison(null)
    setHasCompareError(false)
    setIsComparing(true)
    try {
      const userId = await getOrCreateUserId()
      const result = validatePhotoComparison(await comparePhotos(userId, date1, date2))
      if (compareRequestIdRef.current === requestId) setComparison(result)
    } catch (error) {
      console.error('두 시점 사진을 비교하지 못했습니다.', error)
      if (compareRequestIdRef.current === requestId) setHasCompareError(true)
    } finally {
      if (compareRequestIdRef.current === requestId) {
        isComparingRef.current = false
        setIsComparing(false)
      }
    }
  }, [date1, date2])

  useEffect(() => {
    let isActive = true
    queueMicrotask(() => { if (isActive) loadPhotos() })
    return () => { isActive = false; photoRequestIdRef.current += 1; compareRequestIdRef.current += 1; isComparingRef.current = false }
  }, [loadPhotos])

  const changeDate = (setter) => (event) => {
    setter(event.target.value)
    compareRequestIdRef.current += 1
    isComparingRef.current = false
    setComparison(null)
    setHasCompareError(false)
    setValidationMessage('')
    setIsComparing(false)
  }

  return (
    <main className="app-shell photo-compare-page">
      <header className="photo-compare-page__header"><button type="button" onClick={() => navigate(-1)} aria-label="이전 화면으로 돌아가기"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 5-7 7 7 7" /></svg></button><span>두 사진 비교</span></header>
      {arePhotosLoading ? (
        <BaseCard className="photo-compare-page__empty" aria-live="polite">저장된 사진을 불러오고 있어요.</BaseCard>
      ) : hasPhotosError ? (
        <BaseCard className="photo-compare-page__empty" role="alert"><strong>저장된 사진을 불러오지 못했어요.</strong><p>잠시 후 다시 시도해 주세요.</p><ActionButton onClick={loadPhotos}>다시 시도</ActionButton></BaseCard>
      ) : storedPhotoCount < 2 ? (
        <BaseCard className="photo-compare-page__empty"><strong>두 사진을 비교하려면<br />저장된 사진이 2장 이상 필요해요.</strong><p>{storedPhotoCount === 0 ? '아직 서버에 저장된 사진이 없어요.' : '사진을 한 장 더 추가해 주세요.'}</p><ActionButton onClick={() => navigate('/photos/upload')}>사진 추가하기</ActionButton></BaseCard>
      ) : (
        <>
          <section className="photo-compare-page__intro"><span>시점 비교</span><h1>두 시점의 얼굴 사진을<br />나란히 확인해 보세요</h1><p>선택한 순서 그대로 서버의 저장 사진과 지표 차이를 조회합니다.</p></section>
          <BaseCard className="photo-compare-page__date-form"><label><span>사진 A 날짜</span><input type="date" value={date1} onChange={changeDate(setDate1)} /></label><label><span>사진 B 날짜</span><input type="date" value={date2} onChange={changeDate(setDate2)} /></label>{validationMessage && <p role="alert">{validationMessage}</p>}<ActionButton fullWidth disabled={isComparing || !date1 || !date2} onClick={runComparison}>{isComparing ? '두 시점을 비교하고 있어요.' : '비교하기'}</ActionButton></BaseCard>
          {hasCompareError ? (
            <BaseCard className="photo-compare-page__empty" role="alert"><strong>사진을 비교하지 못했어요.</strong><p>잠시 후 다시 시도해 주세요.</p><ActionButton onClick={runComparison}>다시 시도</ActionButton></BaseCard>
          ) : comparison?.isEmpty ? (
            <BaseCard className="photo-compare-page__empty"><strong>선택한 날짜에 비교할 사진이 없어요.</strong><p>서버에 저장된 다른 촬영 날짜를 선택해 주세요.</p></BaseCard>
          ) : comparison ? (
            <>
              <section className="photo-compare-page__photos" aria-label="비교한 두 사진"><ComparisonPhoto label="사진 A" date={date1} photo={comparison.date1Photo} /><span className="photo-compare-page__versus" aria-hidden="true">VS</span><ComparisonPhoto label="사진 B" date={date2} photo={comparison.date2Photo} /></section>
              <BaseCard className="photo-compare-page__metrics"><span>지표 비교</span>{comparison.differences.length > 0 ? <ul>{comparison.differences.map(({ indicator, value }) => { const meta = INDICATOR_META.get(indicator) ?? { label: indicator, unit: '' }; return <li key={indicator}><strong>{meta.label}</strong><small>차이 {value > 0 ? '+' : ''}{value.toFixed(1)}{meta.unit}</small></li> })}</ul> : <div className="photo-compare-page__metrics-empty"><h2>표시할 지표 차이가 없어요.</h2></div>}</BaseCard>
              <aside className="photo-compare-page__notice">값의 차이만 표시하며 변화의 좋고 나쁨을 판단하지 않아요.</aside>
            </>
          ) : null}
        </>
      )}
      <BottomNavigation />
    </main>
  )
}

function ComparisonPhoto({ label, date, photo }) {
  return <BaseCard className="photo-compare-page__photo-card"><span>{label}</span><time dateTime={date}>{date}</time><div className="photo-compare-page__image"><div className="photo-timeline__preview-fallback" role="img" aria-label={`${date} 저장 사진`}><svg viewBox="0 0 64 64" aria-hidden="true"><rect x="10" y="13" width="44" height="38" rx="5" /><circle cx="25" cy="27" r="5" /><path d="m14 45 11-11 8 8 6-6 11 9" /></svg><span>{photo == null ? '사진 없음' : '저장 사진 확인됨'}</span></div></div></BaseCard>
}

export default CompareTimePointsPage
