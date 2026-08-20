import { apiRequest } from './client.js'

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

function assertUserId(userId) {
  if (typeof userId !== 'string' || !userId.trim()) {
    throw new Error('userId is required')
  }
}

function assertDate(value, parameterName) {
  if (typeof value !== 'string' || !DATE_PATTERN.test(value)) {
    throw new Error(`${parameterName} must be in YYYY-MM-DD format`)
  }
}

export function getPhotos(userId) {
  assertUserId(userId)

  const query = new URLSearchParams({ userId: userId.trim() })
  return apiRequest(`/photos?${query}`)
}

export function comparePhotos(userId, date1, date2) {
  assertUserId(userId)
  assertDate(date1, 'date1')
  assertDate(date2, 'date2')

  const query = new URLSearchParams({
    userId: userId.trim(),
    date1,
    date2,
  })
  return apiRequest(`/photos/compare?${query}`)
}

export function getPhotoUploadSummary(userId) {
  assertUserId(userId)

  const query = new URLSearchParams({ userId: userId.trim() })
  return apiRequest(`/photo/upload-summary?${query}`)
}
