/**
 * 지표 곡선을 생성할지 여부를 판정하는 순수 함수.
 * 실제 지표 계산(얼굴 폭 비율 등)은 백엔드 범위이므로 다루지 않으며,
 * 이미 판정(grade)까지 끝난 Photo 목록을 입력으로 받는다.
 */
import type { Photo } from '../types/photo'

/** 곡선에 반영되려면 연도당 최소 이만큼의 통과 사진이 필요하다 */
export const CURVE_MIN_PASS_PHOTOS_PER_YEAR = 3

/** 곡선을 생성하려면 전체 통과 사진이 최소 이만큼 필요하다 */
export const CURVE_MIN_TOTAL_PASS_PHOTOS = 20

export interface YearlyPassCount {
  year: number
  passCount: number
}

/** 통과(grade === 'pass') 사진만 연도별로 집계한다 (촬영일이 있는 연도만 포함) */
function countPassPhotosByYear(photos: Photo[]): YearlyPassCount[] {
  const countsByYear = new Map<number, number>()

  photos.forEach((photo) => {
    if (photo.grade !== 'pass') return
    const year = new Date(photo.capturedAt).getUTCFullYear()
    if (Number.isNaN(year)) return
    countsByYear.set(year, (countsByYear.get(year) ?? 0) + 1)
  })

  return [...countsByYear.entries()]
    .sort(([firstYear], [secondYear]) => firstYear - secondYear)
    .map(([year, passCount]) => ({ year, passCount }))
}

export interface CurveEligibilityResult {
  /** 두 조건을 모두 만족해야 true */
  eligible: boolean
  /** 통과 사진이 있는 연도별 집계 (연도 오름차순) */
  yearlyPassCounts: YearlyPassCount[]
  /** 전체 통과 사진 수 */
  totalPassCount: number
  /** 통과 사진이 있는 모든 연도가 연도당 최소 장수를 만족하는지 */
  meetsPerYearMinimum: boolean
  /** 전체 통과 사진 수가 최소 장수를 만족하는지 */
  meetsTotalMinimum: boolean
}

/**
 * 연도별 통과 사진 3장 이상, 총 통과 사진 20장 이상인지 판정한다.
 * 통과 사진이 있는 연도가 하나도 없으면(=데이터 없음) 미달로 판정한다.
 */
export function evaluateCurveEligibility(photos: Photo[]): CurveEligibilityResult {
  const yearlyPassCounts = countPassPhotosByYear(photos)
  const totalPassCount = yearlyPassCounts.reduce((sum, { passCount }) => sum + passCount, 0)

  const meetsPerYearMinimum =
    yearlyPassCounts.length > 0 &&
    yearlyPassCounts.every(({ passCount }) => passCount >= CURVE_MIN_PASS_PHOTOS_PER_YEAR)
  const meetsTotalMinimum = totalPassCount >= CURVE_MIN_TOTAL_PASS_PHOTOS

  return {
    eligible: meetsPerYearMinimum && meetsTotalMinimum,
    yearlyPassCounts,
    totalPassCount,
    meetsPerYearMinimum,
    meetsTotalMinimum,
  }
}

export interface YearlyCurveShortfall extends YearlyPassCount {
  /** 그 해에 곡선 반영 기준을 채우려면 더 필요한 통과 사진 수 */
  additionalPassPhotosNeeded: number
}

export interface CurveEligibilityGap {
  eligible: boolean
  totalPassCount: number
  /** 연도당 최소 장수(3장)에 못 미치는 연도별 부족분 */
  yearlyShortfalls: YearlyCurveShortfall[]
  /** 연도별 기준을 모두 채우더라도 총량(20장)에 못 미치면 남는 부족분 */
  additionalTotalPassPhotosNeeded: number
}

/**
 * 곡선 생성 기준 미달 시, 어떤 연도에 몇 장이 더 필요한지 계산한다.
 * 이미 기준을 충족하면 yearlyShortfalls는 빈 배열, additionalTotalPassPhotosNeeded는 0이다.
 */
export function findCurveEligibilityGap(photos: Photo[]): CurveEligibilityGap {
  const evaluation = evaluateCurveEligibility(photos)

  const yearlyShortfalls: YearlyCurveShortfall[] = evaluation.yearlyPassCounts
    .filter(({ passCount }) => passCount < CURVE_MIN_PASS_PHOTOS_PER_YEAR)
    .map(({ year, passCount }) => ({
      year,
      passCount,
      additionalPassPhotosNeeded: CURVE_MIN_PASS_PHOTOS_PER_YEAR - passCount,
    }))

  return {
    eligible: evaluation.eligible,
    totalPassCount: evaluation.totalPassCount,
    yearlyShortfalls,
    additionalTotalPassPhotosNeeded: Math.max(0, CURVE_MIN_TOTAL_PASS_PHOTOS - evaluation.totalPassCount),
  }
}
