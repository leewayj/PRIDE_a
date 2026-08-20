import type { MetricPoint, MetricType } from '../types/metric'

/**
 * 비교 화면 개발을 위한 임시 프론트엔드 결과 계약이다.
 * 입력값이나 분석 규칙이 아니라 계산이 끝났다고 가정한 표시용 결과만 담는다.
 */
export type CareComparisonStatus = 'ready' | 'insufficient' | 'unavailable'

export interface CareComparisonResult {
  careMarkerId: string
  metricType: MetricType
  status: CareComparisonStatus
  careStartedAt: string
  actual?: number
  predicted?: number
  difference?: number
  actualSeries: MetricPoint[]
  predictedSeries: MetricPoint[]
}

const actualJawAngleSeries: MetricPoint[] = [
  { photoId: 'comparison-actual-01', metricType: 'jaw-angle', value: 128.6, capturedAt: '2024-09-10T00:00:00.000Z', confidence: 0.91 },
  { photoId: 'comparison-actual-02', metricType: 'jaw-angle', value: 129.1, capturedAt: '2024-12-10T00:00:00.000Z', confidence: 0.92 },
  { photoId: 'comparison-actual-03', metricType: 'jaw-angle', value: 129.8, capturedAt: '2025-01-05T00:00:00.000Z', confidence: 0.9 },
  { photoId: 'comparison-actual-04', metricType: 'jaw-angle', value: 130.8, capturedAt: '2025-04-10T00:00:00.000Z', confidence: 0.93 },
  { photoId: 'comparison-actual-05', metricType: 'jaw-angle', value: 131.7, capturedAt: '2025-08-10T00:00:00.000Z', confidence: 0.94 },
]

export const careComparisonResults: CareComparisonResult[] = [
  {
    careMarkerId: 'marker-01',
    metricType: 'jaw-angle',
    status: 'ready',
    careStartedAt: '2025-01-05T00:00:00.000Z',
    actual: 131.7,
    predicted: 130.9,
    difference: 0.8,
    actualSeries: actualJawAngleSeries,
    predictedSeries: [
      { photoId: 'comparison-predicted-01', metricType: 'jaw-angle', value: 129.8, capturedAt: '2025-01-05T00:00:00.000Z', confidence: 1 },
      { photoId: 'comparison-predicted-02', metricType: 'jaw-angle', value: 130.3, capturedAt: '2025-04-10T00:00:00.000Z', confidence: 1 },
      { photoId: 'comparison-predicted-03', metricType: 'jaw-angle', value: 130.9, capturedAt: '2025-08-10T00:00:00.000Z', confidence: 1 },
    ],
  },
  {
    careMarkerId: 'marker-02',
    metricType: 'jaw-angle',
    status: 'insufficient',
    careStartedAt: '2025-07-15T00:00:00.000Z',
    actualSeries: actualJawAngleSeries,
    predictedSeries: [],
  },
  {
    careMarkerId: 'marker-03',
    metricType: 'eyelid-height',
    status: 'unavailable',
    careStartedAt: '2026-02-20T00:00:00.000Z',
    actualSeries: [],
    predictedSeries: [],
  },
]
