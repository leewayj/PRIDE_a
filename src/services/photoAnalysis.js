import * as exifr from 'exifr'
import {
  PHOTO_ANALYSIS_STATUS,
  PHOTO_DATE_SOURCE,
  PHOTO_FAILURE_CODE,
} from '../constants/photo.js'
import { createPhotoModel } from '../models/photo.js'
import { getPhotoFailureReason } from '../utils/photoFailure.js'

function validDate(value) {
  if (!value) return null
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function createPhotoId(file) {
  return `${file.name}\u0000${file.size}\u0000${file.lastModified}`
}

export function validatePhotoFile(file) {
  const valid = Boolean(file && typeof file.type === 'string' && file.type.startsWith('image/'))
  return {
    valid,
    failureCode: valid ? null : PHOTO_FAILURE_CODE.UNSUPPORTED_FORMAT,
  }
}

export async function extractCapturedDate(file) {
  let readFailed = false

  try {
    const metadata = await exifr.parse(file, ['DateTimeOriginal', 'CreateDate'])
    const originalDate = validDate(metadata?.DateTimeOriginal)
    if (originalDate) {
      return { capturedAt: originalDate, dateSource: PHOTO_DATE_SOURCE.EXIF_ORIGINAL }
    }

    const createDate = validDate(metadata?.CreateDate)
    if (createDate) {
      return { capturedAt: createDate, dateSource: PHOTO_DATE_SOURCE.EXIF_CREATE }
    }
  } catch {
    readFailed = true
  }

  const modifiedDate = validDate(file.lastModified)
  if (modifiedDate) {
    return { capturedAt: modifiedDate, dateSource: PHOTO_DATE_SOURCE.FILE_MODIFIED }
  }

  return {
    capturedAt: null,
    dateSource: null,
    failureCode: readFailed ? PHOTO_FAILURE_CODE.READ_FAILED : PHOTO_FAILURE_CODE.DATE_NOT_FOUND,
  }
}

function failedAnalysis(file, id, failureCode, analyzedAt) {
  return createPhotoModel(file, {
    id,
    capturedAt: null,
    year: null,
    dateSource: null,
    analysisStatus: PHOTO_ANALYSIS_STATUS.FAILED,
    failureCode,
    failureReason: getPhotoFailureReason(failureCode),
    analyzedAt,
  })
}

export async function analyzePhoto(file) {
  const analyzedAt = new Date().toISOString()
  const id = createPhotoId(file)
  const validation = validatePhotoFile(file)

  if (!validation.valid) {
    return failedAnalysis(file, id, validation.failureCode, analyzedAt)
  }

  try {
    const dateResult = await extractCapturedDate(file)
    if (!dateResult.capturedAt) {
      return failedAnalysis(file, id, dateResult.failureCode, analyzedAt)
    }

    return createPhotoModel(file, {
      id,
      capturedAt: dateResult.capturedAt.toISOString(),
      year: dateResult.capturedAt.getFullYear(),
      dateSource: dateResult.dateSource,
      analysisStatus: PHOTO_ANALYSIS_STATUS.SUCCESS,
      failureCode: null,
      failureReason: null,
      analyzedAt,
    })
  } catch {
    return failedAnalysis(file, id, PHOTO_FAILURE_CODE.ANALYSIS_FAILED, analyzedAt)
  }
}

export async function analyzePhotos(files, options = {}) {
  const existingIds = new Set(options.existingPhotoIds ?? [])
  const processedIds = new Set()
  const successfulPhotos = []
  const failedPhotos = []
  const duplicatePhotos = []
  const uniqueFiles = []

  for (const file of files) {
    const id = createPhotoId(file)
    if (existingIds.has(id) || processedIds.has(id)) {
      duplicatePhotos.push(file)
    } else {
      processedIds.add(id)
      uniqueFiles.push(file)
    }
  }

  const total = uniqueFiles.length
  for (let index = 0; index < uniqueFiles.length; index += 1) {
    const file = uniqueFiles[index]
    const photo = await analyzePhoto(file).catch(() => failedAnalysis(
      file,
      createPhotoId(file),
      PHOTO_FAILURE_CODE.ANALYSIS_FAILED,
      new Date().toISOString(),
    ))
    if (photo.analysisStatus === PHOTO_ANALYSIS_STATUS.SUCCESS) successfulPhotos.push(photo)
    else failedPhotos.push(photo)

    const completed = index + 1
    await options.onProgress?.({
      total,
      completed,
      successCount: successfulPhotos.length,
      failedCount: failedPhotos.length,
      progress: total === 0 ? 0 : Math.round((completed / total) * 100),
    })
  }

  return {
    successfulPhotos,
    failedPhotos,
    duplicatePhotos,
    totalCount: files.length,
    successCount: successfulPhotos.length,
    failedCount: failedPhotos.length,
    duplicateCount: duplicatePhotos.length,
  }
}
