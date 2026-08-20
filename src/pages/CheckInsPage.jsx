import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ActionButton from '../components/ui/ActionButton.jsx'
import BaseCard from '../components/ui/BaseCard.jsx'
import BottomNavigation from '../components/navigation/BottomNavigation.jsx'
import {
  CHECK_IN_OFFSET_WEEKS,
  calculateCheckInSchedule,
} from '../domain/checkInSchedule'
import { fetchCareMarkers, fetchCheckIns } from '../services/retraceApi'
import { formatPhotoDate } from '../utils/dateFormat.js'
import '../styles/checkin.css'

function CheckInsPage() {
  const navigate = useNavigate()
  const navigationStartedRef = useRef(false)
  const [careMarkers, setCareMarkers] = useState([])
  const [savedCheckIns, setSavedCheckIns] = useState([])
  const [selectedMarkerId, setSelectedMarkerId] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isActive = true

    Promise.allSettled([fetchCareMarkers(), fetchCheckIns()])
      .then(([markerResponse, checkInResponse]) => {
        if (!isActive) return
        setCareMarkers(
          markerResponse.status === 'fulfilled' && Array.isArray(markerResponse.value)
            ? markerResponse.value
            : [],
        )
        setSavedCheckIns(
          checkInResponse.status === 'fulfilled' && Array.isArray(checkInResponse.value)
            ? checkInResponse.value
            : [],
        )
      })
      .finally(() => {
        if (isActive) setIsLoading(false)
      })

    return () => {
      isActive = false
    }
  }, [])

  const selectedMarker = careMarkers.find(({ id }) => id === selectedMarkerId) ?? careMarkers[0]
  const schedule = useMemo(() => {
    if (!selectedMarker || Number.isNaN(new Date(selectedMarker.date).getTime())) return []

    const persistedByDate = new Map(
      savedCheckIns
        .filter(({ markerId }) => markerId === selectedMarker.id)
        .map((checkIn) => [checkIn.scheduledAt, checkIn]),
    )

    return calculateCheckInSchedule(selectedMarker).map((checkIn) => (
      persistedByDate.get(checkIn.scheduledAt) ?? checkIn
    ))
  }, [savedCheckIns, selectedMarker])
  const nextCheckInIndex = schedule.findIndex(({ responded }) => !responded)
  const nextCheckIn = nextCheckInIndex >= 0 ? schedule[nextCheckInIndex] : null
  const completedCount = schedule.filter(({ responded }) => responded).length
  const handleCheckIn = () => {
    if (!nextCheckIn || navigationStartedRef.current) return
    navigationStartedRef.current = true
    navigate('/check-in', {
      state: { marker: selectedMarker, checkIn: nextCheckIn },
    })
  }

  return (
    <main className="app-shell check-ins-page">
      <header className="check-ins-page__header">
        <span>CHECK-IN</span>
        <h1>관리 이후의 변화를<br />차근차근 확인해요.</h1>
        <p>관리 기록을 기준으로 4주, 8주, 12주에 사진을 다시 확인합니다.</p>
      </header>

      {isLoading ? (
        <div className="check-ins-page__state" aria-live="polite">체크인 일정을 불러오고 있어요.</div>
      ) : careMarkers.length === 0 ? (
        <BaseCard className="check-ins-page__state">
          <strong>아직 체크인 기준이 되는 관리 기록이 없어요.</strong>
          <p>관리 기록이 생기면 체크인 일정을 확인할 수 있습니다.</p>
          <ActionButton fullWidth onClick={() => navigate('/care-markers')}>관리 기록 확인하기</ActionButton>
        </BaseCard>
      ) : (
        <>
          {careMarkers.length > 1 && (
            <div className="check-ins-page__marker-selector" aria-label="체크인 기준 관리 기록">
              {careMarkers.map((marker) => (
                <button
                  className={selectedMarker?.id === marker.id ? 'is-selected' : ''}
                  type="button"
                  onClick={() => setSelectedMarkerId(marker.id)}
                  aria-pressed={selectedMarker?.id === marker.id}
                  key={marker.id}
                >
                  <strong>{marker.kind}</strong>
                  <span>{formatPhotoDate(marker.date)}</span>
                </button>
              ))}
            </div>
          )}

          <BaseCard className="check-ins-page__basis">
            <span>관리 시작</span>
            <strong>{selectedMarker.kind}</strong>
            <time dateTime={selectedMarker.date}>{formatPhotoDate(selectedMarker.date)}</time>
          </BaseCard>

          {schedule.length === 0 ? (
            <BaseCard className="check-ins-page__state">
              <strong>표시할 체크인 일정이 없어요.</strong>
              <p>관리 기록 날짜를 확인해 주세요.</p>
            </BaseCard>
          ) : (
            <>
              <BaseCard className="check-ins-page__next">
                <span>다음 체크인</span>
                {nextCheckIn ? (
                  <div>
                    <strong>{CHECK_IN_OFFSET_WEEKS[nextCheckInIndex]}주 체크인</strong>
                    <time dateTime={nextCheckIn.scheduledAt}>{formatPhotoDate(nextCheckIn.scheduledAt)}</time>
                  </div>
                ) : (
                  <strong>예정된 체크인이 없습니다.</strong>
                )}
                <p>{completedCount} / {schedule.length} 완료</p>
              </BaseCard>

              <ol className="check-ins-page__schedule" aria-label="체크인 일정">
                {schedule.map((checkIn, index) => {
                  const status = checkIn.responded ? '완료' : checkIn.sent ? '체크인 가능' : '예정'
                  const isNext = index === nextCheckInIndex

                  return (
                    <li className={`${checkIn.responded ? 'is-complete' : ''}${isNext ? ' is-next' : ''}`} key={checkIn.scheduledAt}>
                      <span className="check-ins-page__step" aria-hidden="true" />
                      <div>
                        <strong>{CHECK_IN_OFFSET_WEEKS[index]}주 체크인</strong>
                        <time dateTime={checkIn.scheduledAt}>{formatPhotoDate(checkIn.scheduledAt)}</time>
                      </div>
                      <span className="check-ins-page__status">{status}</span>
                    </li>
                  )
                })}
              </ol>

              {nextCheckIn && (
                <div className="check-ins-page__actions">
                  <ActionButton
                    fullWidth
                    onClick={handleCheckIn}
                  >
                    체크인 하기
                  </ActionButton>
                </div>
              )}
            </>
          )}
        </>
      )}

      <BottomNavigation />
    </main>
  )
}

export default CheckInsPage
