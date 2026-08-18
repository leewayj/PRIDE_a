/**
 * 해석 카드 문구가 명세서 4.2의 금지 표현 규칙을 지키는지 검증하는 순수 함수.
 * 실제 해석 카드 문구 생성(텍스트 생성) 자체는 백엔드 범위라 다루지 않고,
 * 이미 만들어진 문구 문자열을 입력받아 금지 표현 포함 여부만 판단한다.
 *
 * 아래 표현 목록은 이번 작업 지시에 예시로 주어진 항목을 그대로 옮긴 것이다("등"으로
 * 표시된 만큼 명세서 4.2 원문에는 더 있을 수 있어, 실제 반영 전 원문 대조가 필요하다).
 */

/** 절대 평가 표현 — 측정값이 아니라 단정적인 나이/점수처럼 들리는 표현 */
export const ABSOLUTE_EVALUATION_EXPRESSIONS = ['피부 나이', '노화 점수']

/** 미측정 항목 언급 — 이 앱이 실제로 측정하지 않는 항목 */
export const UNMEASURED_ITEM_EXPRESSIONS = ['모공', '탄력', '색소', '주름']

/** 의료적 판단 표현 — 의료 행위로 오인될 수 있는 표현 */
export const MEDICAL_JUDGMENT_EXPRESSIONS = ['진단', '치료', '효과 판정']

/** 공백 차이(예: "피부 나이" vs "피부나이")를 무시하고 비교하기 위한 정규화 */
function normalizeForMatch(value: string): string {
  return value.replace(/\s+/g, '')
}

function findMatchedExpressions(text: string, expressions: string[]): string[] {
  const normalizedText = normalizeForMatch(text)
  return expressions.filter((expression) => normalizedText.includes(normalizeForMatch(expression)))
}

/** "피부 나이", "노화 점수" 등 절대 평가 표현이 포함됐는지 검출한다 */
export function detectAbsoluteEvaluationExpressions(text: string): string[] {
  return findMatchedExpressions(text, ABSOLUTE_EVALUATION_EXPRESSIONS)
}

/** "모공", "탄력", "색소", "주름" 등 미측정 항목 언급을 검출한다 */
export function detectUnmeasuredItemExpressions(text: string): string[] {
  return findMatchedExpressions(text, UNMEASURED_ITEM_EXPRESSIONS)
}

/** "진단", "치료", "효과 판정" 등 의료적 판단 표현을 검출한다 */
export function detectMedicalJudgmentExpressions(text: string): string[] {
  return findMatchedExpressions(text, MEDICAL_JUDGMENT_EXPRESSIONS)
}

export type ForbiddenExpressionCategory = 'absolute-evaluation' | 'unmeasured-item' | 'medical-judgment'

export interface ForbiddenExpressionMatch {
  category: ForbiddenExpressionCategory
  expression: string
}

export interface InterpretationCardValidationResult {
  /** 금지 표현이 하나라도 감지되었는지 */
  hasForbiddenExpression: boolean
  /** 감지된 표현 전체 (카테고리 포함, 감지 순서대로) */
  matches: ForbiddenExpressionMatch[]
  /** 금지 표현이 감지되어 해석 카드를 재생성(재시도)해야 하는지 */
  needsRetry: boolean
}

/**
 * 해석 카드 문구에 명세서 4.2의 금지 표현(절대 평가 / 미측정 항목 언급 / 의료적 판단)이
 * 있는지 검증한다. 하나라도 감지되면 needsRetry=true를 반환해 문구를 다시 만들어야 함을 알린다.
 */
export function validateInterpretationCardText(text: string): InterpretationCardValidationResult {
  const matches: ForbiddenExpressionMatch[] = [
    ...detectAbsoluteEvaluationExpressions(text).map((expression) => ({
      category: 'absolute-evaluation' as const,
      expression,
    })),
    ...detectUnmeasuredItemExpressions(text).map((expression) => ({
      category: 'unmeasured-item' as const,
      expression,
    })),
    ...detectMedicalJudgmentExpressions(text).map((expression) => ({
      category: 'medical-judgment' as const,
      expression,
    })),
  ]

  return {
    hasForbiddenExpression: matches.length > 0,
    matches,
    needsRetry: matches.length > 0,
  }
}
