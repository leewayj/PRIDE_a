/**
 * 촬영일 출처
 * src/constants/photo.js의 PHOTO_DATE_SOURCE 값과 대응한다.
 */
export type PhotoDateSource = 'exif-original' | 'exif-create' | 'file-modified'

/**
 * 판정 등급
 * - pass: 통과
 * - conditional: 조건부
 * - exclude: 제외
 */
export type PhotoGrade = 'pass' | 'conditional' | 'exclude'

/**
 * RETRACE 판정 결과가 반영된 사진 도메인 타입
 */
export interface Photo {
  id: string
  fileName: string
  /** 촬영일 (ISO 8601 문자열) */
  capturedAt: string
  /** 촬영일 출처 */
  dateSource: PhotoDateSource
  /** 판정 등급 */
  grade: PhotoGrade
  /** 탈락 사유 코드 (grade가 pass가 아닐 때만 존재) */
  rejectionReasonCode: string | null
  /** 정면 대비 각도 값 (degree) */
  angle: number
  /** 본인 사진과의 유사도 (0~1) */
  selfSimilarity: number
  /** 선명도 점수 */
  sharpnessScore: number
}
