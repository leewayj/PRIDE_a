/**
 * checkInSchedule.ts에 대한 목데이터 기반 동작 확인 스크립트.
 * 테스트 러너 없이 `node src/domain/checkInSchedule.verify.ts`로 직접 실행한다.
 *
 * 2단계 목데이터(src/mocks/curveSufficientScenario.ts)의 CareMarker 3건과 동일한
 * id/등록일 구성을 재현해 검증한다. (그 파일은 확장자 없는 상대 경로로 다른 mock
 * 파일을 import하고 있어 번들러 없이 node로 직접 실행할 수 없기 때문에, 4/7단계
 * 작업 때와 마찬가지로 같은 값의 독립 픽스처를 사용한다.)
 */
import type { CareMarker } from '../types/careMarker'
import {
  RE_MEASUREMENT_SUPPRESSION_DAYS,
  calculateCheckInSchedule,
  calculateReMeasurementSuppression,
} from './checkInSchedule.ts'

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

// src/mocks/curveSufficientScenario.ts의 curveSufficientCareMarkers와 동일한 id/등록일 구성
const markers: CareMarker[] = [
  { id: 'marker-01', kind: '피부과 시술', date: '2025-01-05T00:00:00.000Z', rawText: '', registrationPath: 'chat' },
  { id: 'marker-02', kind: '홈케어 루틴 변경', date: '2025-07-15T00:00:00.000Z', rawText: '', registrationPath: 'manual' },
  { id: 'marker-03', kind: '피부과 시술', date: '2026-02-20T00:00:00.000Z', rawText: '', registrationPath: 'chat' },
]

// --- 1. 마커 등록일 기준 4주·8주·12주 후 체크인 일정 계산 ------------------------

{
  const schedule = calculateCheckInSchedule(markers[0])

  assertEqual(schedule.length, 3, 'marker-01은 체크인 3건(4/8/12주)을 생성한다')
  assertEqual(
    schedule.map((checkIn) => checkIn.scheduledAt),
    ['2025-02-02T00:00:00.000Z', '2025-03-02T00:00:00.000Z', '2025-03-30T00:00:00.000Z'],
    'marker-01의 체크인 예정일이 등록일(2025-01-05) 기준 4/8/12주 후로 정확히 계산된다',
  )
  assertEqual(
    schedule.every((checkIn) => checkIn.markerId === 'marker-01'),
    true,
    '모든 체크인이 marker-01에 연결된다',
  )
  assertEqual(
    schedule.every((checkIn) => checkIn.sent === false && checkIn.responded === false),
    true,
    '아직 발송 전이므로 sent/responded가 모두 false다',
  )
}

{
  const schedule = calculateCheckInSchedule(markers[1])
  assertEqual(
    schedule.map((checkIn) => checkIn.scheduledAt),
    ['2025-08-12T00:00:00.000Z', '2025-09-09T00:00:00.000Z', '2025-10-07T00:00:00.000Z'],
    'marker-02(2025-07-15 등록)의 체크인 예정일이 정확히 계산된다',
  )
}

{
  const schedule = calculateCheckInSchedule(markers[2])
  assertEqual(
    schedule.map((checkIn) => checkIn.scheduledAt),
    ['2026-03-20T00:00:00.000Z', '2026-04-17T00:00:00.000Z', '2026-05-15T00:00:00.000Z'],
    'marker-03(2026-02-20 등록)의 체크인 예정일이 정확히 계산된다',
  )
}

// --- 2. 재측정 권유 7일 재노출 제한 계산 ----------------------------------------

{
  const lastShownAt = '2026-08-01T00:00:00.000Z'

  const justAfter = calculateReMeasurementSuppression(lastShownAt, '2026-08-01T00:00:01.000Z')
  assertEqual(justAfter.suppressed, true, '노출 직후에는 재노출이 억제된다')

  const sixDaysLater = calculateReMeasurementSuppression(lastShownAt, '2026-08-06T23:59:59.000Z')
  assertEqual(sixDaysLater.suppressed, true, `${RE_MEASUREMENT_SUPPRESSION_DAYS}일이 지나기 전에는 계속 억제된다`)

  const exactlySevenDaysLater = calculateReMeasurementSuppression(lastShownAt, '2026-08-08T00:00:00.000Z')
  assertEqual(exactlySevenDaysLater.suppressed, false, '정확히 7일이 지나면 억제가 풀린다')
  assertEqual(exactlySevenDaysLater.suppressedUntil, '2026-08-08T00:00:00.000Z', '억제 해제 시각이 정확히 계산된다')

  const eightDaysLater = calculateReMeasurementSuppression(lastShownAt, '2026-08-09T00:00:00.000Z')
  assertEqual(eightDaysLater.suppressed, false, '7일이 지난 뒤에는 계속 억제되지 않는다')
}

{
  const neverShown = calculateReMeasurementSuppression(null, '2026-08-17T00:00:00.000Z')
  assertEqual(neverShown.suppressed, false, '노출 이력이 없으면 억제하지 않는다')
}

console.log(`\n${passedCount}개 검증 통과`)
