/**
 * 판정 결과 시나리오 목데이터
 * 업로드 300장 중 통과 46장 / 조건부 54장 / 제외 200장인 사례를 표현한다.
 */
import type { Photo, PhotoGrade } from '../types/photo'
import { MOCK_DATE_SOURCES, MOCK_REJECTION_REASON_CODES, isoDate, pad } from './shared'

export const JUDGMENT_RESULT_TOTAL_UPLOADED = 300
export const JUDGMENT_RESULT_PASS_COUNT = 46
export const JUDGMENT_RESULT_CONDITIONAL_COUNT = 54
export const JUDGMENT_RESULT_EXCLUDE_COUNT =
  JUDGMENT_RESULT_TOTAL_UPLOADED - JUDGMENT_RESULT_PASS_COUNT - JUDGMENT_RESULT_CONDITIONAL_COUNT

const START_YEAR = 2022
const START_MONTH = 1
const STEP_DAYS = 5

function gradeAt(index: number): PhotoGrade {
  if (index < JUDGMENT_RESULT_PASS_COUNT) return 'pass'
  if (index < JUDGMENT_RESULT_PASS_COUNT + JUDGMENT_RESULT_CONDITIONAL_COUNT) return 'conditional'
  return 'exclude'
}

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

function capturedAtForIndex(index: number): string {
  const totalDays = index * STEP_DAYS
  const totalMonths = Math.floor(totalDays / 30)
  const day = (totalDays % 30) + 1
  const year = START_YEAR + Math.floor((START_MONTH - 1 + totalMonths) / 12)
  const month = ((START_MONTH - 1 + totalMonths) % 12) + 1
  return isoDate(year, month, day)
}

export const judgmentResultPhotos: Photo[] = Array.from(
  { length: JUDGMENT_RESULT_TOTAL_UPLOADED },
  (_, index) => {
    const grade = gradeAt(index)

    return {
      id: `judgment-${pad(index)}`,
      fileName: `IMG_${pad(index)}.jpg`,
      capturedAt: capturedAtForIndex(index),
      dateSource: MOCK_DATE_SOURCES[index % MOCK_DATE_SOURCES.length],
      grade,
      ...metricsForGrade(grade, index),
    }
  },
)

export const judgmentResultSummary = {
  totalUploaded: JUDGMENT_RESULT_TOTAL_UPLOADED,
  pass: JUDGMENT_RESULT_PASS_COUNT,
  conditional: JUDGMENT_RESULT_CONDITIONAL_COUNT,
  exclude: JUDGMENT_RESULT_EXCLUDE_COUNT,
}
