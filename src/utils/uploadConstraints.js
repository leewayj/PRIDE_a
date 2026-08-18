import { PHOTO_FAILURE_CODE } from '../constants/photo.js'
import { getPhotoFailureReason } from './photoFailure.js'

/** 연도별 업로드 최소 장수 */
export const YEAR_UPLOAD_MIN_COUNT = 5

/** 연도별 업로드 최대 장수 */
export const YEAR_UPLOAD_MAX_COUNT = 30

/**
 * @typedef {'too-few'|'valid'|'too-many'} YearUploadStatus
 */

/**
 * @typedef {Object} YearUploadValidation
 * @property {number} year
 * @property {number} count
 * @property {YearUploadStatus} status
 * @property {boolean} valid
 * @property {number} shortBy - 최소 장수에 모자란 수 (status가 'too-few'가 아니면 0)
 * @property {number} overBy - 최대 장수를 초과한 수 (status가 'too-many'가 아니면 0)
 */

/**
 * 촬영일(연도)이 확인된 사진 목록을 연도별로 묶어 최소/최대 업로드 장수 제약을 검증한다.
 * capturedAt이 없는 사진은 연도를 알 수 없으므로 먼저 excludePhotosWithoutCapturedDate로 걸러야 한다.
 * @param {import('../models/photo.js').Photo[]} photos
 * @returns {YearUploadValidation[]} 연도 내림차순으로 정렬된 연도별 검증 결과
 */
export function validateYearlyUploadCounts(photos) {
  const countsByYear = new Map()

  photos.forEach((photo) => {
    if (!Number.isInteger(photo.year)) return
    countsByYear.set(photo.year, (countsByYear.get(photo.year) ?? 0) + 1)
  })

  return [...countsByYear.entries()]
    .sort(([firstYear], [secondYear]) => secondYear - firstYear)
    .map(([year, count]) => {
      const status = statusForCount(count)

      return {
        year,
        count,
        status,
        valid: status === 'valid',
        shortBy: status === 'too-few' ? YEAR_UPLOAD_MIN_COUNT - count : 0,
        overBy: status === 'too-many' ? count - YEAR_UPLOAD_MAX_COUNT : 0,
      }
    })
}

/** @param {number} count @returns {YearUploadStatus} */
function statusForCount(count) {
  if (count < YEAR_UPLOAD_MIN_COUNT) return 'too-few'
  if (count > YEAR_UPLOAD_MAX_COUNT) return 'too-many'
  return 'valid'
}

/**
 * @typedef {Object} ExcludedPhoto
 * @property {import('../models/photo.js').Photo} photo
 * @property {string} reasonCode
 * @property {string} reason
 */

/**
 * 촬영일이 없는 사진을 제외하고, 제외된 사진마다 사유를 함께 기록한다.
 * EXIF 파싱 자체는 다루지 않으며, 이미 분석을 마친 Photo 목록(capturedAt/failureCode 포함)을 입력으로 받는다.
 * @param {import('../models/photo.js').Photo[]} photos
 * @returns {{ included: import('../models/photo.js').Photo[], excluded: ExcludedPhoto[] }}
 */
export function excludePhotosWithoutCapturedDate(photos) {
  return photos.reduce((result, photo) => {
    if (photo.capturedAt) {
      result.included.push(photo)
    } else {
      const reasonCode = photo.failureCode ?? PHOTO_FAILURE_CODE.DATE_NOT_FOUND
      result.excluded.push({
        photo,
        reasonCode,
        reason: photo.failureReason ?? getPhotoFailureReason(reasonCode),
      })
    }
    return result
  }, { included: [], excluded: [] })
}

/**
 * @typedef {Object} UploadValidationResult
 * @property {import('../models/photo.js').Photo[]} included
 * @property {ExcludedPhoto[]} excluded
 * @property {YearUploadValidation[]} yearlyResults
 * @property {boolean} valid - 연도별 데이터가 하나 이상 있고, 모든 연도가 장수 제약을 만족하면 true
 */

/**
 * 촬영일 없는 사진 제외 처리와 연도별 장수 검증을 이어서 수행한다.
 * @param {import('../models/photo.js').Photo[]} photos
 * @returns {UploadValidationResult}
 */
export function validateUpload(photos) {
  const { included, excluded } = excludePhotosWithoutCapturedDate(photos)
  const yearlyResults = validateYearlyUploadCounts(included)

  return {
    included,
    excluded,
    yearlyResults,
    valid: yearlyResults.length > 0 && yearlyResults.every((result) => result.valid),
  }
}
