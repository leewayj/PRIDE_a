/**
 * 곡선 생성 기준 미달 케이스 목데이터
 * 연도별 통과 사진이 3장 미만이라 변화 곡선을 만들 수 없는 사례를 표현한다.
 * 통과 사진 수가 적어 지표 신뢰도가 낮게 산출되는 "표본 부족 구간"도 함께 포함한다.
 */
import type { Photo } from '../types/photo'
import type { MetricPoint } from '../types/metric'
import { MOCK_DATE_SOURCES, MOCK_METRIC_TYPES, isoDate, pad } from './shared'

/** 곡선 생성에 필요한 연도별 최소 통과 사진 수 (이 값 미만이면 미달) */
export const CURVE_MIN_PASS_PHOTOS_PER_YEAR = 3

type YearPlan = {
  year: number
  passCount: number
  otherCount: number
}

const YEARLY_PLAN: YearPlan[] = [
  { year: 2023, passCount: 2, otherCount: 3 },
  { year: 2024, passCount: 1, otherCount: 2 },
]

function buildYearPhotos({ year, passCount, otherCount }: YearPlan, sequenceOffset: number): Photo[] {
  const total = passCount + otherCount

  return Array.from({ length: total }, (_, indexInYear) => {
    const index = sequenceOffset + indexInYear
    const isPass = indexInYear < passCount
    const month = (indexInYear % 12) + 1

    return {
      id: `insufficient-${year}-${pad(indexInYear)}`,
      fileName: `IMG_${year}_${pad(indexInYear)}.jpg`,
      capturedAt: isoDate(year, month, 15),
      dateSource: MOCK_DATE_SOURCES[index % MOCK_DATE_SOURCES.length],
      grade: isPass ? 'pass' : 'exclude',
      rejectionReasonCode: isPass ? null : 'low-similarity',
      angle: isPass ? 2 + indexInYear : 15 + indexInYear,
      selfSimilarity: isPass ? 0.95 : 0.6,
      sharpnessScore: isPass ? 88 : 50,
    }
  })
}

export const curveInsufficientPhotos: Photo[] = YEARLY_PLAN.flatMap((plan, planIndex) =>
  buildYearPhotos(plan, planIndex * 10),
)

/** 연도별 통과 사진 수 (모두 CURVE_MIN_PASS_PHOTOS_PER_YEAR 미만) */
export const curveInsufficientYearlyPassCounts = Object.fromEntries(
  YEARLY_PLAN.map(({ year, passCount }) => [year, passCount]),
)

/** 표본 부족 구간 — 통과 사진 수가 적어 지표 신뢰도가 낮게 산출된 MetricPoint */
export const curveInsufficientMetricPoints: MetricPoint[] = curveInsufficientPhotos
  .filter((photo) => photo.grade === 'pass')
  .flatMap((photo, photoIndex) =>
    MOCK_METRIC_TYPES.map((metricType, metricIndex) => ({
      photoId: photo.id,
      metricType,
      value: 100 + photoIndex * 2 + metricIndex,
      capturedAt: photo.capturedAt,
      // 표본(통과 사진) 수가 적어 낮게 산출된 신뢰도
      confidence: Number((0.25 + (metricIndex % 3) * 0.05).toFixed(2)),
    })),
  )
