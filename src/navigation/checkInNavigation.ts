/**
 * 체크인 진입 시 해당 구간 사진 존재 여부에 따라 분기하는 네비게이션 함수.
 */
import type { Photo } from '../types/photo'
import { CHECK_IN_PATH, PHOTO_RESELECT_PATH } from './paths.ts'
import type { Navigate } from './paths.ts'

/**
 * 체크인 대상 구간에 사진이 있으면 체크인 화면으로, 없으면 사진업로드 화면으로 보낸다.
 * @param periodPhotos 체크인 대상 구간에 해당하는 사진 목록 (호출부에서 기간으로 걸러 전달)
 * @returns 실제로 이동한 경로
 */
export function navigateOnCheckInEntry(navigate: Navigate, periodPhotos: Photo[]): string {
  const path = periodPhotos.length > 0 ? CHECK_IN_PATH : PHOTO_RESELECT_PATH

  navigate(path)
  return path
}
