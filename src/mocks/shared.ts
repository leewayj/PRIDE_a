import type { PhotoDateSource } from '../types/photo'
import type { MetricType } from '../types/metric'

/** 목데이터 전반에서 순환 사용하는 촬영일 출처 목록 */
export const MOCK_DATE_SOURCES: PhotoDateSource[] = [
  'exif-original',
  'exif-create',
  'file-modified',
]

/**
 * 실제 탈락 사유 코드 체계는 아직 확정되지 않았다.
 * 목데이터 예시용으로 임의 지정한 코드이며, 이후 실제 코드 체계가 정해지면 교체한다.
 */
export const MOCK_REJECTION_REASON_CODES = [
  'angle-out-of-range',
  'low-similarity',
  'low-sharpness',
]

/** 목데이터 전반에서 순환 사용하는 지표 종류 목록 */
export const MOCK_METRIC_TYPES: MetricType[] = [
  'face-width',
  'jaw-angle',
  'eyelid-height',
  'mouth-corner-angle',
]

/** 인덱스를 자릿수 고정 문자열로 변환한다 (예: 3 -> "0003") */
export function pad(index: number, width = 4): string {
  return String(index).padStart(width, '0')
}

/** UTC 기준 날짜를 ISO 8601 문자열로 만든다 (month는 1부터 시작) */
export function isoDate(year: number, month: number, day: number): string {
  return new Date(Date.UTC(year, month - 1, day)).toISOString()
}
