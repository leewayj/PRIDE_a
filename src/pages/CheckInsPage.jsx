import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCheckinStatus } from '../api/checkinApi.js'
import BottomNavigation from '../components/navigation/BottomNavigation.jsx'
import ActionButton from '../components/ui/ActionButton.jsx'
import BaseCard from '../components/ui/BaseCard.jsx'
import { formatPhotoDate } from '../utils/dateFormat.js'
import { getOrCreateUserId } from '../utils/userSession.js'
import '../styles/checkin.css'

function validateStatus(status) {
  if (!status || typeof status !== 'object' || typeof status.hasMarker !== 'boolean') throw new Error('checkin status has an invalid shape')
  if (!status.hasMarker) return status
  if (typeof status.markerId !== 'string' || typeof status.markerDate !== 'string' || !Number.isInteger(status.daysSince) || !Number.isInteger(status.daysRemaining) || typeof status.isCheckinTime !== 'boolean') throw new Error('checkin marker status has an invalid shape')
  return status
}

function CheckInsPage() {
  const navigate = useNavigate()
  const [status, setStatus] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const requestIdRef = useRef(0)
  const isRequestingRef = useRef(false)

  const loadStatus = useCallback(async () => {
    if (isRequestingRef.current) return
    isRequestingRef.current = true
    const requestId = requestIdRef.current + 1
    requestIdRef.current = requestId
    setIsLoading(true)
    setHasError(false)
    try {
      const userId = await getOrCreateUserId()
      const result = validateStatus(await getCheckinStatus(userId))
      if (requestIdRef.current === requestId) setStatus(result)
    } catch (error) {
      console.error('체크인 상태를 불러오지 못했습니다.', error)
      if (requestIdRef.current === requestId) setHasError(true)
    } finally {
      if (requestIdRef.current === requestId) { isRequestingRef.current = false; setIsLoading(false) }
    }
  }, [])

  useEffect(() => {
    let isActive = true
    queueMicrotask(() => { if (isActive) loadStatus() })
    return () => { isActive = false; requestIdRef.current += 1; isRequestingRef.current = false }
  }, [loadStatus])

  return (
    <main className="app-shell check-ins-page">
      <header className="check-ins-page__header"><span>CHECK-IN</span><h1>관리 이후의 변화를<br />차근차근 확인해요.</h1><p>가장 최근 관리 기록을 기준으로 서버가 계산한 체크인 시점을 확인합니다.</p></header>
      {isLoading ? (
        <div className="check-ins-page__state" aria-live="polite">체크인 상태를 불러오고 있어요.</div>
      ) : hasError || !status ? (
        <BaseCard className="check-ins-page__state" role="alert"><strong>체크인 상태를 불러오지 못했어요.</strong><p>잠시 후 다시 시도해 주세요.</p><ActionButton onClick={loadStatus}>다시 시도</ActionButton></BaseCard>
      ) : !status.hasMarker ? (
        <BaseCard className="check-ins-page__state"><strong>아직 체크인 기준이 되는 관리 기록이 없어요.</strong><p>관리 기록을 추가하면 체크인 시점을 확인할 수 있어요.</p><ActionButton onClick={() => navigate('/changes')}>관리 기록 추가하기</ActionButton></BaseCard>
      ) : (
        <>
          <BaseCard className="check-ins-page__basis"><span>최근 관리 기록</span><strong>{formatPhotoDate(status.markerDate)}</strong><time dateTime={status.markerDate}>{status.markerId}</time></BaseCard>
          <BaseCard className="check-ins-page__next"><span>{status.isCheckinTime ? '체크인 가능' : '다음 체크인까지'}</span><div><strong>{status.isCheckinTime ? '지금 변화를 확인할 수 있어요.' : `${status.daysRemaining}일 남았어요.`}</strong><time dateTime={status.markerDate}>관리 후 {status.daysSince}일</time></div></BaseCard>
          {status.isCheckinTime && <div className="check-ins-page__actions"><ActionButton fullWidth onClick={() => navigate('/check-in', { state: { markerId: status.markerId } })}>체크인 하기</ActionButton></div>}
        </>
      )}
      <BottomNavigation />
    </main>
  )
}

export default CheckInsPage
