/**
 * 관리 마커에 대한 후속 체크인
 */
export interface CheckIn {
  /** 체크인 대상 관리 마커 id */
  markerId: string
  /** 발송 예정 시각 (ISO 8601 문자열) */
  scheduledAt: string
  /** 발송 여부 */
  sent: boolean
  /** 응답 여부 */
  responded: boolean
}
