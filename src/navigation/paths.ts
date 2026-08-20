/**
 * 이 모듈의 네비게이션 함수들이 분기 대상으로 삼는 라우트 경로.
 * 전부 src/routes/retraceRoutes.jsx에 이미 등록된 6단계 placeholder 경로를 그대로 재사용하며,
 * 화면 UI는 이번 작업에서 새로 만들지 않는다.
 */

/** 판정결과요약 */
export const JUDGEMENT_SUMMARY_PATH = '/judgement/summary'

/** 데이터부족안내 — 기존 분기 경로를 유지한다 */
export const DATA_INSUFFICIENT_PATH = '/re-measurement'

/** 재선택 화면 — 별도 화면이 없어 "사진업로드" placeholder를 재사용한다 */
export const PHOTO_RESELECT_PATH = '/photo-upload'

/** 체크인 */
export const CHECK_IN_PATH = '/check-ins'

/** 함수 시그니처와 react-router의 NavigateFunction을 느슨하게 맞추기 위한 최소 타입 */
export type Navigate = (path: string) => void
