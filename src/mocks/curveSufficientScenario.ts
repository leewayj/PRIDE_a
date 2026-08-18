/**
 * 곡선 생성 기준 충족 케이스 목데이터
 * 연도별 통과 사진 3장 이상, 총 통과 사진 20장 이상인 사례를 표현한다.
 * 변화점 2개 이상, 관리 마커 2개 이상, 그리고 관리 마커에 연결된 체크인도 함께 포함한다.
 */
import type { Photo } from '../types/photo'
import type { MetricPoint } from '../types/metric'
import type { ChangePoint } from '../types/changePoint'
import type { CareMarker } from '../types/careMarker'
import type { CheckIn } from '../types/checkIn'
import { MOCK_DATE_SOURCES, MOCK_METRIC_TYPES, isoDate, pad } from './shared'

type YearPlan = {
  year: number
  passCount: number
  otherCount: number
}

const YEARLY_PLAN: YearPlan[] = [
  { year: 2024, passCount: 7, otherCount: 2 },
  { year: 2025, passCount: 8, otherCount: 2 },
  { year: 2026, passCount: 6, otherCount: 2 },
]

function buildYearPhotos({ year, passCount, otherCount }: YearPlan, sequenceOffset: number): Photo[] {
  const total = passCount + otherCount

  return Array.from({ length: total }, (_, indexInYear) => {
    const index = sequenceOffset + indexInYear
    const isPass = indexInYear < passCount
    const month = (indexInYear % 12) + 1

    return {
      id: `sufficient-${year}-${pad(indexInYear)}`,
      fileName: `IMG_${year}_${pad(indexInYear)}.jpg`,
      capturedAt: isoDate(year, month, 10),
      dateSource: MOCK_DATE_SOURCES[index % MOCK_DATE_SOURCES.length],
      grade: isPass ? 'pass' : 'conditional',
      rejectionReasonCode: isPass ? null : 'low-sharpness',
      angle: isPass ? 1 + (indexInYear % 5) : 10 + (indexInYear % 5),
      selfSimilarity: isPass ? 0.94 : 0.82,
      sharpnessScore: isPass ? 90 : 62,
    }
  })
}

export const curveSufficientPhotos: Photo[] = YEARLY_PLAN.flatMap((plan, planIndex) =>
  buildYearPhotos(plan, planIndex * 100),
)

/** 연도별 통과 사진 수 (모두 3장 이상) */
export const curveSufficientYearlyPassCounts = Object.fromEntries(
  YEARLY_PLAN.map(({ year, passCount }) => [year, passCount]),
)

/** 전체 통과 사진 수 (20장 이상) */
export const curveSufficientTotalPassCount = YEARLY_PLAN.reduce((sum, { passCount }) => sum + passCount, 0)

export const curveSufficientMetricPoints: MetricPoint[] = curveSufficientPhotos
  .filter((photo) => photo.grade === 'pass')
  .flatMap((photo, photoIndex) =>
    MOCK_METRIC_TYPES.map((metricType, metricIndex) => ({
      photoId: photo.id,
      metricType,
      value: 120 + photoIndex * 1.5 + metricIndex,
      capturedAt: photo.capturedAt,
      // 표본(통과 사진)이 충분해 신뢰도가 높게 산출됨
      confidence: Number((0.82 + (metricIndex % 3) * 0.05).toFixed(2)),
    })),
  )

export const curveSufficientChangePoints: ChangePoint[] = [
  { date: isoDate(2025, 1, 10), metricType: 'jaw-angle', direction: 'increase', magnitude: 1.8 },
  { date: isoDate(2025, 7, 22), metricType: 'face-width', direction: 'decrease', magnitude: 0.6 },
  { date: isoDate(2026, 3, 5), metricType: 'eyelid-height', direction: 'increase', magnitude: 0.4 },
]

export const curveSufficientCareMarkers: CareMarker[] = [
  {
    id: 'marker-01',
    kind: '피부과 시술',
    date: isoDate(2025, 1, 5),
    rawText: '턱선 리프팅 시술을 받았어요',
    registrationPath: 'chat',
  },
  {
    id: 'marker-02',
    kind: '홈케어 루틴 변경',
    date: isoDate(2025, 7, 15),
    rawText: '아침 마사지 루틴을 새로 추가했어요',
    registrationPath: 'manual',
  },
  {
    id: 'marker-03',
    kind: '피부과 시술',
    date: isoDate(2026, 2, 20),
    rawText: '눈매 교정 시술을 받았어요',
    registrationPath: 'chat',
  },
]

export const curveSufficientCheckIns: CheckIn[] = [
  { markerId: 'marker-01', scheduledAt: isoDate(2025, 2, 5), sent: true, responded: true },
  { markerId: 'marker-01', scheduledAt: isoDate(2025, 4, 5), sent: true, responded: false },
  { markerId: 'marker-02', scheduledAt: isoDate(2025, 8, 15), sent: true, responded: true },
  { markerId: 'marker-03', scheduledAt: isoDate(2026, 3, 20), sent: false, responded: false },
]
