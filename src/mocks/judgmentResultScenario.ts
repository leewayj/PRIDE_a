/**
 * 판정 결과 시나리오 목데이터
 * 2019~2026년의 연도별 통과 사진과 조건부/제외 사진이 함께 있는 사례를 표현한다.
 */
import type { Photo, PhotoGrade } from '../types/photo'
import { MOCK_DATE_SOURCES, MOCK_REJECTION_REASON_CODES, isoDate, pad } from './shared'
import { summarizePhotoJudgement } from '../utils/photoJudgement.js'

export const JUDGMENT_RESULT_YEARLY_PASS_COUNTS = [
  { year: 2019, passCount: 14 },
  { year: 2020, passCount: 12 },
  { year: 2021, passCount: 3 },
  { year: 2022, passCount: 18 },
  { year: 2023, passCount: 21 },
  { year: 2024, passCount: 15 },
  { year: 2025, passCount: 19 },
  { year: 2026, passCount: 17 },
] as const

export const JUDGMENT_RESULT_PASS_COUNT = JUDGMENT_RESULT_YEARLY_PASS_COUNTS
  .reduce((sum, { passCount }) => sum + passCount, 0)
export const JUDGMENT_RESULT_CONDITIONAL_COUNT = 38
export const JUDGMENT_RESULT_EXCLUDE_COUNT = 55
export const JUDGMENT_RESULT_TOTAL_UPLOADED =
  JUDGMENT_RESULT_PASS_COUNT + JUDGMENT_RESULT_CONDITIONAL_COUNT + JUDGMENT_RESULT_EXCLUDE_COUNT

function metricsForGrade(
  grade: PhotoGrade,
  index: number,
): Pick<Photo, 'angle' | 'selfSimilarity' | 'sharpnessScore' | 'rejectionReasonCode'> {
  if (grade === 'pass') {
    return {
      angle: 1 + (index % 5),
      selfSimilarity: Number((0.93 + (index % 6) * 0.01).toFixed(2)),
      sharpnessScore: 82 + (index % 15),
      rejectionReasonCode: null,
    }
  }

  const reasonCode = MOCK_REJECTION_REASON_CODES[index % MOCK_REJECTION_REASON_CODES.length]

  if (grade === 'conditional') {
    return {
      angle: reasonCode === 'angle-out-of-range' ? 9 + (index % 4) : 4 + (index % 4),
      selfSimilarity: Number(
        (reasonCode === 'low-similarity' ? 0.78 + (index % 5) * 0.01 : 0.85 + (index % 5) * 0.01).toFixed(2),
      ),
      sharpnessScore: reasonCode === 'low-sharpness' ? 55 + (index % 10) : 70 + (index % 10),
      rejectionReasonCode: reasonCode,
    }
  }

  return {
    angle: reasonCode === 'angle-out-of-range' ? 20 + (index % 15) : 8 + (index % 10),
    selfSimilarity: Number(
      (reasonCode === 'low-similarity' ? 0.4 + (index % 20) * 0.01 : 0.7 + (index % 10) * 0.01).toFixed(2),
    ),
    sharpnessScore: reasonCode === 'low-sharpness' ? 20 + (index % 20) : 45 + (index % 20),
    rejectionReasonCode: reasonCode,
  }
}

function buildPhotos(grade: PhotoGrade, count: number, startIndex: number): Photo[] {
  return Array.from({ length: count }, (_, offset) => {
    const index = startIndex + offset
    const year = 2019 + (offset % JUDGMENT_RESULT_YEARLY_PASS_COUNTS.length)

    return {
      id: `judgment-${pad(index)}`,
      fileName: `IMG_${pad(index)}.jpg`,
      capturedAt: isoDate(year, (offset % 12) + 1, (offset % 27) + 1),
      dateSource: MOCK_DATE_SOURCES[index % MOCK_DATE_SOURCES.length],
      grade,
      ...metricsForGrade(grade, index),
    }
  })
}

const passPhotos = JUDGMENT_RESULT_YEARLY_PASS_COUNTS.flatMap(({ year, passCount }, yearIndex) => (
  Array.from({ length: passCount }, (_, offset): Photo => {
    const index = JUDGMENT_RESULT_YEARLY_PASS_COUNTS
      .slice(0, yearIndex)
      .reduce((sum, entry) => sum + entry.passCount, 0) + offset

    return {
      id: `judgment-${pad(index)}`,
      fileName: `IMG_${pad(index)}.jpg`,
      capturedAt: isoDate(year, (offset % 12) + 1, (offset % 27) + 1),
      dateSource: MOCK_DATE_SOURCES[index % MOCK_DATE_SOURCES.length],
      grade: 'pass',
      ...metricsForGrade('pass', index),
    }
  })
))

export const judgmentResultPhotos: Photo[] = [
  ...passPhotos,
  ...buildPhotos('conditional', JUDGMENT_RESULT_CONDITIONAL_COUNT, passPhotos.length),
  ...buildPhotos(
    'exclude',
    JUDGMENT_RESULT_EXCLUDE_COUNT,
    passPhotos.length + JUDGMENT_RESULT_CONDITIONAL_COUNT,
  ),
]

const summary = summarizePhotoJudgement(judgmentResultPhotos)

export const judgmentResultSummary = {
  totalUploaded: summary.totalCount,
  pass: summary.passCount,
  conditional: summary.conditionalCount,
  exclude: summary.excludeCount,
}
