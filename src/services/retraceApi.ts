/**
 * RETRACE 백엔드 연결 전 사용할 Mock API.
 * 실제 네트워크 요청 없이 목데이터(src/mocks)를 그대로 돌려주며, 반환 타입은 모두
 * 1단계에서 정의한 도메인 타입(src/types)을 재사용한다.
 * 추후 실제 백엔드가 준비되면 각 함수 내부만 실제 fetch(...) 호출로 교체하면 되도록
 * 시그니처(입력 없음 · Promise 반환)를 실제 API 호출과 동일하게 맞췄다.
 * 화면 컴포넌트에서의 호출 연결은 다음 작업에서 진행한다.
 */
import type { Photo } from '../types/photo'
import type { MetricPoint } from '../types/metric'
import type { ChangePoint } from '../types/changePoint'
import type { CareMarker } from '../types/careMarker'
import type { CheckIn } from '../types/checkIn'
import { judgmentResultPhotos } from '../mocks/judgmentResultScenario'
import {
  curveSufficientCareMarkers,
  curveSufficientChangePoints,
  curveSufficientCheckIns,
  curveSufficientMetricPoints,
} from '../mocks/curveSufficientScenario'
import {
  careComparisonResults,
  type CareComparisonResult,
} from '../mocks/careEffectivenessScenario'

/**
 * 사진 판정 결과를 조회한다.
 * 실제 API: 예) GET /photos/judgement
 */
export function fetchPhotoJudgement(): Promise<Photo[]> {
  return Promise.resolve(judgmentResultPhotos)
}

export interface MetricCurveResult {
  metricPoints: MetricPoint[]
  changePoints: ChangePoint[]
}

/**
 * 지표 곡선(지표 값 추이 + 변화점)을 조회한다.
 * 실제 API: 예) GET /metrics/curve
 */
export function fetchMetricCurve(): Promise<MetricCurveResult> {
  return Promise.resolve({
    metricPoints: curveSufficientMetricPoints,
    changePoints: curveSufficientChangePoints,
  })
}

/**
 * 관리 마커 목록을 조회한다.
 * 실제 API: 예) GET /care-markers
 */
export function fetchCareMarkers(): Promise<CareMarker[]> {
  return Promise.resolve(curveSufficientCareMarkers)
}

/**
 * 관리 기록 ID에 연결된 프론트엔드 UI 개발용 비교 결과를 조회한다.
 * 실제 분석 API가 준비되면 이 함수의 데이터 소스만 교체한다.
 */
export function fetchCareComparisonResult(careMarkerId: string): Promise<CareComparisonResult | undefined> {
  return Promise.resolve(careComparisonResults.find((result) => result.careMarkerId === careMarkerId))
}

/**
 * 관리 마커에 대한 체크인 목록을 조회한다.
 * 실제 API: 예) GET /check-ins
 */
export function fetchCheckIns(): Promise<CheckIn[]> {
  return Promise.resolve(curveSufficientCheckIns)
}
