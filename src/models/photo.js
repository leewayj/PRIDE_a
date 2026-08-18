import {
  PHOTO_ANALYSIS_STATUS,
  PHOTO_FAILURE_CODE,
} from '../constants/photo.js'
import { getPhotoFailureReason } from '../utils/photoFailure.js'

/**
 * @typedef {Object} Photo
 * @property {string} id
 * @property {string} fileName
 * @property {number} fileSize
 * @property {number} lastModified
 * @property {string} mimeType
 * @property {File|null} file
 * @property {string|null} capturedAt
 * @property {number|null} year
 * @property {'exif-original'|'exif-create'|'file-modified'|null} dateSource
 * @property {'success'|'failed'} analysisStatus
 * @property {string|null} failureCode
 * @property {string|null} failureReason
 * @property {string} analyzedAt
 */

/** @returns {Photo} */
export function createPhotoModel(file, analysis) {
  return {
    id: analysis.id,
    fileName: file.name,
    fileSize: file.size,
    lastModified: file.lastModified,
    mimeType: file.type,
    file,
    capturedAt: analysis.capturedAt,
    year: analysis.year,
    dateSource: analysis.dateSource,
    analysisStatus: analysis.analysisStatus,
    failureCode: analysis.failureCode,
    failureReason: analysis.failureReason,
    analyzedAt: analysis.analyzedAt,
  }
}

/** @returns {Photo} */
export function restorePhotoModel(metadata) {
  const legacyIdParts = String(metadata.id ?? '').split('\u0000')
  const capturedAt = metadata.capturedAt ?? metadata.takenAt ?? null
  const year = metadata.year ?? metadata.takenYear ?? null
  const analysisStatus = metadata.analysisStatus ?? (
    Number.isInteger(year) ? PHOTO_ANALYSIS_STATUS.SUCCESS : PHOTO_ANALYSIS_STATUS.FAILED
  )
  const failureCode = metadata.failureCode ?? (
    analysisStatus === PHOTO_ANALYSIS_STATUS.FAILED ? PHOTO_FAILURE_CODE.DATE_NOT_FOUND : null
  )

  return {
    id: String(metadata.id ?? ''),
    fileName: metadata.fileName ?? metadata.name ?? legacyIdParts[0] ?? '',
    fileSize: Number(metadata.fileSize ?? legacyIdParts[1] ?? 0),
    lastModified: Number(metadata.lastModified ?? legacyIdParts[2] ?? 0),
    mimeType: metadata.mimeType ?? '',
    file: null,
    capturedAt,
    year,
    dateSource: metadata.dateSource ?? null,
    analysisStatus,
    failureCode,
    failureReason: metadata.failureReason ?? getPhotoFailureReason(failureCode),
    analyzedAt: metadata.analyzedAt ?? capturedAt ?? '',
  }
}

export function serializePhotoMetadata(photo) {
  const {
    id,
    fileName,
    fileSize,
    lastModified,
    mimeType,
    capturedAt,
    year,
    dateSource,
    analysisStatus,
    failureCode,
    failureReason,
    analyzedAt,
  } = photo

  return {
    id,
    fileName,
    fileSize,
    lastModified,
    mimeType,
    capturedAt,
    year,
    dateSource,
    analysisStatus,
    failureCode,
    failureReason,
    analyzedAt,
  }
}
