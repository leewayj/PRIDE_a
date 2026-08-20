import { apiRequest } from './client.js'

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

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

function assertFiles(files) {
  if (!Array.isArray(files) || files.length === 0) {
    throw new Error('files are required')
  }

  if (files.some((file) => !(file instanceof Blob))) {
    throw new Error('files must contain only File or Blob values')
  }
}

function assertDate(value) {
  if (typeof value !== 'string' || !DATE_PATTERN.test(value)) {
    throw new Error('fallbackCapturedAt must be in YYYY-MM-DD format')
  }
}

export function getIndicatorCurve(userId, indicator) {
  assertUserId(userId)
  assertIndicator(indicator)

  const query = new URLSearchParams({
    userId: userId.trim(),
    indicator: indicator.trim(),
  })
  return apiRequest(`/indicator/curve?${query}`)
}

export function extractIndicatorsBatch(userId, files, fallbackCapturedAt) {
  assertUserId(userId)
  assertFiles(files)

  if (fallbackCapturedAt) {
    assertDate(fallbackCapturedAt)
  }

  const query = new URLSearchParams({ userId: userId.trim() })
  if (fallbackCapturedAt) {
    query.set('fallbackCapturedAt', fallbackCapturedAt)
  }

  const formData = new FormData()
  files.forEach((file) => {
    formData.append('files', file)
  })

  return apiRequest(`/indicator/extract-batch?${query}`, {
    method: 'POST',
    body: formData,
  })
}
