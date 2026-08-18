import { PHOTO_FAILURE_CODE } from '../constants/photo.js'

const FAILURE_REASONS = Object.freeze({
  [PHOTO_FAILURE_CODE.UNSUPPORTED_FORMAT]: '지원하지 않는 사진 형식이에요',
  [PHOTO_FAILURE_CODE.DATE_NOT_FOUND]: '촬영 날짜를 확인할 수 없어요',
  [PHOTO_FAILURE_CODE.READ_FAILED]: '사진 정보를 읽을 수 없어요',
  [PHOTO_FAILURE_CODE.ANALYSIS_FAILED]: '분석 중 오류가 발생했어요',
})

export function getPhotoFailureReason(failureCode) {
  return failureCode ? FAILURE_REASONS[failureCode] ?? FAILURE_REASONS[PHOTO_FAILURE_CODE.ANALYSIS_FAILED] : null
}
