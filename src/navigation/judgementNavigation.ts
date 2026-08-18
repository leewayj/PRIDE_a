/**
 * 판정 완료 후 분기하는 네비게이션 함수.
 * 곡선 생성 기준 판정(4단계 로직, evaluateCurveEligibility)은 그대로 재사용하고
 * 여기서는 그 결과에 따라 어느 라우트로 보낼지만 결정한다.
 */
import type { Photo } from '../types/photo'
import { evaluateCurveEligibility } from '../domain/curveEligibility.ts'
import { DATA_INSUFFICIENT_PATH, JUDGEMENT_SUMMARY_PATH } from './paths.ts'
import type { Navigate } from './paths.ts'

/**
 * 판정이 끝난 사진 목록으로 곡선 생성 기준 충족 여부를 판단해
 * "판정결과요약" 또는 "데이터부족안내"로 이동시킨다.
 * @returns 실제로 이동한 경로
 */
export function navigateAfterJudgement(navigate: Navigate, photos: Photo[]): string {
  const { eligible } = evaluateCurveEligibility(photos)
  const path = eligible ? JUDGEMENT_SUMMARY_PATH : DATA_INSUFFICIENT_PATH

  navigate(path)
  return path
}
