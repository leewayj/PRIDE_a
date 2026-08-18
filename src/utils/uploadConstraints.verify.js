/**
 * uploadConstraints.js에 대한 목데이터 기반 동작 확인 스크립트.
 * 테스트 러너 없이 `node src/utils/uploadConstraints.verify.js`로 직접 실행한다.
 */
import { PHOTO_FAILURE_CODE } from '../constants/photo.js'
import {
  YEAR_UPLOAD_MAX_COUNT,
  YEAR_UPLOAD_MIN_COUNT,
  excludePhotosWithoutCapturedDate,
  validateUpload,
  validateYearlyUploadCounts,
} from './uploadConstraints.js'

let passedCount = 0

function assertEqual(actual, expected, message) {
  const matches = JSON.stringify(actual) === JSON.stringify(expected)
  if (!matches) {
    throw new Error(
      `FAIL: ${message}\n  expected: ${JSON.stringify(expected)}\n  actual:   ${JSON.stringify(actual)}`,
    )
  }
  passedCount += 1
  console.log(`PASS: ${message}`)
}

function assertTrue(value, message) {
  assertEqual(Boolean(value), true, message)
}

let photoSequence = 0

function makePhoto(overrides = {}) {
  photoSequence += 1
  return {
    id: `photo-${photoSequence}`,
    fileName: `IMG_${photoSequence}.jpg`,
    fileSize: 1024,
    lastModified: 0,
    mimeType: 'image/jpeg',
    file: null,
    capturedAt: null,
    year: null,
    dateSource: null,
    analysisStatus: 'failed',
    failureCode: null,
    failureReason: null,
    analyzedAt: '',
    ...overrides,
  }
}

function makeSuccessPhoto(year) {
  return makePhoto({
    capturedAt: `${year}-06-01T00:00:00.000Z`,
    year,
    dateSource: 'exif-original',
    analysisStatus: 'success',
  })
}

function repeat(count, factory) {
  return Array.from({ length: count }, () => factory())
}

// --- validateYearlyUploadCounts -------------------------------------------

{
  const photos = [
    ...repeat(3, () => makeSuccessPhoto(2020)), // 최소 미달
    ...repeat(12, () => makeSuccessPhoto(2021)), // 정상 범위
    ...repeat(35, () => makeSuccessPhoto(2022)), // 최대 초과
  ]

  const results = validateYearlyUploadCounts(photos)
  const byYear = Object.fromEntries(results.map((result) => [result.year, result]))

  assertEqual(byYear[2020].status, 'too-few', '2020년(3장)은 최소 장수 미달로 판정된다')
  assertEqual(byYear[2020].valid, false, '2020년(3장)은 유효하지 않다')
  assertEqual(byYear[2020].shortBy, YEAR_UPLOAD_MIN_COUNT - 3, '2020년의 부족 수량이 정확히 계산된다')

  assertEqual(byYear[2021].status, 'valid', '2021년(12장)은 정상 범위로 판정된다')
  assertEqual(byYear[2021].valid, true, '2021년(12장)은 유효하다')

  assertEqual(byYear[2022].status, 'too-many', '2022년(35장)은 최대 장수 초과로 판정된다')
  assertEqual(byYear[2022].valid, false, '2022년(35장)은 유효하지 않다')
  assertEqual(byYear[2022].overBy, 35 - YEAR_UPLOAD_MAX_COUNT, '2022년의 초과 수량이 정확히 계산된다')

  assertEqual(results.map((result) => result.year), [2022, 2021, 2020], '연도 내림차순으로 정렬된다')
}

{
  const boundaryLow = validateYearlyUploadCounts(repeat(YEAR_UPLOAD_MIN_COUNT, () => makeSuccessPhoto(2019)))
  assertEqual(boundaryLow[0].status, 'valid', `최소 장수(${YEAR_UPLOAD_MIN_COUNT}장) 경계값은 유효하다`)

  const boundaryHigh = validateYearlyUploadCounts(repeat(YEAR_UPLOAD_MAX_COUNT, () => makeSuccessPhoto(2018)))
  assertEqual(boundaryHigh[0].status, 'valid', `최대 장수(${YEAR_UPLOAD_MAX_COUNT}장) 경계값은 유효하다`)
}

// --- excludePhotosWithoutCapturedDate --------------------------------------

{
  const withDate = makeSuccessPhoto(2023)
  const withoutDateWithReason = makePhoto({
    failureCode: PHOTO_FAILURE_CODE.DATE_NOT_FOUND,
    failureReason: '촬영 날짜를 확인할 수 없어요',
  })
  const withoutDateNoReasonYet = makePhoto() // failureCode/failureReason이 채워지기 전 상태 가정

  const { included, excluded } = excludePhotosWithoutCapturedDate([
    withDate,
    withoutDateWithReason,
    withoutDateNoReasonYet,
  ])

  assertEqual(included, [withDate], '촬영일이 있는 사진만 포함된다')
  assertEqual(excluded.length, 2, '촬영일이 없는 사진은 모두 제외된다')
  assertEqual(excluded[0].reason, '촬영 날짜를 확인할 수 없어요', '기록된 사유가 그대로 보존된다')
  assertTrue(typeof excluded[1].reason === 'string' && excluded[1].reason.length > 0, '사유가 없던 사진도 기본 사유가 채워진다')
  assertEqual(excluded[1].reasonCode, PHOTO_FAILURE_CODE.DATE_NOT_FOUND, '사유 코드가 없으면 date-not-found로 기본 처리된다')
}

// --- validateUpload (조합) ---------------------------------------------------

{
  const photos = [
    ...repeat(6, () => makeSuccessPhoto(2024)), // 유효
    ...repeat(2, () => makeSuccessPhoto(2025)), // 최소 미달
    makePhoto({ failureCode: PHOTO_FAILURE_CODE.DATE_NOT_FOUND, failureReason: '촬영 날짜를 확인할 수 없어요' }),
  ]

  const result = validateUpload(photos)

  assertEqual(result.included.length, 8, '촬영일 있는 사진만 연도별 검증 대상에 포함된다')
  assertEqual(result.excluded.length, 1, '촬영일 없는 사진 1장은 제외 목록에 기록된다')
  assertEqual(result.yearlyResults.length, 2, '연도별 결과는 2개(2024, 2025)만 생성된다')
  assertEqual(result.valid, false, '2025년이 최소 장수 미달이므로 전체 업로드는 유효하지 않다')
}

{
  const allValid = validateUpload(repeat(YEAR_UPLOAD_MIN_COUNT, () => makeSuccessPhoto(2026)))
  assertTrue(allValid.valid, '모든 연도가 조건을 만족하면 전체 업로드는 유효하다')

  const empty = validateUpload([])
  assertEqual(empty.valid, false, '연도별 데이터가 없으면 전체 업로드는 유효하지 않다')
}

console.log(`\n${passedCount}개 검증 통과`)
