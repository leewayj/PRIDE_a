import type { MetricType } from './metric'

/**
 * 변화 방향
 * - increase: 증가
 * - decrease: 감소
 */
export type ChangeDirection = 'increase' | 'decrease'

/**
 * 특정 지표가 유의미하게 변화한 시점
 */
export interface ChangePoint {
  /** 변화가 감지된 날짜 (ISO 8601 문자열) */
  date: string
  metricType: MetricType
  direction: ChangeDirection
  /** 변화폭 */
  magnitude: number
}
