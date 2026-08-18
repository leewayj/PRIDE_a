/**
 * 얼굴검출 실패/동일인 오류 시 재선택 화면으로 되돌아가는 네비게이션 함수.
 */
import type { Photo } from '../types/photo'
import { PHOTO_RESELECT_PATH } from './paths.ts'
import type { Navigate } from './paths.ts'

/**
 * 재선택을 강제해야 하는 탈락 사유 코드.
 * 실제 코드 체계는 아직 확정되지 않아(src/mocks의 예시 코드 참고) 이 두 값은
 * "얼굴검출 실패"/"동일인 오류"를 나타내는 임시 코드다.
 */
export const CRITICAL_REJECTION_REASON_CODES = ['face-not-detected', 'identity-mismatch']

/**
 * 사진이 얼굴검출 실패/동일인 오류로 탈락한 경우에만 재선택 화면으로 이동시킨다.
 * 그 외 탈락 사유(각도/유사도/선명도 등)는 이 함수가 처리하지 않는다.
 * @returns 이동했다면 이동한 경로, 아니면 null
 */
export function navigateOnCriticalPhotoRejection(navigate: Navigate, photo: Photo): string | null {
  if (photo.grade === 'pass') return null
  if (!photo.rejectionReasonCode) return null
  if (!CRITICAL_REJECTION_REASON_CODES.includes(photo.rejectionReasonCode)) return null

  navigate(PHOTO_RESELECT_PATH)
  return PHOTO_RESELECT_PATH
}
