import { apiRequest } from './client.js'

function createUserQuery(userId) {
  if (typeof userId !== 'string' || !userId.trim()) {
    throw new Error('온보딩 API 요청에 유효한 userId가 필요합니다.')
  }

  return new URLSearchParams({ userId: userId.trim() })
}

export function getOnboardingStatus(userId) {
  const query = createUserQuery(userId)
  return apiRequest(`/onboarding/status?${query}`, {
    method: 'GET',
  })
}

export function acknowledgeOnboarding(userId) {
  const query = createUserQuery(userId)
  return apiRequest(`/onboarding/acknowledge?${query}`, {
    method: 'POST',
  })
}
