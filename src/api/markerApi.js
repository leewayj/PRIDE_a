import { apiRequest } from './client.js'

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

function assertUserId(userId) {
  if (typeof userId !== 'string' || !userId.trim()) {
    throw new Error('userId is required')
  }
}

function assertMarkerDate(markerDate) {
  if (typeof markerDate !== 'string' || !DATE_PATTERN.test(markerDate)) {
    throw new Error('markerDate must be YYYY-MM-DD')
  }
}

function assertNote(note) {
  if (typeof note !== 'string' || !note.trim()) {
    throw new Error('note is required')
  }
}

export function registerMarker(userId, markerDate, note) {
  assertUserId(userId)
  assertMarkerDate(markerDate)
  assertNote(note)

  const query = new URLSearchParams({
    userId: userId.trim(),
    markerDate,
    note,
  })
  return apiRequest(`/marker/register?${query}`, {
    method: 'POST',
  })
}

export function getMarkerList(userId) {
  assertUserId(userId)

  const query = new URLSearchParams({ userId: userId.trim() })
  return apiRequest(`/marker/list?${query}`)
}
