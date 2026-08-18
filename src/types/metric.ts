/**
 * 지표 종류
 * - face-width: 얼굴폭
 * - jaw-angle: 턱선각도
 * - eyelid-height: 눈꺼풀높이
 * - mouth-corner-angle: 입가각도
 */
export type MetricType =
  | 'face-width'
  | 'jaw-angle'
  | 'eyelid-height'
  | 'mouth-corner-angle'

/**
 * 특정 사진에서 추출된 단일 지표 값
 */
export interface MetricPoint {
  /** 지표를 추출한 사진 id */
  photoId: string
  metricType: MetricType
  value: number
  /** 지표가 속한 사진의 촬영일 (ISO 8601 문자열) */
  capturedAt: string
  /** 지표 추출 신뢰도 (0~1) */
  confidence: number
}
