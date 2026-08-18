/**
 * curveEligibility.ts에 대한 목데이터 기반 동작 확인 스크립트.
 * 테스트 러너 없이 `node src/domain/curveEligibility.verify.ts`로 직접 실행한다.
 *
 * 2단계 목데이터(곡선 생성 기준 미달/충족 케이스)로 두 판정 함수를 모두 검증한다.
 * src/mocks의 curveInsufficientScenario/curveSufficientScenario와 동일한 연도별 통과 장수
 * 구성을 그대로 재현한 픽스처를 사용한다. (해당 모듈은 확장자 없는 상대 경로로 서로를
 * import하고 있어 번들러 없이 node로 직접 실행할 수 없기 때문에, 여기서는 같은 수치로
 * 독립적인 픽스처를 구성해 node로 바로 실행 가능하게 했다.)
 */
import type { Photo } from '../types/photo'
import {
  CURVE_MIN_PASS_PHOTOS_PER_YEAR,
  CURVE_MIN_TOTAL_PASS_PHOTOS,
  evaluateCurveEligibility,
  findCurveEligibilityGap,
} from './curveEligibility.ts'

let passedCount = 0

function assertEqual(actual: unknown, expected: unknown, message: string): void {
  const matches = JSON.stringify(actual) === JSON.stringify(expected)
  if (!matches) {
    throw new Error(
      `FAIL: ${message}\n  expected: ${JSON.stringify(expected)}\n  actual:   ${JSON.stringify(actual)}`,
    )
  }
  passedCount += 1
  console.log(`PASS: ${message}`)
}

function buildYearPhotos(year: number, passCount: number, otherCount: number, idPrefix: string): Photo[] {
  return Array.from({ length: passCount + otherCount }, (_, index): Photo => {
    const isPass = index < passCount

    return {
      id: `${idPrefix}-${year}-${index}`,
      fileName: `IMG_${year}_${index}.jpg`,
      capturedAt: new Date(Date.UTC(year, index % 12, 10)).toISOString(),
      dateSource: 'exif-original',
      grade: isPass ? 'pass' : 'exclude',
      rejectionReasonCode: isPass ? null : 'low-similarity',
      angle: isPass ? 2 : 15,
      selfSimilarity: isPass ? 0.95 : 0.6,
      sharpnessScore: isPass ? 88 : 50,
    }
  })
}

// src/mocks/curveInsufficientScenario.ts와 동일한 연도별 통과 장수 구성 (2023: 2장, 2024: 1장)
const insufficientCasePhotos: Photo[] = [
  ...buildYearPhotos(2023, 2, 3, 'insufficient'),
  ...buildYearPhotos(2024, 1, 2, 'insufficient'),
]

// src/mocks/curveSufficientScenario.ts와 동일한 연도별 통과 장수 구성 (2024: 7장, 2025: 8장, 2026: 6장, 총 21장)
const sufficientCasePhotos: Photo[] = [
  ...buildYearPhotos(2024, 7, 2, 'sufficient'),
  ...buildYearPhotos(2025, 8, 2, 'sufficient'),
  ...buildYearPhotos(2026, 6, 2, 'sufficient'),
]

// --- 1단계: 곡선 생성 기준 미달 케이스 (연도별 통과 3장 미만) ------------------

{
  const evaluation = evaluateCurveEligibility(insufficientCasePhotos)

  assertEqual(evaluation.eligible, false, '미달 케이스는 곡선 생성 대상이 아니다')
  assertEqual(evaluation.meetsPerYearMinimum, false, '미달 케이스는 연도당 최소 장수를 만족하지 못한다')
  assertEqual(
    evaluation.yearlyPassCounts,
    [
      { year: 2023, passCount: 2 },
      { year: 2024, passCount: 1 },
    ],
    '연도별 통과 장수가 정확히 집계된다',
  )

  const gap = findCurveEligibilityGap(insufficientCasePhotos)
  assertEqual(gap.eligible, false, '미달 케이스의 gap 결과도 eligible=false다')
  assertEqual(
    gap.yearlyShortfalls,
    [
      { year: 2023, passCount: 2, additionalPassPhotosNeeded: 1 },
      { year: 2024, passCount: 1, additionalPassPhotosNeeded: 2 },
    ],
    '미달 연도마다 몇 장이 더 필요한지 정확히 계산된다',
  )
  assertEqual(
    gap.additionalTotalPassPhotosNeeded,
    CURVE_MIN_TOTAL_PASS_PHOTOS - 3,
    '전체 기준(20장) 대비 부족분도 함께 계산된다',
  )
}

// --- 2단계: 곡선 생성 기준 충족 케이스 (연도별 3장 이상, 총 20장 이상) ----------

{
  const evaluation = evaluateCurveEligibility(sufficientCasePhotos)

  assertEqual(evaluation.eligible, true, '충족 케이스는 곡선 생성 대상이다')
  assertEqual(evaluation.meetsPerYearMinimum, true, '충족 케이스는 모든 연도가 3장 이상이다')
  assertEqual(evaluation.meetsTotalMinimum, true, '충족 케이스는 총 통과 사진이 20장 이상이다')
  assertEqual(evaluation.totalPassCount, 21, '총 통과 사진 수가 21장으로 집계된다')
  assertEqual(
    evaluation.yearlyPassCounts,
    [
      { year: 2024, passCount: 7 },
      { year: 2025, passCount: 8 },
      { year: 2026, passCount: 6 },
    ],
    '연도별 통과 장수가 정확히 집계된다',
  )

  const gap = findCurveEligibilityGap(sufficientCasePhotos)
  assertEqual(gap.eligible, true, '충족 케이스의 gap 결과도 eligible=true다')
  assertEqual(gap.yearlyShortfalls, [], '충족 케이스는 부족한 연도가 없다')
  assertEqual(gap.additionalTotalPassPhotosNeeded, 0, '충족 케이스는 추가로 필요한 장수가 없다')
}

// --- 경계 케이스: 연도별 기준은 만족하지만 총량이 부족한 경우 ---------------------

{
  const photos: Photo[] = [
    ...buildYearPhotos(2024, 3, 0, 'boundary'),
    ...buildYearPhotos(2025, 4, 0, 'boundary'),
  ]

  const evaluation = evaluateCurveEligibility(photos)
  assertEqual(evaluation.meetsPerYearMinimum, true, '경계 케이스는 연도별로는 기준을 만족한다')
  assertEqual(evaluation.totalPassCount, 7, '경계 케이스의 총 통과 사진은 7장이다')
  assertEqual(evaluation.eligible, false, '경계 케이스는 총량(20장) 미달로 곡선 생성 대상이 아니다')

  const gap = findCurveEligibilityGap(photos)
  assertEqual(gap.yearlyShortfalls, [], '경계 케이스는 연도별 부족분은 없다')
  assertEqual(gap.additionalTotalPassPhotosNeeded, CURVE_MIN_TOTAL_PASS_PHOTOS - 7, '총량 부족분만 남는다')
}

// --- 빈 입력 -----------------------------------------------------------------

{
  const evaluation = evaluateCurveEligibility([])
  assertEqual(evaluation.eligible, false, '통과 사진이 없으면 곡선 생성 대상이 아니다')
  assertEqual(evaluation.yearlyPassCounts, [], '통과 사진이 없으면 연도별 집계도 비어있다')
}

console.log(`\n${passedCount}개 검증 통과`)
