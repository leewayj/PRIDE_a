/**
 * 사용자가 남긴 관리(시술/스킨케어/생활습관 등) 기록 마커
 */
export interface CareMarker {
  id: string
  /** 관리 종류 */
  kind: string
  /** 관리 발생 날짜 (ISO 8601 문자열) */
  date: string
  /** 사용자가 입력한 원문 문장 */
  rawText: string
  /** 등록 경로 */
  registrationPath: string
}
