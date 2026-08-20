import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getCheckinStatus } from '../api/checkinApi.js'
import CheckInActions from '../components/checkin/CheckInActions.jsx'
import CheckInHeader from '../components/checkin/CheckInHeader.jsx'
import CheckInInfo from '../components/checkin/CheckInInfo.jsx'
import CheckInNotice from '../components/checkin/CheckInNotice.jsx'
import TimelineCard from '../components/checkin/TimelineCard.jsx'
import ActionButton from '../components/ui/ActionButton.jsx'
import BaseCard from '../components/ui/BaseCard.jsx'
import '../styles/checkin.css'
import { getOrCreateUserId } from '../utils/userSession.js'

function validateCheckinStatus(status) {
  if (!status || typeof status !== 'object' || typeof status.hasMarker !== 'boolean') {
    throw new Error('checkin status has an invalid shape')
  }

  if (!status.hasMarker) {
    if (status.message !== undefined && typeof status.message !== 'string') {
      throw new Error('checkin status message must be a string')
    }
    return status
  }

  if (
    !Number.isInteger(status.daysRemaining) ||
    !Number.isInteger(status.daysSince) ||
    typeof status.isCheckinTime !== 'boolean' ||
    typeof status.markerDate !== 'string' ||
    typeof status.markerId !== 'string'
  ) {
    throw new Error('checkin marker status has an invalid shape')
  }

  return status
}

function CheckInPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const navigationStartedRef = useRef(false)
  const requestIdRef = useRef(0)
  const isRequestingRef = useRef(false)
  const [checkinStatus, setCheckinStatus] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const goBack = () => navigate(-1)

  const loadCheckinData = useCallback(async () => {
    if (isRequestingRef.current) return

    isRequestingRef.current = true
    const requestId = requestIdRef.current + 1
    requestIdRef.current = requestId
    setIsLoading(true)
    setHasError(false)

    try {
      const userId = await getOrCreateUserId()
      const result = validateCheckinStatus(await getCheckinStatus(userId))
      if (requestIdRef.current === requestId) setCheckinStatus(result)
    } catch (error) {
      console.error('체크인 정보를 불러오지 못했습니다.', error)
      if (requestIdRef.current === requestId) setHasError(true)
    } finally {
      if (requestIdRef.current === requestId) {
        isRequestingRef.current = false
        setIsLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    let isActive = true
    queueMicrotask(() => {
      if (isActive) loadCheckinData()
    })

    return () => {
      isActive = false
      requestIdRef.current += 1
      isRequestingRef.current = false
    }
  }, [loadCheckinData])

  const addPhotos = () => {
    if (navigationStartedRef.current) return
    navigationStartedRef.current = true

    const markerId = checkinStatus?.markerId
      ?? location.state?.marker?.id
      ?? location.state?.checkIn?.markerId
    const scheduledAt = location.state?.checkIn?.scheduledAt

    navigate('/photos/years', {
      state: {
        source: 'checkIn',
        ...(markerId ? { markerId } : {}),
        ...(scheduledAt ? { scheduledAt } : {}),
      },
    })
  }

  if (isLoading) {
    return (
      <main className="app-shell check-in-page">
        <CheckInHeader onBack={goBack} title="체크인 정보를 확인하고 있어요" />
        <BaseCard className="check-in-page__state" aria-live="polite">잠시만 기다려 주세요.</BaseCard>
      </main>
    )
  }

  if (hasError || !checkinStatus) {
    return (
      <main className="app-shell check-in-page">
        <CheckInHeader onBack={goBack} title="체크인 정보를 불러오지 못했어요" />
        <BaseCard className="check-in-page__state" role="alert">
          <p>잠시 후 다시 시도해 주세요.</p>
          <ActionButton onClick={loadCheckinData}>다시 시도</ActionButton>
        </BaseCard>
      </main>
    )
  }

  if (!checkinStatus.hasMarker) {
    return (
      <main className="app-shell check-in-page">
        <CheckInHeader onBack={goBack} title="아직 체크인 기준이 없어요" />
        <BaseCard className="check-in-page__state">
          <p>{checkinStatus.message ?? '관리 기록을 추가하면 체크인 시점을 확인할 수 있어요.'}</p>
          <ActionButton onClick={() => navigate('/care-markers')}>관리 기록 확인하기</ActionButton>
        </BaseCard>
      </main>
    )
  }

  return (
    <main className="app-shell check-in-page">
      <CheckInHeader
        onBack={goBack}
        title={checkinStatus.isCheckinTime
          ? '체크인할 시간이에요'
          : `다음 체크인까지 ${checkinStatus.daysRemaining}일 남았어요`}
        description={checkinStatus.isCheckinTime
          ? '그동안의 변화를 확인할 사진을 골라주세요.'
          : '체크인 시점이 되면 사진을 추가할 수 있어요.'}
      />
      <TimelineCard
        daysRemaining={checkinStatus.daysRemaining}
        isCheckinTime={checkinStatus.isCheckinTime}
        markerDate={checkinStatus.markerDate}
      />
      <CheckInInfo
        daysRemaining={checkinStatus.daysRemaining}
        daysSince={checkinStatus.daysSince}
        markerDate={checkinStatus.markerDate}
      />
      {checkinStatus.isCheckinTime && (
        <>
          <CheckInNotice />
          <CheckInActions onAddPhotos={addPhotos} onLater={goBack} />
        </>
      )}
    </main>
  )
}

export default CheckInPage
