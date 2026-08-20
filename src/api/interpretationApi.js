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

function assertMarkerId(markerId) {
  if (typeof markerId !== 'string' || !markerId.trim()) {
    throw new Error('markerId is required')
  }
}

export function getInterpretationCard(userId, indicator, markerId) {
  assertUserId(userId)
  assertIndicator(indicator)
  assertMarkerId(markerId)

  const query = new URLSearchParams({
    userId: userId.trim(),
    indicator: indicator.trim(),
    markerId: markerId.trim(),
  })
  return apiRequest(`/interpretation/card?${query}`)
}
