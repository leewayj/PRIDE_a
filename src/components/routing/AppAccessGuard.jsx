import { useCallback, useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { getFaceRegistrationStatus } from '../../api/faceApi.js'
import { getOnboardingStatus } from '../../api/onboardingApi.js'
import { parseFaceRegistrationStatus, parseOnboardingStatus } from '../../domain/appAccess.js'
import { getOrCreateUserId } from '../../utils/userSession.js'
import ActionButton from '../ui/ActionButton.jsx'

let pendingAccessCheck = null

function checkAppAccess() {
  if (!pendingAccessCheck) {
    pendingAccessCheck = (async () => {
      const userId = await getOrCreateUserId()
      const onboardingAcknowledged = parseOnboardingStatus(await getOnboardingStatus(userId))

      if (!onboardingAcknowledged) return 'onboarding-required'

      const faceRegistered = parseFaceRegistrationStatus(await getFaceRegistrationStatus(userId))
      return faceRegistered ? 'allowed' : 'face-required'
    })().finally(() => {
      pendingAccessCheck = null
    })
  }

  return pendingAccessCheck
}

function AppAccessGuard() {
  const [accessState, setAccessState] = useState('checking')
  const [retrySequence, setRetrySequence] = useState(0)

  const retry = useCallback(() => {
    setAccessState('checking')
    setRetrySequence((sequence) => sequence + 1)
  }, [])

  useEffect(() => {
    let active = true
    checkAppAccess()
      .then((result) => {
        if (active) setAccessState(result)
      })
      .catch((error) => {
        console.error('앱 진입 상태를 확인하지 못했습니다.', error)
        if (active) setAccessState('error')
      })

    return () => { active = false }
  }, [retrySequence])

  if (accessState === 'allowed') return <Outlet />
  if (accessState === 'onboarding-required') return <Navigate to="/onboarding/guide" replace />
  if (accessState === 'face-required') return <Navigate to="/onboarding" replace />

  if (accessState === 'error') {
    return (
      <main className="app-access-state" role="alert">
        <strong>앱 상태를 확인하지 못했어요.</strong>
        <p>잠시 후 다시 시도해 주세요.</p>
        <ActionButton onClick={retry}>다시 시도</ActionButton>
      </main>
    )
  }

  return <main className="app-access-state" aria-live="polite">앱 상태를 확인하고 있어요.</main>
}

export default AppAccessGuard
