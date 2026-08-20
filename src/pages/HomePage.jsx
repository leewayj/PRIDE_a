import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCurrentCare, getHomeSummary } from '../api/homeApi.js'
import ChangeSummaryCard from '../components/home/ChangeSummaryCard.jsx'
import HowItWorks from '../components/home/HowItWorks.jsx'
import HomeHeader from '../components/home/HomeHeader.jsx'
import HomeStatusGrid from '../components/home/HomeStatusGrid.jsx'
import BottomNavigation from '../components/navigation/BottomNavigation.jsx'
import { getOrCreateUserId } from '../utils/userSession.js'
import '../styles/home.css'

const HOME_INDICATOR = 'jaw_angle_deg'

function validateSummary(summary) {
  if (!summary || typeof summary !== 'object' || Array.isArray(summary)) {
    throw new Error('home summary must be an object')
  }

  if (typeof summary.eligible !== 'boolean') {
    throw new Error('home summary eligible must be a boolean')
  }

  if (
    summary.reasons !== undefined &&
    (!Array.isArray(summary.reasons) || summary.reasons.some((reason) => typeof reason !== 'string'))
  ) {
    throw new Error('home summary reasons must be a string array')
  }

  return summary
}

function validateCurrentCare(currentCare) {
  if (!Array.isArray(currentCare)) {
    throw new Error('current care must be an array')
  }

  currentCare.forEach((care) => {
    if (
      !care ||
      typeof care !== 'object' ||
      typeof care.note !== 'string' ||
      typeof care.latestDate !== 'string' ||
      !Number.isInteger(care.count) ||
      care.count < 0
    ) {
      throw new Error('current care item has an invalid shape')
    }
  })

  return currentCare
}

function HomePage() {
  const navigate = useNavigate()
  const [summaryState, setSummaryState] = useState({ status: 'loading', data: null })
  const [careState, setCareState] = useState({ status: 'loading', data: [] })
  const requestIdRef = useRef(0)
  const isRequestingRef = useRef(false)

  const loadHomeData = useCallback(async () => {
    if (isRequestingRef.current) return

    isRequestingRef.current = true
    const requestId = requestIdRef.current + 1
    requestIdRef.current = requestId
    setSummaryState((current) => ({ ...current, status: 'loading' }))
    setCareState((current) => ({ ...current, status: 'loading' }))

    try {
      const userId = await getOrCreateUserId()
      const [summaryResult, careResult] = await Promise.allSettled([
        getHomeSummary(userId, HOME_INDICATOR),
        getCurrentCare(userId),
      ])

      if (requestIdRef.current !== requestId) return

      if (summaryResult.status === 'fulfilled') {
        try {
          setSummaryState({ status: 'success', data: validateSummary(summaryResult.value) })
        } catch (error) {
          console.error('홈 요약 응답을 처리하지 못했습니다.', error)
          setSummaryState({ status: 'error', data: null })
        }
      } else {
        console.error('홈 요약을 불러오지 못했습니다.', summaryResult.reason)
        setSummaryState({ status: 'error', data: null })
      }

      if (careResult.status === 'fulfilled') {
        try {
          setCareState({ status: 'success', data: validateCurrentCare(careResult.value) })
        } catch (error) {
          console.error('현재 관리 응답을 처리하지 못했습니다.', error)
          setCareState({ status: 'error', data: [] })
        }
      } else {
        console.error('현재 관리 목록을 불러오지 못했습니다.', careResult.reason)
        setCareState({ status: 'error', data: [] })
      }
    } catch (error) {
      console.error('홈 정보를 불러오지 못했습니다.', error)
      if (requestIdRef.current === requestId) {
        setSummaryState({ status: 'error', data: null })
        setCareState({ status: 'error', data: [] })
      }
    } finally {
      if (requestIdRef.current === requestId) {
        isRequestingRef.current = false
      }
    }
  }, [])

  useEffect(() => {
    let isActive = true
    queueMicrotask(() => {
      if (isActive) loadHomeData()
    })

    return () => {
      isActive = false
      requestIdRef.current += 1
      isRequestingRef.current = false
    }
  }, [loadHomeData])

  return (
    <main className="app-shell home-page">
      <HomeHeader />
      <ChangeSummaryCard
        summary={summaryState.data}
        status={summaryState.status}
        onRetry={loadHomeData}
      />
      <HomeStatusGrid
        currentCare={careState.data}
        status={careState.status}
        onRetry={loadHomeData}
        onAdd={() => navigate('/care-markers')}
      />
      <HowItWorks onUpload={() => navigate('/check-in')} />
      <BottomNavigation />
    </main>
  )
}

export default HomePage
