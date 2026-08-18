/**
 * 네비게이션 함수 3종에 대한 목데이터 기반 동작 확인 스크립트.
 * 테스트 러너 없이 `node src/navigation/navigation.verify.ts`로 직접 실행한다.
 *
 * 2단계 목데이터(곡선 생성 기준 미달/충족 케이스)와 동일한 연도별 통과 장수 구성을 재현해
 * 판정 분기 케이스를 검증한다. (src/mocks의 두 시나리오 파일은 확장자 없는 상대 경로로 서로
 * import하고 있어 번들러 없이 node로 직접 실행할 수 없기 때문에, 4단계 작업 때와 마찬가지로
 * 같은 수치의 독립 픽스처를 사용한다.)
 */
import type { Photo } from '../types/photo'
import {
  CHECK_IN_PATH,
  DATA_INSUFFICIENT_PATH,
  JUDGEMENT_SUMMARY_PATH,
  PHOTO_RESELECT_PATH,
} from './paths.ts'
import { navigateAfterJudgement } from './judgementNavigation.ts'
import { navigateOnCriticalPhotoRejection } from './photoReselectNavigation.ts'
import { navigateOnCheckInEntry } from './checkInNavigation.ts'

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

function createNavigateRecorder() {
  const calls: string[] = []
  const navigate = (path: string) => {
    calls.push(path)
  }
  return { navigate, calls }
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

function buildPhoto(overrides: Partial<Photo>): Photo {
  return {
    id: 'photo-1',
    fileName: 'IMG_1.jpg',
    capturedAt: new Date(Date.UTC(2026, 0, 1)).toISOString(),
    dateSource: 'exif-original',
    grade: 'pass',
    rejectionReasonCode: null,
    angle: 2,
    selfSimilarity: 0.95,
    sharpnessScore: 88,
    ...overrides,
  }
}

// src/mocks/curveInsufficientScenario.ts와 동일한 구성 (2023: 2장, 2024: 1장 통과 → 미달)
const insufficientCasePhotos: Photo[] = [
  ...buildYearPhotos(2023, 2, 3, 'insufficient'),
  ...buildYearPhotos(2024, 1, 2, 'insufficient'),
]

// src/mocks/curveSufficientScenario.ts와 동일한 구성 (2024/2025/2026: 7/8/6장 통과, 총 21장 → 충족)
const sufficientCasePhotos: Photo[] = [
  ...buildYearPhotos(2024, 7, 2, 'sufficient'),
  ...buildYearPhotos(2025, 8, 2, 'sufficient'),
  ...buildYearPhotos(2026, 6, 2, 'sufficient'),
]

// --- 1. 판정 완료 후 분기 (판정결과요약 / 데이터부족안내) ------------------------

{
  const { navigate, calls } = createNavigateRecorder()
  const path = navigateAfterJudgement(navigate, sufficientCasePhotos)

  assertEqual(path, JUDGEMENT_SUMMARY_PATH, '충족 케이스는 판정결과요약 경로를 반환한다')
  assertEqual(calls, [JUDGEMENT_SUMMARY_PATH], '충족 케이스는 판정결과요약으로 실제 navigate한다')
}

{
  const { navigate, calls } = createNavigateRecorder()
  const path = navigateAfterJudgement(navigate, insufficientCasePhotos)

  assertEqual(path, DATA_INSUFFICIENT_PATH, '미달 케이스는 데이터부족안내 경로를 반환한다')
  assertEqual(calls, [DATA_INSUFFICIENT_PATH], '미달 케이스는 데이터부족안내로 실제 navigate한다')
}

// --- 2. 얼굴검출 실패/동일인 오류 시 재선택 화면으로 이동 -------------------------

{
  const { navigate, calls } = createNavigateRecorder()
  const photo = buildPhoto({ grade: 'exclude', rejectionReasonCode: 'face-not-detected' })
  const path = navigateOnCriticalPhotoRejection(navigate, photo)

  assertEqual(path, PHOTO_RESELECT_PATH, '얼굴검출 실패는 재선택 경로를 반환한다')
  assertEqual(calls, [PHOTO_RESELECT_PATH], '얼굴검출 실패는 재선택 화면으로 실제 navigate한다')
}

{
  const { navigate, calls } = createNavigateRecorder()
  const photo = buildPhoto({ grade: 'exclude', rejectionReasonCode: 'identity-mismatch' })
  const path = navigateOnCriticalPhotoRejection(navigate, photo)

  assertEqual(path, PHOTO_RESELECT_PATH, '동일인 오류는 재선택 경로를 반환한다')
  assertEqual(calls, [PHOTO_RESELECT_PATH], '동일인 오류는 재선택 화면으로 실제 navigate한다')
}

{
  const { navigate, calls } = createNavigateRecorder()
  const photo = buildPhoto({ grade: 'exclude', rejectionReasonCode: 'low-sharpness' })
  const path = navigateOnCriticalPhotoRejection(navigate, photo)

  assertEqual(path, null, '얼굴검출/동일인 오류가 아니면 재선택으로 보내지 않는다')
  assertEqual(calls, [], '얼굴검출/동일인 오류가 아니면 navigate를 호출하지 않는다')
}

{
  const { navigate, calls } = createNavigateRecorder()
  const photo = buildPhoto({ grade: 'pass' })
  const path = navigateOnCriticalPhotoRejection(navigate, photo)

  assertEqual(path, null, '통과한 사진은 재선택으로 보내지 않는다')
  assertEqual(calls, [], '통과한 사진은 navigate를 호출하지 않는다')
}

// --- 3. 체크인 진입 시 구간 사진 존재 여부로 분기 --------------------------------

{
  const { navigate, calls } = createNavigateRecorder()
  const path = navigateOnCheckInEntry(navigate, [buildPhoto({ id: 'p1' })])

  assertEqual(path, CHECK_IN_PATH, '구간에 사진이 있으면 체크인 경로를 반환한다')
  assertEqual(calls, [CHECK_IN_PATH], '구간에 사진이 있으면 체크인 화면으로 실제 navigate한다')
}

{
  const { navigate, calls } = createNavigateRecorder()
  const path = navigateOnCheckInEntry(navigate, [])

  assertEqual(path, PHOTO_RESELECT_PATH, '구간에 사진이 없으면 사진업로드 경로를 반환한다')
  assertEqual(calls, [PHOTO_RESELECT_PATH], '구간에 사진이 없으면 사진업로드 화면으로 실제 navigate한다')
}

console.log(`\n${passedCount}개 검증 통과`)
