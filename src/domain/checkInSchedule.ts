/**
 * 관리 마커 등록 시점 기준으로 체크인 일정을 계산하는 순수 함수.
 * 실제 알림 발송(푸시) 연동과 화면 UI는 다루지 않고, 언제 체크인해야 하는지/
 * 재측정 권유를 다시 노출해도 되는지만 계산한다.
 * 시간 기준(now)을 항상 인자로 받아 순수 함수로 유지한다 (내부에서 현재 시각을 읽지 않는다).
 */
import type { CareMarker } from '../types/careMarker'
import type { CheckIn } from '../types/checkIn'

/** 마커 등록일 기준 체크인을 예약할 주차 */
export const CHECK_IN_OFFSET_WEEKS = [4, 8, 12]

/** 재측정 권유를 한 번 노출한 뒤 다시 노출하지 않는 기간(일) */
export const RE_MEASUREMENT_SUPPRESSION_DAYS = 7

const ONE_DAY_MS = 24 * 60 * 60 * 1000
const ONE_WEEK_MS = 7 * ONE_DAY_MS

/** ISO 날짜 문자열에 주 단위 오프셋을 더한 ISO 날짜 문자열을 반환한다 */
function addWeeks(dateIso: string, weeks: number): string {
  const baseTime = new Date(dateIso).getTime()
  return new Date(baseTime + weeks * ONE_WEEK_MS).toISOString()
}

/**
 * 관리 마커 등록일(marker.date) 기준 4주·8주·12주 후 체크인 예정 일정을 계산한다.
 * 아직 발송 전 상태이므로 sent/responded는 모두 false로 초기화해 반환한다.
 */
export function calculateCheckInSchedule(marker: CareMarker): CheckIn[] {
  return CHECK_IN_OFFSET_WEEKS.map((weeks) => ({
    markerId: marker.id,
    scheduledAt: addWeeks(marker.date, weeks),
    sent: false,
    responded: false,
  }))
}

export interface ReMeasurementSuppression {
  /** now 시점에 재측정 권유를 다시 노출하면 안 되는지 */
  suppressed: boolean
  /** 억제가 풀려 다시 노출 가능해지는 시각 (ISO 문자열) */
  suppressedUntil: string
}

/**
 * 재측정 권유를 마지막으로 노출한 시각(lastShownAt) 기준, now 시점에 다시 노출해도
 * 되는지와 억제가 풀리는 시각을 계산한다. 노출 이력이 없으면(lastShownAt이 null)
 * 억제할 이유가 없으므로 suppressed=false를 반환한다.
 */
export function calculateReMeasurementSuppression(
  lastShownAt: string | null,
  now: string,
): ReMeasurementSuppression {
  if (!lastShownAt) {
    return { suppressed: false, suppressedUntil: now }
  }

  const suppressedUntil = new Date(
    new Date(lastShownAt).getTime() + RE_MEASUREMENT_SUPPRESSION_DAYS * ONE_DAY_MS,
  ).toISOString()

  return {
    suppressed: new Date(now).getTime() < new Date(suppressedUntil).getTime(),
    suppressedUntil,
  }
}
