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

function assertPhotoKey(photoKey) {
  if (typeof photoKey !== 'string' || !photoKey.trim()) {
    throw new Error('photoKey is required')
  }
}

function assertFile(file) {
  if (!(file instanceof Blob)) {
    throw new Error('file must be a File or Blob')
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

function appendOptionalUserId(query, userId) {
  if (userId == null) return

  assertUserId(userId)
  query.set('userId', userId.trim())
}

export function evaluatePhoto(file, photoKey, userId) {
  assertFile(file)
  assertPhotoKey(photoKey)

  const query = new URLSearchParams({ photoKey: photoKey.trim() })
  appendOptionalUserId(query, userId)

  const formData = new FormData()
  formData.append('file', file)

  return apiRequest(`/photo/evaluate?${query}`, {
    method: 'POST',
    body: formData,
  })
}

export function normalizePhoto(file, userId) {
  assertFile(file)

  const query = new URLSearchParams()
  appendOptionalUserId(query, userId)
  const queryString = query.toString()

  const formData = new FormData()
  formData.append('file', file)

  return apiRequest(`/photo/normalize${queryString ? `?${queryString}` : ''}`, {
    method: 'POST',
    body: formData,
  })
}

export function evaluatePhotosBatch(userId, files) {
  assertUserId(userId)
  assertFiles(files)

  const formData = new FormData()
  files.forEach((file) => {
    formData.append('files', file)
  })

  const query = new URLSearchParams({ userId: userId.trim() })
  return apiRequest(`/photo/evaluate-batch?${query}`, {
    method: 'POST',
    body: formData,
  })
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
