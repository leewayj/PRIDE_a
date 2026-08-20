import { apiRequest } from './client.js'

function assertUserId(userId) {
  if (typeof userId !== 'string' || !userId.trim()) {
    throw new Error('userId is required')
  }
}

function assertIndicator(indicator) {
  if (typeof indicator !== 'string' || !indicator.trim()) {
    throw new Error('indicator is required')
  }
}

export function getCheckinStatus(userId) {
  assertUserId(userId)

  const query = new URLSearchParams({ userId: userId.trim() })
  return apiRequest(`/checkin/status?${query}`)
}

export function getRemeasureSuggestion(userId, indicator) {
  assertUserId(userId)
  assertIndicator(indicator)

  const query = new URLSearchParams({
    userId: userId.trim(),
    indicator: indicator.trim(),
  })
  return apiRequest(`/checkin/remeasure-suggestion?${query}`)
}
